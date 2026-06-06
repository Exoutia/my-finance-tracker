import codecs
import csv
from typing import Annotated, Any, Callable, Dict, List, Type
from uuid import UUID

import schemas
import service
import uvicorn
from config import settings
from db import create_db_and_tables, get_session
from fastapi import Depends, FastAPI, File, HTTPException, Query, Request, UploadFile, status
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from sqlmodel import Session


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        create_db_and_tables()
    except Exception as e:
        raise e

    yield


app = FastAPI(debug=settings.DEBUG, lifespan=lifespan, title="Finance Tracker API")

# --- 3. Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches any error not explicitly handled in routes."""
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "type": type(exc).__name__},
    )


@app.exception_handler(service.EntityAlreadyExistsError)
async def entity_already_exists_exception_handler(request: Request, exc: service.EntityAlreadyExistsError):
    return JSONResponse(
        status_code=409,
        content={
            "detail": str(exc)
            if str(exc)
            else "Entity already exists. Please choose a different name or unique identifier.",
            "type": "EntityAlreadyExistsError",
        },
    )


SessionDep = Annotated[Session, Depends(get_session)]
FileDep = Annotated[UploadFile, File(...)]


@app.get("/")
def server_running():
    return {"response": "server is running fine"}


@app.get("/transactions", response_model=list[schemas.TransactionRead])
def get_all_transaction(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_transactions(offset, limit, session)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/transactions/all", response_model=list[schemas.TransactionWithNameRead])
def get_all_transaction_without_limit(session: SessionDep):
    try:
        data = service.get_all_transactions_without_limit(session)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/transactions", response_model=schemas.TransactionRead)
def create_transaction(session: SessionDep, data: schemas.TransactionCreate):
    try:
        data = service.create_transaction(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/entities", response_model=list[schemas.EntityRegistryRead])
def get_all_entities(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_entities(offset, limit, session)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/entities/all", response_model=list[schemas.EntityRegistryRead])
def get_all_entities_without_limit(session: SessionDep):
    try:
        data = service.get_all_entities_without_limit(session)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/entities/validate")
def is_valid_entity(session: SessionDep, id: UUID):
    try:
        data = service.is_active_entity(session, id)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/entities/paginated", response_model=schemas.PaginatedResponse[schemas.EntityRegistryRead])
def get_liquid_accounts_paginated(
    session: SessionDep,
    offset: int = 0,
    limit: int = Query(default=10, le=100),  # Lower default is better for standard UI pages
):
    try:
        # Calls the dual-query service logic
        total_count, items = service.get_all_entities_paginated(session, offset, limit)

        return {"total": total_count, "items": items}
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/entities/entity-types")
def get_entity_type():
    try:
        return [i for i in schemas.EntityType]
    except Exception as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/liquid-accounts", response_model=schemas.LiquidAccountRead)
def create_liquid_account(session: SessionDep, data: schemas.LiquidAccountCreate):
    try:
        data = service.create_liquid_account(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/liquid-accounts", response_model=list[schemas.LiquidAccountRead])
def get_all_liquid_accounts(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_liquid_accounts(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/stocks", response_model=schemas.StockRead)
def create_stock_entity(session: SessionDep, data: schemas.StockCreate):
    try:
        data = service.create_stock(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/stocks", response_model=list[schemas.StockRead])
def get_all_stock_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_stock_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/bonds", response_model=schemas.BondRead)
def create_bond_entity(session: SessionDep, data: schemas.BondCreate):
    try:
        data = service.create_bond(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/bonds", response_model=list[schemas.BondRead])
def get_all_bond_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_bond_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/fixed-deposits", response_model=schemas.FixedDepositRead)
def create_fixed_deposit(session: SessionDep, data: schemas.FixedDepositCreate):
    try:
        data = service.create_fixed_deposit(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/fixed-deposits", response_model=list[schemas.FixedDepositRead])
def get_all_fixed_deposit_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_fixed_deposit_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/demat-accounts", response_model=schemas.DematAccountRead)
def create_demat_acccount(session: SessionDep, data: schemas.DematAccountCreate):
    try:
        data = service.create_demat_account(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/demat-accounts", response_model=list[schemas.DematAccountRead])
def get_all_demat_account_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_demat_account_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/credit-cards", response_model=schemas.CreditCardRead)
def create_credit_card_entity(session: SessionDep, data: schemas.CreditCardCreate):
    try:
        data = service.create_credit_card_entity(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/credit-cards", response_model=list[schemas.CreditCardRead])
def get_all_credit_card_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_credit_card_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/external-contacts", response_model=schemas.ExternalContactRead)
def create_external_contact(session: SessionDep, data: schemas.ExternalContactCreate):
    try:
        data = service.create_external_contact(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/external-contacts", response_model=list[schemas.ExternalContactRead])
def get_all_external_contact(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_external_contact(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/external-contact/persons", response_model=list[schemas.ExternalContactRead])
def get_all_person_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_person_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/external-contact/companies", response_model=list[schemas.ExternalContactRead])
def get_all_company_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_company_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/virtual-entities", response_model=schemas.VirtualEntityRead)
def create_virutal_entity(session: SessionDep, data: schemas.VirtualEntityCreate):
    try:
        data = service.create_virtual_entity(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/virtual-entities", response_model=list[schemas.VirtualEntityRead])
def get_all_virtual_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_virtual_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/mutual-funds", response_model=schemas.MutualFundRead)
def create_mutual_fund(session: SessionDep, data: schemas.MutualFundCreate):
    try:
        data = service.create_mutual_fund(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/mutual-funds", response_model=list[schemas.MutualFundRead])
def get_all_mutual_fund_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_mutual_fund_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/entities/{item_uuid}", response_model=schemas.EntityRegistryRead)
def get_entity_from_uuid(session: SessionDep, item_uuid: UUID):
    try:
        data = service.get_entity_from_uuid(session, item_uuid)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


# Global Security & Threshold Configuration Boundaries
MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # Strict 2MB File Cap
MAX_ROW_CEILING = 1000  # Maximum rows allowed in a single batch file
ALLOWED_MIME_TYPES = ["text/csv", "application/vnd.ms-excel"]


def sanitize_csv_cell(value: str) -> Any:
    """Neutralize formula symbols to immunize the dataset against CSV Injection attacks."""
    stripped = value.strip()
    if stripped.startswith(("=", "+", "-", "@")):
        return f"'{stripped}'"
    return stripped


async def process_bulk_csv_payload(
    file: UploadFile,
    schema_model: Type[BaseModel],
    expected_fields: set[str],
    bulk_insert_fn: Callable[[Session, List[Any]], List[Any]],
    session: Session,
) -> List[Any]:
    """
    Polymorphic core parser pipeline processing security validations,
    data type constraints parsing, and calling custom transactional services.
    """
    # 1. Enforce MIME Security Boundaries
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file format. System strictly accepts standard UTF-8 CSV streams.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File wrapper exceeds max allowed limit of {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.",
        )

    # 2. Decode Text Content Safely
    csv_text_generator = codecs.iterdecode(file_bytes.splitlines(), "utf-8")
    reader = csv.DictReader(csv_text_generator)

    # 3. Structural Header Mapping Inspection
    if not reader.fieldnames or not expected_fields.issubset(set(reader.fieldnames)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template formatting. Header must contain fields: {', '.join(expected_fields)}",
        )

    validated_instances: List[Any] = []
    row_counter = 0

    # 4. Stream Validation & Sanitization Loop
    for row in reader:
        row_counter += 1

        if row_counter > MAX_ROW_CEILING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bulk payload processing limit reached. Max limit is {MAX_ROW_CEILING} rows per execution.",
            )

        if not any(row.values()):
            continue

        try:
            # Inline Cell-by-Cell Sanitization
            sanitized_payload: Dict[str, Any] = {
                key: sanitize_csv_cell(val) if isinstance(val, str) else val for key, val in row.items()
            }

            # Handle parsing rules or custom mappings cleanly
            if "isInstitution" in sanitized_payload:
                # Map incoming strings or flags gracefully to actual bool primitives
                val_str = str(sanitized_payload["isInstitution"]).lower()
                sanitized_payload["is_institution"] = val_str in ("true", "1", "yes")

            instance = schema_model(**sanitized_payload)
            validated_instances.append(instance)

        except ValidationError as validation_err:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Data schema layout anomaly at row {row_counter}: {validation_err.errors()[0]['msg']}",
            ) from validation_err

    if not validated_instances:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file contains no valid structural rows to ingest.",
        )

    # 5. Persist Atomic Batch Transactions Direct To Database
    try:
        created_records = bulk_insert_fn(session, validated_instances)
        return created_records
    except service.EntityAlreadyExistsError as duplicate_err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(duplicate_err),
        ) from duplicate_err
    except Exception as db_err:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database persistence error during batch ingestion stream execution.",
        ) from db_err


# --- POLYMORPHIC ENDPOINT ROUTER LAYER ---


@app.post(
    "/liquid-accounts/bulk-upload", response_model=List[schemas.LiquidAccountRead], status_code=status.HTTP_201_CREATED
)
async def bulk_upload_liquid_accounts(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file,
        schemas.LiquidAccountCreate,
        {"name", "account_number", "minimum_balance"},
        service.bulk_insert_liquid_accounts,
        session,
    )


@app.post("/credit-cards/bulk-upload", response_model=List[schemas.CreditCardRead], status_code=status.HTTP_201_CREATED)
async def bulk_upload_credit_cards(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file,
        schemas.CreditCardCreate,
        {"name", "card_number", "limit", "statement_date", "grace_period"},
        service.bulk_insert_credit_cards,
        session,
    )


@app.post("/bonds/bulk-upload", response_model=List[schemas.BondRead], status_code=status.HTTP_201_CREATED)
async def bulk_upload_bonds(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file,
        schemas.BondCreate,
        {"unique_id", "name", "coupon_interest_rate", "face_value", "maturity_date"},
        service.bulk_insert_bonds,
        session,
    )


@app.post(
    "/demat-accounts/bulk-upload", response_model=List[schemas.DematAccountRead], status_code=status.HTTP_201_CREATED
)
async def bulk_upload_demat_accounts(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file,
        schemas.DematAccountCreate,
        {"name", "account_number", "depository_participant", "dp_id"},
        service.bulk_insert_demat_accounts,
        session,
    )


@app.post(
    "/fixed-deposits/bulk-upload", response_model=List[schemas.FixedDepositRead], status_code=status.HTTP_201_CREATED
)
async def bulk_upload_fixed_deposits(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file,
        schemas.FixedDepositCreate,
        {"bank_name", "fd_identifier", "principal_amount", "interest_rate", "maturity_date"},
        service.bulk_insert_fixed_deposits,
        session,
    )


@app.post("/mutual-funds/bulk-upload", response_model=List[schemas.MutualFundRead], status_code=status.HTTP_201_CREATED)
async def bulk_upload_mutual_funds(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file, schemas.MutualFundCreate, {"name", "type"}, service.bulk_insert_mutual_funds, session
    )


@app.post("/stocks/bulk-upload", response_model=List[schemas.StockRead], status_code=status.HTTP_201_CREATED)
async def bulk_upload_stocks(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file, schemas.StockCreate, {"symbol", "name"}, service.bulk_insert_stocks, session
    )


@app.post(
    "/external-contacts/bulk-upload",
    response_model=List[schemas.ExternalContactRead],
    status_code=status.HTTP_201_CREATED,
)
async def bulk_upload_external_contacts(session: SessionDep, file: FileDep):
    # Combines both "person" and "company" schemas into unified ExternalContact structural mapping
    return await process_bulk_csv_payload(
        file, schemas.ExternalContactCreate, {"name", "isInstitution"}, service.bulk_insert_external_contacts, session
    )


@app.post(
    "/virtual-entities/bulk-upload", response_model=List[schemas.VirtualEntityRead], status_code=status.HTTP_201_CREATED
)
async def bulk_upload_virtual_entities(session: SessionDep, file: FileDep):
    return await process_bulk_csv_payload(
        file, schemas.VirtualEntityCreate, {"name"}, service.bulk_insert_virtual_entities, session
    )


@app.get("/entities/metadata/{item_uuid}")
def get_entity_and_its_other_information(session: SessionDep, item_uuid: UUID):
    try:
        data = service.get_dynamic_joined_data(session, item_uuid)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
