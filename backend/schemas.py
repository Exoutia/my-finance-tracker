from datetime import datetime
from decimal import Decimal
from enum import StrEnum, auto, unique
from typing import Generic, List, Literal, Optional, TypeVar
from uuid import UUID

from models import EntityType, MutualFundType
from pydantic import BaseModel, Field, computed_field, field_validator, model_validator


@unique
class TransferCategory(StrEnum):
    OTHER = auto()
    SELF_TRANSFER = auto()


TableName = Literal[
    "liquid_accounts",
    "demat_accounts",
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
    EntityType.DEMAT_ACCOUNT: "demat_accounts",
    EntityType.CREDIT_CARD: "credit_cards",
    EntityType.STOCKS: "stocks",
    EntityType.MUTUAL_FUND: "mutual_funds",
    EntityType.FIXED_DEPOSIT_ACCOUNT: "fixed_deposits",
    EntityType.BONDS: "bonds",
    EntityType.PERSON: "external_contacts",
    EntityType.COMPANY: "external_contacts",
    EntityType.VIRTUAL_ENTITY: "virtual_entities",
}


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    items: list[T]


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
    account_number: str = Field(exclude=True)

    @computed_field
    @property
    def entity_name(self) -> str:
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
    account_number: str = Field(exclude=True)
    dp_id: str = Field(exclude=True)
    uuid: UUID

    class Config:
        from_attributes = True


class CreditCardBase(BaseModel):
    name: str
    card_number: str
    limit: Decimal = Field(gt=0)
    statement_date: int = Field(ge=1, le=31)
    grace_period: int = Field(default=20, ge=1)


# --- Create Schema ---
class CreditCardCreate(CreditCardBase):
    @field_validator("card_number")
    @classmethod
    def validate_card_number(cls, v: str) -> str:
        # Basic validation: ensure it's numeric and at least 4 digits
        if not v.replace("x", "").isdigit() or len(v) < 4:
            raise ValueError("Card number must be numeric and at least 4 digits long can include x for masking")
        return v


class CreditCardRead(CreditCardBase):
    id: int
    uuid: UUID
    card_number: str = Field(exclude=True)

    class Config:
        from_attributes = True

    @computed_field
    @property
    def display_name(self) -> str:
        # Formats the name as "Name - 1234"
        return f"{self.name} - {self.card_number[-4:]}"


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


class FixedDepositCreate(FixedDepositBase):
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
    unique_id: str = Field(..., description="International Securities Identification Number")
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

    name: str = Field(exclude=True)
    uuid: UUID

    @computed_field
    @property
    def display_name(self) -> str:
        return f"{self.name}-{self.unique_id[-4:]}"

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
        if v is not None and not v.replace("x", "").isdigit():
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


class EntityRegistryBase(BaseModel):
    name: str
    entity_type: EntityType


class EntityRegistryCreate(EntityRegistryBase):
    table_name: str


class EntityRegistryRead(EntityRegistryBase):
    uuid: UUID
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


class TransactionBase(BaseModel):
    to_entities_id: UUID
    from_entities_id: UUID
    amount: Decimal = Field(gt=0)
    description: Optional[str] = None
    transaction_datetime: datetime = Field(default_factory=datetime.now)


class TransactionCreate(TransactionBase):
    tags: List[str] = Field(default=[])

    @model_validator(mode="after")
    def validate_and_map_category(self) -> "TransactionCreate":
        if self.to_entities_id == self.from_entities_id:
            raise ValueError("Source and Destination entities cannot be the same.")

        return self


class TransactionRead(TransactionBase):
    uuid: UUID
    tags: List[TagRead] = []

    class Config:
        from_attributes = True


class TransactionWithNameRead(TransactionRead):
    to_entity: EntityRegistryRead
    from_entity: EntityRegistryRead


class EntityLiquidResponse(BaseModel):
    EntityRegistry: EntityRegistryRead
    LiquidAccount: LiquidAccountRead
