import sqlite3
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

import pytest

from finance import (
    Bond,
    CreditCard,
    EntityType,
    ExpenseCategory,
    ExternalContact,
    FinanceRepository,
    FixedDeposit,
    IncomeCategory,
    LendingCategory,
    LiquidAccount,
    Mutualfund,
    MutualFundType,
    Other,
    Stock,
    Transaction,
    TransactionType,
    create_db,
)


@pytest.fixture
def repo(tmp_path):
    """Setup a fresh temporary database for every test."""
    db_file = tmp_path / "test_finance.db"
    schema_file = tmp_path / "schema.sql"

    # Ensure schema.sql is available (Assuming it's in your current directory)
    with open("schema.sql", "r") as f:
        schema_content = f.read()
    with open(schema_file, "w") as f:
        f.write(schema_content)

    create_db(str(db_file), str(schema_file))
    return FinanceRepository(str(db_file))


# --- 1. Entity Tests ---


def test_save_all_entity_types(repo):
    """Tests the 'save' dispatcher for every single entity class."""
    entities = [
        LiquidAccount(name="Bank", account_number_with_mask="1234"),
        CreditCard(name="Travel Card", card_number_with_mask="5555", limit=Decimal("50000")),
        Stock(
            symbol="AAPL",
            exchange="NASDAQ",
            average_price=Decimal("150.00"),
            quantity=10,
        ),
        Mutualfund(name="Index Fund", type=MutualFundType.INDEX, nav=Decimal("102.5")),
        FixedDeposit(
            fd_number_with_mask="FD1",
            bank_name="HDFC",
            principal_amount=Decimal("1000"),
            interest_rate=Decimal("7.1"),
            maturity_date=datetime.now(),
        ),
        Bond(
            isin="INE123",
            name="Gov Bond",
            coupon_rate=Decimal("8.0"),
            face_value=Decimal("1000"),
            maturity_date=datetime.now(),
        ),
        ExternalContact(name="John Doe", category=LendingCategory.PERSON),
        Other(name="Misc", tags=["tag1"]),
    ]

    for entity in entities:
        repo.save(entity)  # Tests the 'if isinstance' dispatcher

    # Verify the registry count
    conn = repo._get_connection()
    count = conn.execute("SELECT COUNT(*) FROM entity_registry").fetchone()[0]
    assert count == len(entities)
    conn.close()


def test_save_unknown_entity_raises_error(repo):
    """Tests the 'raise ValueError' in the save dispatcher."""
    with pytest.raises(ValueError, match="Unknown entity type"):
        repo.save("Just a string, not an entity")


# --- 2. Transaction Validation Tests ---


def test_transaction_negative_amount_fails():
    with pytest.raises(ValueError, match="Amount must be positive"):
        Transaction(
            uuid4(),
            uuid4(),
            Decimal("-1.0"),
            datetime.now(),
            TransactionType.INCOME,
            IncomeCategory.OTHER,
        )


def test_transaction_same_source_dest_fails():
    uid = uuid4()
    with pytest.raises(ValueError, match="Source and Destination entities cannot be the same"):
        Transaction(
            uid,
            uid,
            Decimal("100.0"),
            datetime.now(),
            TransactionType.INCOME,
            IncomeCategory.OTHER,
        )


def test_transaction_category_mismatch_fails():
    """Tests that you can't use an ExpenseCategory for an Income transaction."""
    with pytest.raises(TypeError, match="requires IncomeCategory, got ExpenseCategory"):
        Transaction(
            uuid4(),
            uuid4(),
            Decimal("100.0"),
            datetime.now(),
            TransactionType.INCOME,
            ExpenseCategory.FOOD,
        )


# --- 3. Database Integrity Tests ---


def test_atomic_rollback_on_failure(repo):
    """If the child table insert fails, the registry entry should not exist."""
    # Use a real UUID and a string/enum value for the type
    uid = uuid4()

    # We expect a sqlite3.Error because 'non_existent_table' doesn't exist
    with pytest.raises(sqlite3.Error):
        repo._register_and_insert(
            uid,
            "Fail",
            "Ref",
            EntityType.LIQUID_ACCOUNT,  # Pass the Enum directly
            "INSERT INTO non_existent_table VALUES (?)",
            (1,),
        )

    # Ensure registry is empty (Rollback check)
    conn = repo._get_connection()
    row = conn.execute("SELECT COUNT(*) FROM entity_registry WHERE uuid = ?", (str(uid),)).fetchone()
    assert row[0] == 0
    conn.close()


def test_add_transaction_to_db(repo):
    source = Other(name="Source")
    target = Other(name="Target")
    repo.save(source)
    repo.save(target)

    txn = Transaction(
        from_entities_id=source.uuid,
        to_entities_id=target.uuid,
        amount=Decimal("50.00"),
        transaction_datetime=datetime.now(),
        transaction_type=TransactionType.EXPENSE,
        transaction_category=ExpenseCategory.OTHER,
        description="Test Txn",
    )
    repo.save(txn)

    conn = repo._get_connection()
    row = conn.execute("SELECT * FROM transactions WHERE uuid = ?", (str(txn.uuid),)).fetchone()
    assert row["description"] == "Test Txn"
    assert row["amount"] == "50.00"
    conn.close()


def test_transaction_invalid_type_raises_value_error():
    """
    Forces the 'expected_enum_class is None' branch by passing
    a value that does not exist in TransactionType.
    """
    with pytest.raises(ValueError, match="does not contain correct transaction type"):
        Transaction(
            to_entities_id=uuid4(),
            from_entities_id=uuid4(),
            amount=Decimal("100.00"),
            transaction_datetime=datetime.now(),
            transaction_type="INVALID_TYPE",  # type: ignore
            transaction_category=IncomeCategory.OTHER,
        )
