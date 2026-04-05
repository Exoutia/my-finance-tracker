import sqlite3
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

import pytest

# Assuming your file is named finance.py and schemas.py is available
from finance import FinanceRepository, create_db
from schemas import (
    Bond,
    CreditCard,
    EntityType,
    ExternalContact,
    FixedDeposit,
    IncomeCategory,
    LendingCategory,
    LiquidAccount,
    Mutualfund,
    MutualFundType,
    Other,
    Stock,
    TransactionSchema,
    TransactionType,
)


@pytest.fixture
def db_setup(tmp_path):
    """Fixture to create a temporary database for each test."""
    db_path = tmp_path / "test_finance.db"
    # Ensure you have your schema.sql in the same directory or provide the path
    schema_path = Path(__file__).parent / Path("schema.sql")

    # Create the DB
    create_db(db_path, schema_path)
    return db_path


@pytest.fixture
def repo(db_setup):
    return FinanceRepository(db_setup)


def test_add_liquid_account(repo):
    acc = LiquidAccount(name="HDFC Savings", account_number_with_mask="XXXX1234", minimum_balance=Decimal("5000.00"))
    repo.save(acc)

    conn = repo._get_connection()
    reg = conn.execute("SELECT * FROM entity_registry WHERE uuid = ?", (str(acc.uuid),)).fetchone()
    detail = conn.execute("SELECT * FROM liquid_accounts WHERE uuid = ?", (str(acc.uuid),)).fetchone()
    conn.close()

    assert reg["name"] == "HDFC Savings"
    assert reg["table_name"] == "liquid_accounts"
    assert detail["account_number_mask"] == "XXXX1234"
    assert float(detail["minimum_balance"]) == 5000.0


def test_add_transaction_success(repo):
    u1, u2 = uuid4(), uuid4()
    conn = repo._get_connection()
    try:
        with conn:
            # Added 'account_reference' to the columns and values
            conn.execute(
                """INSERT INTO entity_registry
                   (uuid, name, table_name, entity_type, account_reference)
                   VALUES (?, ?, ?, ?, ?)""",
                (str(u1), "Source", "liquid_accounts", "LIQUID_ACCOUNT", "REF1"),
            )
            conn.execute(
                """INSERT INTO entity_registry
                   (uuid, name, table_name, entity_type, account_reference)
                   VALUES (?, ?, ?, ?, ?)""",
                (str(u2), "Dest", "liquid_accounts", "LIQUID_ACCOUNT", "REF2"),
            )
    finally:
        conn.close()

    conn = repo._get_connection()
    txn = TransactionSchema(
        to_entities_id=u2,
        from_entities_id=u1,
        amount=Decimal("150.00"),
        transaction_datetime=datetime.now(),
        transaction_type=TransactionType.INCOME,
        transaction_category=IncomeCategory.SALARY,
    )
    repo.save(txn)

    res = conn.execute("SELECT * FROM transactions WHERE uuid = ?", (str(txn.uuid),)).fetchone()
    assert float(res["amount"]) == 150.0
    assert res["transaction_type"] == "income"
    conn.close()


def test_add_stock(repo):
    stock = Stock(symbol="AAPL", exchange="NASDAQ", average_price=Decimal("150.50"), quantity=10)
    repo.save(stock)

    conn = repo._get_connection()
    res = conn.execute("SELECT * FROM stocks WHERE uuid = ?", (str(stock.uuid),)).fetchone()
    assert res["symbol"] == "AAPL"
    assert float(res["average_price"]) == 150.50
    conn.close()


def test_add_mutual_fund(repo):
    mf = Mutualfund(name="Vanguard 500", type=MutualFundType.INDEX, nav=Decimal("450.25"))
    repo.save(mf)

    conn = repo._get_connection()
    res = conn.execute("SELECT * FROM mutual_funds WHERE uuid = ?", (str(mf.uuid),)).fetchone()
    assert res["fund_type"] == "index"
    conn.close()


def test_add_fixed_deposit(repo):
    fd = FixedDeposit(
        fd_number_with_mask="FD123",
        bank_name="SBI",
        principal_amount=Decimal("100000"),
        interest_rate=Decimal("7.5"),
        maturity_date=datetime(2030, 1, 1),
    )
    repo.save(fd)

    conn = repo._get_connection()
    res = conn.execute("SELECT * FROM fixed_deposits WHERE uuid = ?", (str(fd.uuid),)).fetchone()
    assert res["bank_name"] == "SBI"
    conn.close()


def test_add_external_contact(repo):
    contact = ExternalContact(name="John Doe", category=LendingCategory.PERSON, is_institution=False)
    repo.save(contact)

    conn = repo._get_connection()
    res = conn.execute("SELECT * FROM external_contacts WHERE uuid = ?", (str(contact.uuid),)).fetchone()
    assert res["is_institution"] == 0
    conn.close()


def test_add_other_virtual_entity(repo):
    other = Other(name="Coffee Shop", tags=["food", "daily"], description="Morning coffee")
    repo.save(other)

    conn = repo._get_connection()
    res = conn.execute("SELECT * FROM virtual_entities WHERE uuid = ?", (str(other.uuid),)).fetchone()
    assert "food" in res["tags"]
    conn.close()


def test_add_credit_card_entity(repo):
    credit_card = CreditCard(name="Hunter Cards", card_number_with_mask="XXXX0001", limit=Decimal(200_000))
    repo.save(credit_card)

    conn = repo._get_connection()
    res = conn.execute("SELECT * FROM credit_cards where uuid = ?", (str(credit_card.uuid),)).fetchone()
    assert "XXXX0001" == res["card_number_mask"]
    conn.close()


def test_register_and_insert_specific_sql_failure_rollback(repo):
    """Test Branch: First insert OK, second fails. Verify Rollback."""
    entity_id = uuid4()
    # Intentionally bad SQL (column 'non_existent' doesn't exist)
    bad_sql = "INSERT INTO liquid_accounts (uuid, non_existent) VALUES (?, ?)"
    params = (str(entity_id), "Fail")

    with pytest.raises(sqlite3.Error):
        repo._register_and_insert(entity_id, "Rollback Test", "REF_FAIL", EntityType.LIQUID_ACCOUNT, bad_sql, params)

    # Verify Atomicity: The registry entry should NOT exist because the transaction rolled back
    conn = repo._get_connection()
    try:
        reg = conn.execute("SELECT * FROM entity_registry WHERE uuid=?", (str(entity_id),)).fetchone()
        assert reg is None, "Registry entry should have rolled back after specific SQL failure"
    finally:
        conn.close()


def test_bond_entity(repo):
    bond = Bond(
        name="Edelwiesss",
        coupon_rate=Decimal("10.00"),
        face_value=Decimal(100000),
        isin="128493819",
        maturity_date=datetime(year=2028, month=9, day=2),
    )
    repo.save(bond)

    conn = repo._get_connection()
    res = conn.execute("select * from bonds where uuid = ?", (str(bond.uuid),)).fetchone()
    assert "128493819" == res["isin"]
    conn.close()


def test_save_unknown_type_raises_error(repo):
    with pytest.raises(ValueError, match="Unknown entity type"):
        repo.save("Just a string")


def test_foreign_key_constraint(repo):
    # Testing that a transaction fails if entities don't exist
    txn = TransactionSchema(
        to_entities_id=uuid4(),
        from_entities_id=uuid4(),
        amount=Decimal("10.00"),
        transaction_datetime=datetime.now(),
        transaction_type=TransactionType.INCOME,
        transaction_category=IncomeCategory.OTHER,
    )
    with pytest.raises(sqlite3.IntegrityError):
        repo.save(txn)
