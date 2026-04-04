import json
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import StrEnum, auto, unique
from typing import Any, Type, Union
from uuid import UUID, uuid4


# --- Category Enums ---
@unique
class TransferCategory(StrEnum):
    OTHER = auto()
    SELF_TRANSFER = auto()


@unique
class ProvisionCategory(StrEnum):
    OTHER = auto()


@unique
class LendingCategory(StrEnum):
    PERSON = auto()
    COMPANY = auto()


@unique
class LoanCategory(StrEnum):
    PERSON = auto()
    COMPANY = auto()


@unique
class IncomeCategory(StrEnum):
    SALARY = auto()
    INTEREST = auto()
    DIVIDEND = auto()
    OTHER = auto()


@unique
class ExpenseCategory(StrEnum):
    RENT = auto()
    INSURANCE = auto()
    TRAVEL = auto()
    CHARITY = auto()
    FOOD = auto()
    BILL = auto()
    OTHER = auto()


@unique
class InvestmentCategory(StrEnum):
    BONDS = auto()
    MUTUAL_FUNDS = auto()
    FIXED_DEPOSIT = auto()
    STOCKS = auto()
    ASSET = auto()
    OTHER = auto()


@unique
class LendingRepaymentCategory(StrEnum):
    LOAN_INTEREST = auto()
    LOAN_REPAYMENT = auto()
    FULL_PAYMENT = auto()
    PART_PAYMENT = auto()
    OTHER = auto()


@unique
class LoanRepaymentCategory(StrEnum):
    LOAN_INTEREST = auto()
    LOAN_REPAYMENT = auto()
    FULL_PAYMENT = auto()
    PART_PAYMENT = auto()
    OTHER = auto()


@unique
class CreditCardExpenseCategory(StrEnum):
    RENT = auto()
    INSURANCE = auto()
    TRAVEL = auto()
    CHARITY = auto()
    FOOD = auto()
    BILL = auto()
    OTHER = auto()


@unique
class CreditCardRepaymentCategory(StrEnum):
    FULL_PAYMENT = auto()
    PART_PAYMENT = auto()
    INTEREST_PAYMENT = auto()
    OTHER = auto()


# --- Core Logic Enums ---


@unique
class TransactionType(StrEnum):
    TRANSFER = auto()
    EXPENSE = auto()
    INCOME = auto()
    PROVISION = auto()
    INVESTMENT = auto()
    LENDING = auto()
    LENDING_REPAYMENT = auto()
    LOAN = auto()
    LOAN_REPAYMENT = auto()
    CREDIT_CARD_LENDING = auto()
    CREDIT_CARD_REPAYMENT = auto()


@unique
class EntityType(StrEnum):
    LIQUID_ACCOUNT = auto()
    DEMAT_ACCOUNT = auto()
    STOCKS = auto()
    FIXED_DEPOSIT_ACCOUNT = auto()
    MUTUAL_FUND = auto()
    BONDS = auto()
    PERSON = auto()
    COMPANY = auto()
    OTHER = auto()
    CREDIT_CARD = auto()


class MutualFundType(StrEnum):
    EQUITY = auto()
    DEBT = auto()
    HYBRID = auto()
    ELSS = auto()
    INDEX = auto()


TransactionCategory = Union[
    IncomeCategory,
    ExpenseCategory,
    InvestmentCategory,
    LendingCategory,
    LoanCategory,
    LendingRepaymentCategory,
    LoanRepaymentCategory,
    CreditCardExpenseCategory,
    CreditCardRepaymentCategory,
    TransferCategory,
]


@dataclass(frozen=True)
class LiquidAccount:
    name: str
    account_number_with_mask: str
    uuid: UUID = field(default_factory=uuid4)
    minimum_balance: Decimal = Decimal("0.00")

    @property
    def entity_type(self):
        return EntityType.LIQUID_ACCOUNT


@dataclass(frozen=True)
class CreditCard:
    name: str
    card_number_with_mask: str
    limit: Decimal
    uuid: UUID = field(default_factory=uuid4)

    @property
    def entity_type(self):
        return EntityType.CREDIT_CARD


@dataclass(frozen=True)
class Mutualfund:
    name: str
    type: MutualFundType
    nav: Decimal | None
    uuid: UUID = field(default_factory=uuid4)

    @property
    def entity_type(self):
        return EntityType.MUTUAL_FUND


@dataclass(frozen=True)
class Stock:
    symbol: str  # e.g., "RELIANCE"
    exchange: str  # e.g., "NSE"
    average_price: Decimal
    quantity: int
    uuid: UUID = field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.STOCKS


@dataclass(frozen=True)
class FixedDeposit:
    fd_number_with_mask: str
    bank_name: str
    principal_amount: Decimal
    interest_rate: Decimal
    maturity_date: datetime
    uuid: UUID = field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.FIXED_DEPOSIT_ACCOUNT


@dataclass(frozen=True)
class Bond:
    isin: str  # International Securities Identification Number
    name: str
    coupon_rate: Decimal
    face_value: Decimal
    maturity_date: datetime
    uuid: UUID = field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.BONDS


@dataclass(frozen=True)
class ExternalContact:
    """Covers both PERSON, COMPANY"""

    name: str
    category: LendingCategory | LoanCategory
    is_institution: bool = False
    uuid: UUID = field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.COMPANY if self.is_institution else EntityType.PERSON


@dataclass(frozen=True)
class Other:
    """Covers the virtual category like travelling, upi_lite, eating,
    shops and every other expense that I am not sure
    happened and not able to create a different entity"""

    name: str
    tags: list[str | None] = field(default_factory=list)
    uuid: UUID = field(default_factory=uuid4)


@dataclass(frozen=True)
class EntityRegistry:
    """
    This acts as the master directory.
    'account_reference' points to the UUID of a specific LiquidAccount, CreditCard, etc.
    """

    name: str
    account_reference: UUID
    entity_type: EntityType
    uuid: UUID = field(default_factory=uuid4)


CategoryClass = Type[
    Union[
        IncomeCategory,
        ExpenseCategory,
        InvestmentCategory,
        LendingCategory,
        LoanCategory,
        LendingRepaymentCategory,
        LoanRepaymentCategory,
        CreditCardExpenseCategory,
        CreditCardRepaymentCategory,
        TransferCategory,
        ProvisionCategory,
    ]
]

TYPE_TO_ENUM: dict[TransactionType, CategoryClass] = {
    TransactionType.INCOME: IncomeCategory,
    TransactionType.EXPENSE: ExpenseCategory,
    TransactionType.INVESTMENT: InvestmentCategory,
    TransactionType.LENDING: LendingCategory,
    TransactionType.LOAN: LoanCategory,
    TransactionType.LENDING_REPAYMENT: LendingRepaymentCategory,
    TransactionType.LOAN_REPAYMENT: LoanRepaymentCategory,
    TransactionType.CREDIT_CARD_LENDING: CreditCardExpenseCategory,
    TransactionType.CREDIT_CARD_REPAYMENT: CreditCardRepaymentCategory,
    TransactionType.TRANSFER: TransferCategory,
    TransactionType.PROVISION: ProvisionCategory,
}


@dataclass(frozen=True)
class Transaction:
    to_entities_id: UUID
    from_entities_id: UUID
    amount: Decimal
    transaction_datetime: datetime
    transaction_type: TransactionType
    transaction_category: TransactionCategory
    description: str | None = None
    uuid: UUID = field(default_factory=uuid4)

    def __post_init__(self):
        if self.amount <= 0:
            raise ValueError(f"Amount must be positive. Got {self.amount}")

        if self.to_entities_id == self.from_entities_id:
            raise ValueError("Source and Destination entities cannot be the same.")

        self._validate_category_match()

    def _validate_category_match(self) -> None:
        expected_enum_class = TYPE_TO_ENUM.get(self.transaction_type)

        if expected_enum_class is None:
            raise ValueError(f"{TYPE_TO_ENUM} does not contain correct transaction type")

        if not isinstance(self.transaction_category, expected_enum_class):
            raise TypeError(
                f"Type '{self.transaction_type}' requires {expected_enum_class.__name__}, "
                f"got {type(self.transaction_category).__name__}."
            )


def create_db(db_path: str = "finance_db.sqlite", schema_path: str = "schema.sql"):
    with open(schema_path, "r") as f:
        sql_script = f.read()

    conn = sqlite3.connect(db_path)
    conn.executescript(sql_script)
    conn.close()
    print(f"Database {db_path} created with all entity tables.")


class FinanceRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        # Crucial for enforcing the relationships we defined in SQL
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def add_transaction(self, txn: Transaction):
        sql = """
            INSERT INTO transactions (
                uuid, from_entities_id, to_entities_id, amount,
                transaction_datetime, transaction_type,
                transaction_category, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            str(txn.uuid),
            str(txn.from_entities_id),
            str(txn.to_entities_id),
            str(txn.amount),
            txn.transaction_datetime.isoformat(),
            txn.transaction_type.value,
            txn.transaction_category.value,
            txn.description,
        )
        # Using 'with' on the connection handles the transaction
        # We then explicitly close it to stop the warning
        conn = self._get_connection()
        try:
            with conn:
                conn.execute(sql, params)
        finally:
            conn.close()

    def _register_and_insert(self, entity_uuid, name, ref, e_type, specific_sql, specific_params):
        type_val = e_type.value if hasattr(e_type, "value") else str(e_type)
        conn = self._get_connection()
        try:
            with conn:  # Handles COMMIT/ROLLBACK
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO entity_registry (uuid, name, account_reference, entity_type) VALUES (?, ?, ?, ?)",
                    (str(entity_uuid), name, ref, type_val),
                )
                cursor.execute(specific_sql, specific_params)
        except sqlite3.Error as e:
            print(f"Failed to add {type_val}: {e}")
            raise
        finally:
            conn.close()  # THIS stops the ResourceWarning

    # --- Entity Creation Methods ---

    def add_liquid_account(self, acc: LiquidAccount):
        sql = "INSERT INTO liquid_accounts (uuid, name, account_number_mask, minimum_balance) VALUES (?, ?, ?, ?)"
        params = (
            str(acc.uuid),
            acc.name,
            acc.account_number_with_mask,
            str(acc.minimum_balance),
        )
        self._register_and_insert(
            acc.uuid,
            acc.name,
            acc.account_number_with_mask,
            acc.entity_type,
            sql,
            params,
        )

    def add_credit_card(self, card: CreditCard):
        sql = "INSERT INTO credit_cards (uuid, name, card_number_mask, credit_limit) VALUES (?, ?, ?, ?)"
        params = (
            str(card.uuid),
            card.name,
            card.card_number_with_mask,
            str(card.limit),
        )
        self._register_and_insert(
            card.uuid,
            card.name,
            card.card_number_with_mask,
            card.entity_type,
            sql,
            params,
        )

    def add_stock(self, stock: Stock):
        sql = "INSERT INTO stocks (uuid, symbol, exchange, average_price, quantity) VALUES (?, ?, ?, ?, ?)"
        params = (
            str(stock.uuid),
            stock.symbol,
            stock.exchange,
            str(stock.average_price),
            stock.quantity,
        )
        self._register_and_insert(stock.uuid, stock.symbol, stock.symbol, stock.entity_type, sql, params)

    def add_mutual_fund(self, mf: Mutualfund):
        sql = "INSERT INTO mutual_funds (uuid, name, fund_type, nav) VALUES (?, ?, ?, ?)"
        params = (str(mf.uuid), mf.name, mf.type.value, str(mf.nav) if mf.nav else None)
        self._register_and_insert(mf.uuid, mf.name, "MF", mf.entity_type, sql, params)

    def add_fixed_deposit(self, fd: FixedDeposit):
        sql = """INSERT INTO fixed_deposits (uuid, fd_number_mask, bank_name, principal_amount,
                 interest_rate, maturity_date) VALUES (?, ?, ?, ?, ?, ?)"""
        params = (
            str(fd.uuid),
            fd.fd_number_with_mask,
            fd.bank_name,
            str(fd.principal_amount),
            str(fd.interest_rate),
            fd.maturity_date.isoformat(),
        )
        self._register_and_insert(
            fd.uuid,
            f"FD-{fd.fd_number_with_mask}",
            fd.fd_number_with_mask,
            fd.entity_type,
            sql,
            params,
        )

    def add_bond(self, bond: Bond):
        sql = """INSERT INTO bonds (uuid, isin, name, coupon_rate, face_value, maturity_date)
                 VALUES (?, ?, ?, ?, ?, ?)"""
        params = (
            str(bond.uuid),
            bond.isin,
            bond.name,
            str(bond.coupon_rate),
            str(bond.face_value),
            bond.maturity_date.isoformat(),
        )
        self._register_and_insert(bond.uuid, bond.name, bond.isin, bond.entity_type, sql, params)

    def add_external_contact(self, contract: ExternalContact):
        sql = "INSERT INTO external_contacts (uuid, name, category, is_institution) VALUES (?, ?, ?, ?)"
        params = (
            str(contract.uuid),
            contract.name,
            contract.category.value,
            1 if contract.is_institution else 0,
        )
        self._register_and_insert(contract.uuid, contract.name, "EXT", contract.entity_type, sql, params)

    def add_other_entity(self, other: Other):
        """Maps the 'Other' dataclass to the 'virtual_entities' table."""
        # Convert list of tags to a JSON string for storage
        tags_json = json.dumps(other.tags)
        sql = "INSERT INTO virtual_entities (uuid, name, tags) VALUES (?, ?, ?)"
        params = (str(other.uuid), other.name, tags_json)
        # Using EntityType.OTHER for the registry
        self._register_and_insert(other.uuid, other.name, "VIRTUAL", EntityType.OTHER, sql, params)

    # --- Unified Save Dispatcher ---
    def save(self, entity: Any):
        if isinstance(entity, LiquidAccount):
            return self.add_liquid_account(entity)
        if isinstance(entity, CreditCard):
            return self.add_credit_card(entity)
        if isinstance(entity, Stock):
            return self.add_stock(entity)
        if isinstance(entity, Mutualfund):
            return self.add_mutual_fund(entity)
        if isinstance(entity, FixedDeposit):
            return self.add_fixed_deposit(entity)
        if isinstance(entity, Bond):
            return self.add_bond(entity)
        if isinstance(entity, ExternalContact):
            return self.add_external_contact(entity)
        if isinstance(entity, Other):
            return self.add_other_entity(entity)
        if isinstance(entity, Transaction):
            return self.add_transaction(entity)
        raise ValueError(f"Unknown entity type: {type(entity)}")
