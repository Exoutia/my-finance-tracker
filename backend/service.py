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
