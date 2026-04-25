from datetime import datetime
from decimal import Decimal
from enum import StrEnum, auto, unique
from typing import List, Optional, Type, Union
from uuid import UUID

from models import EntityType, MutualFundType, TransactionType
from pydantic import BaseModel, Field, computed_field, field_validator, model_validator


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


class LiquidAccount(BaseModel):
    name: str
    account_number: str
    minimum_balance: Decimal = Field(ge=0, default=Decimal(0.00))

    @property
    def entity_type(self):
        return EntityType.LIQUID_ACCOUNT


class LiquidAccountCreate(LiquidAccount):
    pass


class LiquidAccountRead(LiquidAccount):
    id: int
    uuid: UUID

    @computed_field
    @property
    def display_name(self) -> str:
        suffix = self.account_number[-4:]
        return f"{self.name} - {suffix}"


class DematAccountBase(BaseModel):
    name: str = Field(..., description="Internal nickname for the account")
    account_number: str = Field(..., min_length=8, description="The unique demat account number")
    depository_participant: str = Field(..., description="The name of the broker or DP")
    dp_id: str = Field(..., description="The unique ID of the Depository Participant")


class DematAccountCreate(DematAccountBase):
    pass


class DematAccountRead(DematAccountBase):
    id: int
    uuid: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CreditCardBase(BaseModel):
    name: str
    card_number: str
    limit: Decimal = Field(gt=0)
    statement_date: int = Field(ge=1, le=31)
    grace_period: int = Field(default=20, ge=1)

    @field_validator("card_number")
    @classmethod
    def validate_card_number(cls, v: str) -> str:
        # Basic validation: ensure it's numeric and at least 4 digits
        if not v.isdigit() or len(v) < 4:
            raise ValueError("Card number must be numeric and at least 4 digits long")
        return v


# --- Create Schema ---
class CreditCardCreate(CreditCardBase):
    pass


class CreditCardRead(CreditCardBase):
    id: int
    uuid: UUID
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def display_name(self) -> str:
        # Formats the name as "Name - 1234"
        return f"{self.name} - {self.card_number[-4:]}"

    class Config:
        from_attributes = True


class MutualFundBase(BaseModel):
    name: str
    type: MutualFundType


class MutualFundCreate(MutualFundBase):
    pass


class MutualFundRead(MutualFundBase):
    id: int
    name: str
    uuid: UUID


class StockBase(BaseModel):
    symbol: str
    name: str


class StockCreate(StockBase):
    pass


class StockRead(StockBase):
    pass


class FixedDepositBase(BaseModel):
    bank_name: str
    fd_identifier: str
    principal_amount: Decimal
    interest_rate: Decimal
    maturity_date: datetime


class FixedDepositCreate(BaseModel):
    pass


class FixedDepositRead(FixedDepositBase):
    principal_amount: Decimal
    interest_rate: Decimal
    maturity_date: datetime

    @computed_field
    @property
    def display_name(self) -> str:
        return f"{self.bank_name} - {self.fd_identifier[-4:]}"

    class Config:
        from_attributes = True


class BondBase(BaseModel):
    isin: str = Field(..., min_length=12, max_length=12, description="International Securities Identification Number")
    name: str
    coupon_interest_rate: Decimal = Field(ge=0, description="Coupon rate as a decimal (e.g., 0.05 for 5%)")
    face_value: Decimal = Field(gt=0, description="The face value of the bond")
    maturity_date: datetime


class BondCreate(BondBase):
    """
    Used when creating a new Bond.
    """

    pass


# --- Read Schema (What the API returns) ---
class BondRead(BondBase):
    """
    Used when reading a Bond from the database.
    """

    id: int
    uuid: UUID

    @computed_field
    @property
    def display_name(self) -> str:
        return f"{self.name}-{self.isin[-4:]}"

    class Config:
        from_attributes = True


class ExternalContactBase(BaseModel):
    name: str
    tags: Optional[str] = None
    is_institution: bool = False
    mobile_number: Optional[str] = None
    description: Optional[str] = None

    @field_validator("mobile_number")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.replace("+", "").isdigit():
            raise ValueError("Mobile number must be numeric (can include '+')")
        return v


class ExternalContactCreate(ExternalContactBase):
    pass


class ExternalContactRead(ExternalContactBase):
    id: int
    uuid: UUID

    @computed_field
    @property
    def display_name(self) -> str:
        if self.mobile_number:
            return f"{self.name}-{self.mobile_number[-4:]}"
        else:
            return self.name

    class Config:
        from_attributes = True


# --- VirtualEntity Schemas ---


class VirtualEntityBase(BaseModel):
    name: str
    description: Optional[str] = ""


class VirtualEntityCreate(VirtualEntityBase):
    pass


class VirtualEntityRead(VirtualEntityBase):
    id: int
    uuid: UUID

    class Config:
        from_attributes = True


class TagRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    name: str


class EntityRegistryRead(BaseModel):
    uuid: UUID
    name: str
    entity_type: str
    table_name: str
    tags: List[TagRead] = []

    class Config:
        from_attributes = True


class StockTransactionInfoBase(BaseModel):
    units: int = Field(ge=1)
    avg_price: Decimal = Field(ge=0)
    exchange: str


class StockTransactionInfoRead(StockTransactionInfoBase):
    id: int
    transaction_id: UUID
    stock_id: UUID

    class Config:
        from_attributes = True


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


def get_category_enum(tx_type: TransactionType) -> Type[Union[...]]:
    """Helper to fetch the correct Enum class based on transaction type."""
    enum_cls = TYPE_TO_ENUM.get(tx_type)
    if not enum_cls:
        raise ValueError(f"'{tx_type}' is not a registered transaction type.")
    return enum_cls


class TransactionBase(BaseModel):
    to_entities_id: UUID
    from_entities_id: UUID
    amount: Decimal = Field(gt=0)
    transaction_type: TransactionType
    description: Optional[str] = None
    transaction_datetime: datetime = Field(default_factory=datetime.now)


class TransactionCreate(TransactionBase):
    category: str = Field(..., description="The sub-category string (e.g., 'groceries')")
    transaction_category: Optional[TransactionCategory] = Field(default=None, exclude=True)

    @model_validator(mode="after")
    def validate_and_map_category(self) -> "TransactionCreate":
        if self.to_entities_id == self.from_entities_id:
            raise ValueError("Source and Destination entities cannot be the same.")

        enum_class = get_category_enum(self.transaction_type)
        try:
            self.transaction_category = enum_class(self.category.lower())
        except ValueError as e:
            allowed = [member.value for member in enum_class]
            raise ValueError(
                f"Invalid category '{self.category}' for '{self.transaction_type}'. Must be one of: {allowed}"
            ) from e
        return self


class TransactionRead(TransactionBase):
    uuid: UUID
    transaction_category: str
    tags: List[TagRead] = []

    @field_validator("transaction_category", mode="before")
    @classmethod
    def format_category(cls, v) -> str:
        # If the DB has the Enum, return the value (string)
        return v.value if hasattr(v, "value") else str(v)

    class Config:
        from_attributes = True
