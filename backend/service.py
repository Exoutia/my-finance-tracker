from typing import List
from uuid import UUID

import schemas
from models import (
    Bond,
    CreditCard,
    DematAccount,
    EntityRegistry,
    ExternalContact,
    FixedDeposit,
    LiquidAccount,
    MutualFund,
    Stock,
    Tag,
    Transaction,
    VirtualEntity,
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import Session, func, select


class DBException(Exception):
    pass


class ServiceException(Exception):
    pass


class EntityValidationError(Exception):
    """Custom exception raised when database-dependent business rules fail."""

    pass


class EntityAlreadyExistsError(Exception):
    """Custom exception raised when already entity is present in entity registry"""

    pass


def is_active_entity(db: Session, id: UUID) -> bool:
    data = db.exec(select(EntityRegistry).where(EntityRegistry.active).where(EntityRegistry.uuid == id)).all()
    return True if data else False


def both_entities_are_active(db: Session, to_id: UUID, from_id: UUID) -> bool:
    # Query your database tracking active properties on selected keys
    to_active = is_active_entity(db, to_id)
    from_active = is_active_entity(db, from_id)
    return bool(to_active and from_active)


def create_transaction(db: Session, transaction_data: schemas.TransactionCreate):
    if not both_entities_are_active(db, transaction_data.to_entities_id, transaction_data.from_entities_id):
        raise EntityValidationError("Transaction rejected: Both target entities must be valid and active.")

    try:
        transaction_dict = transaction_data.model_dump(exclude={"tags"})
        new_transaction = Transaction.model_validate(transaction_dict)

        processed_tags = []
        for tag_name in transaction_data.tags:
            normalized_name = tag_name.strip().lower()
            if not normalized_name:
                continue

            existing_tag = db.exec(select(Tag).where(func.lower(Tag.name) == normalized_name)).first()

            if existing_tag:
                processed_tags.append(existing_tag)
            else:
                new_tag = Tag(name=tag_name.strip())
                db.add(new_tag)
                db.flush()
                processed_tags.append(new_tag)

        new_transaction.tags = processed_tags

        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        return new_transaction

    except Exception as e:
        db.rollback()
        raise DBException from e


def get_all_transactions(offset: int, limit: int, db: Session):
    try:
        data = db.exec(select(Transaction).where(Transaction.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_transactions_without_limit(db: Session):
    try:
        data = db.exec(select(Transaction).where(Transaction.active)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def _create_entity(db: Session, entity_create_data: schemas.EntityRegistryCreate) -> EntityRegistry:
    try:
        new_entity = EntityRegistry.model_validate(entity_create_data.model_dump())
        db.add(new_entity)
        db.flush()
        db.refresh(new_entity)
        return new_entity
    except IntegrityError as e:
        db.rollback()
        raise EntityAlreadyExistsError(f"A bond with unique ID '{entity_create_data.name}' already exists.") from e
    except Exception as e:
        raise DBException from e


def get_all_entities(offset: int, limit: int, db: Session):
    try:
        data = db.exec(select(EntityRegistry).where(EntityRegistry.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_entities_without_limit(db: Session):
    try:
        data = db.exec(select(EntityRegistry).where(EntityRegistry.active).order_by("id")).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_entities_paginated(db: Session, offset: int, limit: int):
    count_statement = select(func.count()).select_from(EntityRegistry).where(EntityRegistry.active)
    total_count = db.exec(count_statement).one()

    data_statement = select(EntityRegistry).where(EntityRegistry.active).order_by("id").offset(offset).limit(limit)
    items = db.exec(data_statement).all()

    return total_count, items


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
    entity_type = schemas.EntityType.BONDS
    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}-{data.unique_id[-4:]}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = Bond(
        name=data.name,
        unique_id=data.unique_id,
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
        raise DBException("Failed to create bond") from e


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
        raise DBException("Failed to create fixed deposit") from e


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
        raise DBException("Failed to create demat account") from e


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
        raise DBException("Failed to create mutual fund") from e


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
        raise DBException("Failed to create credit card entity") from e


def create_external_contact(db: Session, data: schemas.ExternalContactCreate):
    is_person = not data.is_institution
    if is_person:
        entity_type = schemas.EntityType.PERSON
    else:
        entity_type = schemas.EntityType.COMPANY

    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}-{data.mobile_number[-4:] if data.mobile_number else 'XXX-XXX-XXXX'}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = ExternalContact(
        name=data.name,
        description=data.description,
        is_institution=data.is_institution,
        mobile_number=data.mobile_number,
        uuid=entity.uuid,
        tags=data.tags,
    )

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create external contact") from e


def create_virtual_entity(db: Session, data: schemas.VirtualEntityCreate):
    entity_type = schemas.EntityType.VIRTUAL_ENTITY

    registry_data = schemas.EntityRegistryCreate(
        name=f"{data.name}",
        entity_type=entity_type,
        table_name=schemas.ENTITY_TYPE_TO_TABLE[entity_type],
    )
    entity = _create_entity(db, registry_data)

    new_account = VirtualEntity(name=data.name, description=data.description, uuid=entity.uuid)

    db.add(new_account)
    try:
        db.commit()
        db.refresh(new_account)
        return new_account
    except Exception as e:
        db.rollback()
        raise DBException("Failed to create external contact") from e


def get_all_virtual_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(VirtualEntity).where(VirtualEntity.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_external_contact(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(ExternalContact).where(ExternalContact.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_person_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(
            select(ExternalContact)
            .where(not ExternalContact.is_institution)
            .where(ExternalContact.active)
            .offset(offset)
            .limit(limit)
        ).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_company_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(
            select(ExternalContact)
            .where(ExternalContact.is_institution)
            .where(ExternalContact.active)
            .offset(offset)
            .limit(limit)
        ).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_credit_card_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(CreditCard).where(CreditCard.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_mutual_fund_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(MutualFund).where(MutualFund.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_demat_account_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(DematAccount).where(DematAccount.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_fixed_deposit_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(FixedDeposit).where(FixedDeposit.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_bond_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(Bond).where(Bond.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_stock_entity(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(Stock).where(Stock.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def get_all_liquid_accounts(db: Session, offset: int, limit: int):
    try:
        data = db.exec(select(LiquidAccount).where(LiquidAccount.active).offset(offset).limit(limit)).all()
        return data
    except Exception as e:
        raise DBException(e) from e


def bulk_insert_liquid_accounts(db: Session, items: list[schemas.LiquidAccountCreate]):
    """
    High-performance polymorphic bulk creation.
    Flushes parent records concurrently to skip recursive database round-trips.
    """
    entity_type = schemas.EntityType.LIQUID_ACCOUNT
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    staged_registries: list[EntityRegistry] = []
    staged_accounts: list[LiquidAccount] = []

    try:
        # STEP 1: Fast iteration to construct parent registry objects
        for item_data in items:
            suffix = item_data.account_number[-4:] if len(item_data.account_number) >= 4 else item_data.account_number
            registry_name = f"{item_data.name}-{suffix}"

            reg_entry = EntityRegistry(name=registry_name, entity_type=entity_type, table_name=table_name)
            staged_registries.append(reg_entry)
            db.add(reg_entry)

        # Emit a SINGLE bulk flush to generate UUID keys for all parent rows at once
        try:
            db.flush()
        except IntegrityError as e:
            db.rollback()
            # Catching naming constraints early across the payload array
            raise EntityAlreadyExistsError(
                "A record within this batch payload already exists in the entity registry."
            ) from e

        # STEP 2: Map newly allocated UUID keys directly to your LiquidAccount instances
        for index, item_data in enumerate(items):
            # No .refresh() needed! The staging flush populates this attribute automatically.
            assigned_uuid = staged_registries[index].uuid

            account_entry = LiquidAccount(
                uuid=assigned_uuid,
                name=item_data.name,
                account_number=item_data.account_number,
                minimum_balance=item_data.minimum_balance,
            )
            staged_accounts.append(account_entry)
            db.add(account_entry)

        # STEP 3: Atomic database commit execution
        db.commit()

        # Refresh only the final metadata structures returned to the API layer response model
        for account in staged_accounts:
            db.refresh(account)

        return staged_accounts

    except SQLAlchemyError as err:
        db.rollback()
        if not isinstance(err, EntityAlreadyExistsError):
            raise DBException("Bulk creation aborted due to database transaction constraints.") from err
        raise


def _bulk_create_base_registries(
    db: Session, item_names: List[str], entity_type: schemas.EntityType, table_name: str
) -> List[EntityRegistry]:
    """Helper macro to safely allocate structural parent IDs for tracking."""
    staged_registries = []
    for name in item_names:
        reg_entry = EntityRegistry(name=name, entity_type=entity_type, table_name=table_name)
        staged_registries.append(reg_entry)
        db.add(reg_entry)

    try:
        db.flush()
        return staged_registries
    except IntegrityError as e:
        db.rollback()
        raise EntityAlreadyExistsError(
            "Ingestion halted: One or more data record unique identifiers collide with existing indices."
        ) from e


def bulk_insert_credit_cards(db: Session, items: list[schemas.CreditCardCreate]) -> list[CreditCard]:
    entity_type = schemas.EntityType.CREDIT_CARD
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    names = [f"{i.name}-{i.card_number[-4:] if len(i.card_number) >= 4 else i.card_number}" for i in items]
    registries = _bulk_create_base_registries(db, names, entity_type, table_name)

    staged_records = []
    for idx, item in enumerate(items):
        record = CreditCard(
            uuid=registries[idx].uuid,
            name=item.name,
            card_number=item.card_number,
            limit=item.limit,
            grace_period=item.grace_period,
            statement_date=item.statement_date,
        )
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records


def bulk_insert_bonds(db: Session, items: list[schemas.BondCreate]) -> list[Bond]:
    entity_type = schemas.EntityType.BONDS
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    names = [f"{i.name}-{i.unique_id[-4:] if len(i.unique_id) >= 4 else i.unique_id}" for i in items]
    registries = _bulk_create_base_registries(db, names, entity_type, table_name)

    staged_records = []
    for idx, item in enumerate(items):
        record = Bond(
            uuid=registries[idx].uuid,
            name=item.name,
            unique_id=item.unique_id,
            face_value=item.face_value,
            maturity_date=item.maturity_date,
            coupon_interest_rate=item.coupon_interest_rate,
        )
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records


def bulk_insert_demat_accounts(db: Session, items: list[schemas.DematAccountCreate]) -> list[DematAccount]:
    entity_type = schemas.EntityType.DEMAT_ACCOUNT
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    names = [f"{i.name}-{i.account_number[-4:] if len(i.account_number) >= 4 else i.account_number}" for i in items]
    registries = _bulk_create_base_registries(db, names, entity_type, table_name)

    staged_records = []
    for idx, item in enumerate(items):
        record = DematAccount(
            uuid=registries[idx].uuid,
            name=item.name,
            account_number=item.account_number,
            depository_participant=item.depository_participant,
            dp_id=item.dp_id,
        )
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records


def bulk_insert_fixed_deposits(db: Session, items: list[schemas.FixedDepositCreate]) -> list[FixedDeposit]:
    entity_type = schemas.EntityType.FIXED_DEPOSIT_ACCOUNT
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    names = [f"{i.bank_name}-{i.fd_identifier[-4:] if len(i.fd_identifier) >= 4 else i.fd_identifier}" for i in items]
    registries = _bulk_create_base_registries(db, names, entity_type, table_name)

    staged_records = []
    for idx, item in enumerate(items):
        record = FixedDeposit(
            uuid=registries[idx].uuid,
            bank_name=item.bank_name,
            fd_identifier=item.fd_identifier,
            interest_rate=item.interest_rate,
            maturity_date=item.maturity_date,
            principal_amount=item.principal_amount,
        )
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records


def bulk_insert_mutual_funds(db: Session, items: list[schemas.MutualFundCreate]) -> list[MutualFund]:
    entity_type = schemas.EntityType.MUTUAL_FUND
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    names = [i.name for i in items]
    registries = _bulk_create_base_registries(db, names, entity_type, table_name)

    staged_records = []
    for idx, item in enumerate(items):
        record = MutualFund(uuid=registries[idx].uuid, name=item.name, type=item.type)
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records


def bulk_insert_stocks(db: Session, items: list[schemas.StockCreate]) -> list[Stock]:
    entity_type = schemas.EntityType.STOCKS
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    names = [f"{i.name}-{i.symbol}" for i in items]
    registries = _bulk_create_base_registries(db, names, entity_type, table_name)

    staged_records = []
    for idx, item in enumerate(items):
        record = Stock(uuid=registries[idx].uuid, name=item.name, symbol=item.symbol)
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records


def bulk_insert_external_contacts(db: Session, items: list[schemas.ExternalContactCreate]) -> list[ExternalContact]:
    staged_records = []
    staged_names = []

    # Process types dynamically because this endpoint manages both Person and Company types
    for item in items:
        entity_type = schemas.EntityType.PERSON if not item.is_institution else schemas.EntityType.COMPANY
        table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]
        suffix = item.mobile_number[-4:] if item.mobile_number else "XXX-XXX-XXXX"
        registry_name = f"{item.name}-{suffix}"

        reg_entry = EntityRegistry(name=registry_name, entity_type=entity_type, table_name=table_name)
        db.add(reg_entry)
        staged_names.append(reg_entry)

    try:
        db.flush()
    except IntegrityError as e:
        db.rollback()
        raise EntityAlreadyExistsError("A contact index collision was triggered across parent registry bounds.") from e

    for idx, item in enumerate(items):
        record = ExternalContact(
            uuid=staged_names[idx].uuid,
            name=item.name,
            description=item.description,
            is_institution=item.is_institution,
            mobile_number=item.mobile_number,
            tags=item.tags,
        )
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records


def bulk_insert_virtual_entities(db: Session, items: list[schemas.VirtualEntityCreate]) -> list[VirtualEntity]:
    entity_type = schemas.EntityType.VIRTUAL_ENTITY
    table_name = schemas.ENTITY_TYPE_TO_TABLE[entity_type]

    names = [i.name for i in items]
    registries = _bulk_create_base_registries(db, names, entity_type, table_name)

    staged_records = []
    for idx, item in enumerate(items):
        record = VirtualEntity(uuid=registries[idx].uuid, name=item.name, description=item.description)
        staged_records.append(record)
        db.add(record)

    db.commit()
    for r in staged_records:
        db.refresh(r)
    return staged_records
