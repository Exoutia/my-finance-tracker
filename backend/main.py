from typing import Any

import schemas
import uvicorn
from config import settings
from fastapi import FastAPI, HTTPException, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from finance import FinanceRepository, create_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_path = settings.DATABASE_PATH
    schema_path = settings.SQL_FILE_PATH

    try:
        if not db_path.exists():
            create_db(db_path, schema_path)
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


# --- 4. Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches any error not explicitly handled in routes."""
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "type": type(exc).__name__},
    )


# --- 5. Helpers ---
def get_repo() -> FinanceRepository:
    return FinanceRepository(settings.DATABASE_PATH)


def save_entity(entity: Any):
    """Centralized save logic with specific error branching and logging."""
    repo = get_repo()
    entity_name = type(entity).__name__

    try:
        repo.save(entity)
        return {"message": f"{entity_name} created", "uuid": getattr(entity, "uuid", None)}

    except ValueError as ve:
        # Catch validation errors from the business logic layer
        raise HTTPException(status_code=422, detail=str(ve)) from ve

    except Exception as err:
        # Catch database or unexpected errors
        raise HTTPException(status_code=500, detail="Database operation failed") from err


@app.get("/")
async def root():
    return {"status": "Finance Tracker API is running"}


@app.get("/transaction/transaction_types_to_categories")
def get_transaction_types_to_categories():
    try:
        data = {
            transaction_type.value: [category.value for category in category_enum]
            for transaction_type, category_enum in schemas.TYPE_TO_ENUM.items()
        }
        return {"response": data}
    except Exception as err:
        raise HTTPException(status_code=500, detail="Internal data mapping error") from err


@app.get("/transactions/recent")
def get_recent_transactions(limit: int = 10):
    repo = get_repo()
    try:
        data = repo.get_recent_transactions(limit)
        return {"response": data}
    except Exception as err:
        raise HTTPException(status_code=500, detail="Error retrieving ledger data") from err


@app.get("/transaction/transaction_types")
def get_transaction_type():
    return {"response": [e.value for e in schemas.TransactionType]}


@app.get("/transaction/transaction_category")
def get_transaction_category(transaction_type: schemas.TransactionType):
    try:
        transaction_category = schemas.TYPE_TO_ENUM[transaction_type]
        return {"response": [e.value for e in transaction_category]}
    except KeyError as err:
        raise HTTPException(status_code=404, detail="Transaction type not found") from err


@app.get("/entity")
def get_all_entity():
    repo = get_repo()
    try:
        data = repo.get_all_entities()
        return {"response": data}
    except Exception as err:
        raise HTTPException(status_code=500, detail="Could not load entities") from err


# --- POST Endpoints (Using the enhanced save_entity) ---


@app.post("/entities/liquid-account", status_code=201)
async def create_liquid_account(data: schemas.LiquidAccountCreate):
    acc = schemas.LiquidAccount(
        name=data.name, account_number_with_mask=data.account_number_with_mask, minimum_balance=data.minimum_balance
    )
    return save_entity(acc)


@app.post("/entities/credit-card", status_code=201)
async def create_credit_card(data: schemas.CreditCardCreate):
    card = schemas.CreditCard(name=data.name, card_number_with_mask=data.card_number_with_mask, limit=data.limit)
    return save_entity(card)


@app.post("/entities/stock", status_code=201)
async def create_stock(data: schemas.StockCreate):
    stock = schemas.Stock(
        symbol=data.symbol, exchange=data.exchange, average_price=data.average_price, quantity=data.quantity
    )
    return save_entity(stock)


@app.post("/entities/mutual-fund", status_code=201)
async def create_mutual_fund(data: schemas.MutualFundCreate):
    mf = schemas.Mutualfund(name=data.name, type=data.type, nav=data.nav)
    return save_entity(mf)


@app.post("/entities/fixed-deposit", status_code=201)
async def create_fixed_deposit(data: schemas.FixedDepositCreate):
    fd = schemas.FixedDeposit(
        fd_number_with_mask=data.fd_number_with_mask,
        bank_name=data.bank_name,
        principal_amount=data.principal_amount,
        interest_rate=data.interest_rate,
        maturity_date=data.maturity_date,
    )
    return save_entity(fd)


@app.post("/entities/bond", status_code=201)
async def create_bond(data: schemas.BondCreate):
    bond = schemas.Bond(
        isin=data.isin,
        name=data.name,
        coupon_rate=data.coupon_rate,
        face_value=data.face_value,
        maturity_date=data.maturity_date,
    )
    return save_entity(bond)


@app.post("/entities/external-contact", status_code=201)
async def create_external_contact(data: schemas.ExternalContactCreate):
    contact = schemas.ExternalContact(name=data.name, category=data.category, is_institution=data.is_institution)
    return save_entity(contact)


@app.post("/entities/virtual", status_code=201)
async def create_virtual_entity(data: schemas.OtherEntityCreate):
    virtual = schemas.Other(name=data.name, tags=data.tags, description=data.description)
    return save_entity(virtual)


@app.post("/transactions", status_code=201)
async def create_transaction(data: schemas.TransactionCreate):
    txn = schemas.TransactionSchema(
        to_entities_id=data.to_entities_id,
        from_entities_id=data.from_entities_id,
        amount=data.amount,
        transaction_datetime=data.transaction_datetime,
        transaction_type=data.transaction_type,
        transaction_category=data.transaction_category,
        description=data.description,
    )
    return save_entity(txn)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
