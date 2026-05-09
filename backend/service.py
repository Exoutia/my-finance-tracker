from uuid import UUID

import schemas
from models import (
    Bond,
    CreditCard,
    DematAccount,
    EntityRegistry,
    FixedDeposit,
    LiquidAccount,
    MutualFund,
    Stock,
    Transaction,
)
from sqlmodel import Session, select


class DBException(Exception):
    pass


class ServiceException(Exception):
    pass


def create_transaction(db: Session, transaction_data: schemas.TransactionCreate):
    try:
        new_transaction = Transaction.model_validate(transaction_data.model_dump())
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        return new_transaction
    except Exception as e:
        db.rollback()
        raise DBException from e


def get_all_transactions(offset: int, limit: int, db: Session):
    try:
        data = db.exec(select(Transaction).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_transaction_types_to_categories():
    try:
        data = {
            transaction_type.value: [category.value for category in category_enum]
            for transaction_type, category_enum in schemas.TYPE_TO_ENUM.items()
        }
        return data
    except Exception as e:
        raise ServiceException(e) from e


def _create_entity(db: Session, entity_create_data: schemas.EntityRegistryCreate) -> EntityRegistry:
    try:
        new_entity = EntityRegistry.model_validate(entity_create_data.model_dump())
        db.add(new_entity)
        db.flush()
        db.refresh(new_entity)
        return new_entity
    except Exception as e:
        raise DBException from e


def get_all_entities(offset: int, limit: int, db: Session):
    try:
        data = db.exec(select(EntityRegistry).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_entity_from_uuid(db: Session, item_uuid: UUID):
    data = db.exec(select(EntityRegistry).where(EntityRegistry.uuid == item_uuid)).first()
    return data


def get_dynamic_joined_data(db: Session, item_uuid: UUID):
    registry_entry = db.exec(select(EntityRegistry).where(EntityRegistry.uuid == item_uuid)).first()

    if not registry_entry:
        return None

    target_table_name = registry_entry.table_name

    if target_table_name not in EntityRegistry.metadata.tables:
        raise ValueError(f"Table {target_table_name} not found in metadata")

    target_table = EntityRegistry.metadata.tables[target_table_name]
    statement = (
        select(EntityRegistry, target_table)  # type: ignore
        .where(EntityRegistry.uuid == target_table.c.uuid)  # .c access columns
        .where(EntityRegistry.uuid == item_uuid)
    )

    result = db.exec(statement).first()

    if not result:
        return None

    row_dict = result._mapping

    registry_obj = row_dict[EntityRegistry]
    other_table = {}
    for i, v in row_dict.items():
        if i == "EntityRegistry":
            continue
        other_table[i] = v

    res = {"entity_registry": registry_obj, "other_table": other_table}
    return res


def create_liquid_account(db: Session, data: schemas.LiquidAccountCreate):
    entity_type = schemas.EntityType.LIQUID_ACCOUNT
    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}-{data.account_number[-4:]}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )

    entity = _create_entity(db, registry_data)

    new_account = LiquidAccount(
        uuid=entity.uuid, name=data.name, account_number=data.account_number, minimum_balance=data.minimum_balance
    )

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create account") from e


def create_stock(db: Session, data: schemas.StockCreate):
    entity_type = schemas.EntityType.STOCKS
    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}-{data.symbol}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = Stock(name=data.name, symbol=data.symbol, uuid=entity.uuid)

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create stock") from e


def create_bond(db: Session, data: schemas.BondCreate):
    entity_type = schemas.EntityType.STOCKS
    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}-{data.isin[-4:]}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = Bond(
        name=data.name,
        isin=data.isin,
        uuid=entity.uuid,
        face_value=data.face_value,
        maturity_date=data.maturity_date,
        coupon_interest_rate=data.coupon_interest_rate,
    )

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create stock") from e


def create_fixed_deposit(db: Session, data: schemas.FixedDepositCreate):
    entity_type = schemas.EntityType.FIXED_DEPOSIT_ACCOUNT
    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.bank_name}-{data.fd_identifier[-4:]}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = FixedDeposit(
        bank_name=data.bank_name,
        fd_identifier=data.fd_identifier,
        interest_rate=data.interest_rate,
        maturity_date=data.maturity_date,
        principal_amount=data.principal_amount,
        uuid=entity.uuid,
    )

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create stock") from e


def create_demat_account(db: Session, data: schemas.DematAccountCreate):
    entity_type = schemas.EntityType.DEMAT_ACCOUNT
    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}-{data.account_number[-4:]}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = DematAccount(
        name=data.name,
        account_number=data.account_number,
        depository_participant=data.depository_participant,
        dp_id=data.dp_id,
        uuid=entity.uuid,
    )

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create stock") from e


def create_mutual_fund(db: Session, data: schemas.MutualFundCreate):
    entity_type = schemas.EntityType.MUTUAL_FUND
    registry_data = schemas.EntityRegistryCreate(
        name=data.name,
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = MutualFund(name=data.name, type=data.type, uuid=entity.uuid)

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create stock") from e


def create_credit_card_entity(db: Session, data: schemas.CreditCardCreate):
    entity_type = schemas.EntityType.CREDIT_CARD
    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}-{data.card_number[-4:]}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = CreditCard(
        name=data.name,
        card_number=data.card_number,
        limit=data.limit,
        grace_period=data.grace_period,
        statement_date=data.statement_date,
        uuid=entity.uuid,
    )

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create stock") from e


def get_all_credit_card_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(CreditCard).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_mutual_fund_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(MutualFund).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_demat_account_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(DematAccount).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_fixed_deposit_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(FixedDeposit).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_bond_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(Bond).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_stock_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(Stock).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_liquid_accounts(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(LiquidAccount).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e
