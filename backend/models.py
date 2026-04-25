from datetime import datetime, timezone
from decimal import Decimal
from enum import StrEnum, auto, unique
from typing import List, Literal, Optional
from uuid import UUID, uuid4

from sqlalchemy import func
from sqlmodel import Field, Relationship, SQLModel

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


@unique
class MutualFundType(StrEnum):
    EQUITY = auto()
    DEBT = auto()
    HYBRID = auto()
    ELSS = auto()
    INDEX = auto()


class TimeStampMixin(SQLModel):
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False, sa_column_kwargs={"onupdate": func.now()}
    )


class LiquidAccount(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "liquid_accounts"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    name: str
    account_number: str
    minimum_balance: Decimal = Decimal("0.00")


class DematAccount(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "demat_accounts"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    name: str
    account_number: str
    depository_participant: str
    dp_id: str


class CreditCard(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "credit_cards"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    name: str
    card_number: str
    limit: Decimal
    statement_date: int = Field(ge=1, le=31)
    grace_period: int = Field(default=20, ge=1)


class MutualFund(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "mutual_funds"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    name: str
    type: MutualFundType


class FixedDeposit(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "fixed_deposits"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    fd_identifier: str
    bank_name: str
    principal_amount: Decimal
    interest_rate: Decimal
    maturity_date: datetime


class Bond(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "bonds"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    isin: str
    name: str
    coupon_interest_rate: Decimal
    face_value: Decimal
    maturity_date: datetime


class ExternalContact(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "external_contacts"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    name: str
    tags: str | None
    is_institution: bool = False
    mobile_number: str | None
    description: str | None


class VirtualEntity(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "virtual_entities"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    name: str
    description: Optional[str] = ""


class TransactionTagLink(TimeStampMixin, table=True):
    transaction_id: UUID = Field(foreign_key="transactions.uuid", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class EntityTagLink(SQLModel, table=True):
    entity_uuid: UUID = Field(foreign_key="entity_registry.uuid", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)

    transactions: List["Transaction"] = Relationship(back_populates="tags", link_model=TransactionTagLink)
    entities: List["EntityRegistry"] = Relationship(back_populates="tags", link_model=EntityTagLink)


class EntityRegistry(TimeStampMixin, SQLModel, table=True):
    """
    Central mapping table for all entities
    """

    __tablename__ = "entity_registry"

    id: int = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4)

    name: str = Field(unique=True)
    entity_type: EntityType
    table_name: str

    tags: List[Tag] = Relationship(back_populates="entities", link_model=EntityTagLink)


class Transaction(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "transactions"

    id: int = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4)

    from_entities_id: UUID = Field(foreign_key="entity_registry.uuid")
    to_entities_id: UUID = Field(foreign_key="entity_registry.uuid")
    amount: Decimal

    transaction_datetime: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    transaction_type: TransactionType
    transaction_category: str  # always store string
    tags: List[Tag] = Relationship(back_populates="transactions", link_model=TransactionTagLink)
    description: Optional[str] = None


class Stock(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "stocks"
    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(foreign_key="entity_registry.uuid")
    symbol: str
    name: str
    stock_transaction_info: List["StockTransactionInfo"] = Relationship(back_populates="stock")


class StockTransactionInfo(TimeStampMixin, SQLModel, table=True):
    __tablename__ = "stock_transaction_info"
    id: int | None = Field(default=None, primary_key=True)
    transaction_id: UUID = Field(foreign_key="transactions.uuid")
    stock_id: UUID = Field(foreign_key="stocks.uuid")
    units: int = Field(ge=1)
    avg_price: Decimal = Field(ge=0)
    exchange: str
    stock: "Stock" = Relationship(back_populates="stock_transaction_info")
