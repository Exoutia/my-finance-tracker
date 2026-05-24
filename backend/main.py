from typing import Annotated
from uuid import UUID

import schemas
import service
import uvicorn
from config import settings
from db import create_db_and_tables, get_session
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


SessionDep = Annotated[Session, Depends(get_session)]


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


@app.post("/transactions", response_model=schemas.TransactionRead)
def create_transaction(session: SessionDep, data: schemas.TransactionCreate):
    try:
        data = service.create_transaction(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/transaction/transaction-types-to-categories")
def get_transaction_types_to_categories():
    try:
        return service.get_transaction_types_to_categories()
    except Exception as err:
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


@app.post("/fixed-depsosits", response_model=schemas.FixedDepositRead)
def create_fixed_deposit(session: SessionDep, data: schemas.FixedDepositCreate):
    try:
        data = service.create_fixed_deposit(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/fixed-depsosits", response_model=list[schemas.FixedDepositRead])
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


@app.post("/external-contracts", response_model=schemas.ExternalContactRead)
def create_external_contract(session: SessionDep, data: schemas.ExternalContactCreate):
    try:
        data = service.create_external_contract(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/external-contracts", response_model=list[schemas.ExternalContactRead])
def get_all_external_contract(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_external_contract(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/external-contract/persons", response_model=list[schemas.ExternalContactRead])
def get_all_person_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_person_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/external-contract/companies", response_model=list[schemas.ExternalContactRead])
def get_all_company_entity(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_company_entity(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.post("/virtual-entity", response_model=schemas.VirtualEntityRead)
def create_virutal_entity(session: SessionDep, data: schemas.VirtualEntityCreate):
    try:
        data = service.create_virtual_entity(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal Data error") from err


@app.get("/virtual-entity", response_model=list[schemas.VirtualEntityRead])
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


@app.get("/entities/metadata/{item_uuid}")
def get_entity_and_its_other_information(session: SessionDep, item_uuid: UUID):
    try:
        data = service.get_dynamic_joined_data(session, item_uuid)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
