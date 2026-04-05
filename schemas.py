from datetime import datetime
from decimal import Decimal
from enum import StrEnum, auto, unique
from typing import List, Literal, Optional, Type, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, model_validator


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
    VIRTUAL_ENTITY = auto()
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
    ProvisionCategory,
]

TableName = Literal[
    "liquid_accounts",
    "credit_cards",
    "stocks",
    "mutual_funds",
    "fixed_deposits",
    "bonds",
    "external_contacts",
    "virtual_entities",
]

ENTITY_TYPE_TO_TABLE: dict[EntityType, TableName] = {
    EntityType.LIQUID_ACCOUNT: "liquid_accounts",
    EntityType.CREDIT_CARD: "credit_cards",
    EntityType.STOCKS: "stocks",
    EntityType.MUTUAL_FUND: "mutual_funds",
    EntityType.FIXED_DEPOSIT_ACCOUNT: "fixed_deposits",
    EntityType.BONDS: "bonds",
    EntityType.PERSON: "external_contacts",
    EntityType.COMPANY: "external_contacts",
    EntityType.VIRTUAL_ENTITY: "virtual_entities",
}


class LiquidAccount(BaseModel):
    name: str
    account_number_with_mask: str
    uuid: UUID = Field(default_factory=uuid4)
    minimum_balance: Decimal = Decimal("0.00")

    @property
    def entity_type(self):
        return EntityType.LIQUID_ACCOUNT


class CreditCard(BaseModel):
    name: str
    card_number_with_mask: str
    limit: Decimal
    uuid: UUID = Field(default_factory=uuid4)

    @property
    def entity_type(self):
        return EntityType.CREDIT_CARD


class Mutualfund(BaseModel):
    name: str
    type: MutualFundType
    nav: Decimal | None
    uuid: UUID = Field(default_factory=uuid4)

    @property
    def entity_type(self):
        return EntityType.MUTUAL_FUND


class Stock(BaseModel):
    symbol: str
    exchange: str
    average_price: Decimal
    quantity: int
    uuid: UUID = Field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.STOCKS


class FixedDeposit(BaseModel):
    fd_number_with_mask: str
    bank_name: str
    principal_amount: Decimal
    interest_rate: Decimal
    maturity_date: datetime
    uuid: UUID = Field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.FIXED_DEPOSIT_ACCOUNT


class Bond(BaseModel):
    isin: str  # International Securities Identification Number
    name: str
    coupon_rate: Decimal
    face_value: Decimal
    maturity_date: datetime
    uuid: UUID = Field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.BONDS


class ExternalContact(BaseModel):
    """Covers both PERSON, COMPANY"""

    name: str
    category: LendingCategory | LoanCategory
    is_institution: bool = False
    uuid: UUID = Field(default_factory=uuid4)

    @property
    def entity_type(self) -> EntityType:
        return EntityType.COMPANY if self.is_institution else EntityType.PERSON


class Other(BaseModel):
    """Covers the virtual category like travelling, upi_lite, eating,
    shops and every other expense that I am not sure
    happened and not able to create a different entity"""

    name: str
    description: str | None = ""
    tags: list[str | None] = Field(default_factory=list)
    uuid: UUID = Field(default_factory=uuid4)


class EntityRegistry(BaseModel):
    """
    This acts as the master directory.
    'account_reference' points to the UUID of a specific LiquidAccount, CreditCard, etc.
    """

    name: str
    account_reference: str
    entity_type: EntityType
    table_name: TableName
    uuid: UUID = Field(default_factory=uuid4)


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


class TransactionSchema(BaseModel):
    to_entities_id: UUID
    from_entities_id: UUID
    amount: Decimal
    transaction_datetime: datetime
    transaction_type: TransactionType
    transaction_category: TransactionCategory
    description: Optional[str] = None
    uuid: UUID = Field(default_factory=uuid4)

    @model_validator(mode="after")
    def validate_transaction_logic(self) -> "TransactionSchema":
        if self.amount <= 0:
            raise ValueError(f"Amount must be positive. Got {self.amount}")

        if self.to_entities_id == self.from_entities_id:
            raise ValueError("Source and Destination entities cannot be the same.")

        expected_class = TYPE_TO_ENUM.get(self.transaction_type)
        if not expected_class:
            raise ValueError(f"No mapping found for type {self.transaction_type}")

        if not isinstance(self.transaction_category, expected_class):
            raise TypeError(
                f"Type '{self.transaction_type}' requires {expected_class.__name__}, "
                f"got {type(self.transaction_category).__name__}."
            )

        return self


class EntityCreateBase(BaseModel):
    name: str


class LiquidAccountCreate(EntityCreateBase):
    account_number_with_mask: str
    minimum_balance: Decimal = Decimal("0.00")


class CreditCardCreate(EntityCreateBase):
    card_number_with_mask: str
    limit: Decimal


class StockCreate(BaseModel):
    symbol: str
    exchange: str
    average_price: Decimal
    quantity: int


class MutualFundCreate(EntityCreateBase):
    type: MutualFundType
    nav: Optional[Decimal] = None


class FixedDepositCreate(BaseModel):
    fd_number_with_mask: str
    bank_name: str
    principal_amount: Decimal
    interest_rate: Decimal
    maturity_date: datetime


class BondCreate(EntityCreateBase):
    isin: str
    coupon_rate: Decimal
    face_value: Decimal
    maturity_date: datetime


class ExternalContactCreate(EntityCreateBase):
    category: LendingCategory | LoanCategory
    is_institution: bool = False


class OtherEntityCreate(EntityCreateBase):
    tags: List[str | None] = []
    description: str | None = ""


class TransactionCreate(BaseModel):
    to_entities_id: UUID
    from_entities_id: UUID
    amount: Decimal = Field(gt=0)
    transaction_datetime: datetime = Field(default_factory=datetime.now)
    transaction_type: TransactionType
    category: str
    # Use Optional because it's not in the initial input
    transaction_category: TransactionCategory = Field(ExpenseCategory.OTHER, exclude=True, repr=False)
    description: Optional[str] = None

    @model_validator(mode="after")
    def validate_and_map_category(self) -> "TransactionCreate":
        enum_class = TYPE_TO_ENUM.get(self.transaction_type)

        if not enum_class:
            raise ValueError(f"'{self.transaction_type}' is not a registered transaction type.")

        try:
            actual_category_enum = enum_class(self.category.lower())
            self.transaction_category = actual_category_enum

        except ValueError:
            allowed = [member.value for member in enum_class]
            raise ValueError(
                f"Invalid category '{self.category}' for type '{self.transaction_type}'. Must be one of: {allowed}"
            ) from None

        return self
