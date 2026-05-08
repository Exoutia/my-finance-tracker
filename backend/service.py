from uuid import UUID

import schemas
from models import EntityRegistry, LiquidAccount, Transaction
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


def get_all_liquid_accounts(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(LiquidAccount).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


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


def get_all_entities(offset: int, limit: int, db: Session):
    try:
        data = db.exec(select(EntityRegistry).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def _create_entity(db: Session, entity_create_data: schemas.EntityRegistryCreate):
    try:
        new_entity = EntityRegistry.model_validate(entity_create_data.model_dump())
        db.add(new_entity)
        db.flush()
        db.refresh(new_entity)
        return new_entity
    except Exception as e:
        raise DBException from e


def get_entity_from_uuid(db: Session, item_uuid: UUID):
    data = db.exec(
        select(EntityRegistry, LiquidAccount)
        .where(EntityRegistry.uuid == LiquidAccount.uuid)
        .where(EntityRegistry.uuid == item_uuid)
    ).first()
    return data


def get_dynamic_joined_data(db: Session, item_uuid: UUID):
    # 1. Fetch the registry entry first to get the table name
    registry_entry = db.exec(select(EntityRegistry).where(EntityRegistry.uuid == item_uuid)).first()

    if not registry_entry:
        return None

    # 2. Look up the table object dynamically from metadata
    # registry_entry.table_name must match the __tablename__ in your classes
    target_table_name = registry_entry.table_name

    if target_table_name not in EntityRegistry.metadata.tables:
        raise ValueError(f"Table {target_table_name} not found in metadata")

    target_table = EntityRegistry.metadata.tables[target_table_name]
    print(target_table)
    statement = (
        select(EntityRegistry, target_table)
        .where(EntityRegistry.uuid == target_table.c.uuid)  # .c access columns
        .where(EntityRegistry.uuid == item_uuid)
    )

    result = db.exec(statement).first()

    if not result:
        return None

    # Access by 'mapping' to get dictionary-like access to the row
    row_dict = result._mapping

    # 1. Get the EntityRegistry object (the first element of the select)
    registry_obj = row_dict[EntityRegistry]

    # 2. Convert registry object to a dict
    response = registry_obj.model_dump()

    # 3. Add all columns from the dynamic table
    # We filter out the 'uuid' or 'id' if you don't want duplicates
    for column_name, value in row_dict.items():
        if column_name not in response:  # Don't overwrite base registry data
            response[column_name] = value

    return response


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
