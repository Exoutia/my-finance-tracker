from typing import Any

import schemas
import uvicorn
from config import settings
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from finance import FinanceRepository, create_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_path = settings.DATABASE_PATH
    schema_path = settings.SQL_FILE_PATH
    if not db_path.exists():
        create_db(db_path, schema_path)
    yield


app = FastAPI(debug=settings.DEBUG, lifespan=lifespan, title="Finance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174/",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173/",
        "http://127.0.0.1:5173",
    ],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_repo() -> FinanceRepository:
    db_path = settings.DATABASE_PATH
    return FinanceRepository(db_path)


@app.get("/")
async def root():
    return {"status": "Finance Tracker API is running"}


def save_entity(entity: Any):
    """Helper to handle repository saving with clean error chaining"""
    repo = get_repo()
    try:
        repo.save(entity)
        return {"message": f"{type(entity).__name__} created", "uuid": entity.uuid}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err)) from err


# --- Banking & Liabilities ---


@app.get("/transaction/transaction_types_to_categories")
def get_transaction_types_to_categories():
    try:
        data = {
            transaction_type.value: [category.value for category in category_enum]
            for transaction_type, category_enum in schemas.TYPE_TO_ENUM.items()
        }
        return {"response": data}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err)) from err


@app.get("/transactions/recent")
def get_recent_transactions(limit: int = 10):
    """
    Fetch the last N transactions.
    'limit' is a query parameter: /transactions?limit=5
    """
    try:
        repo = get_repo()
        data = repo.get_recent_transactions(limit)
        return {"response": data}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err)) from err


@app.get("/transaction/transaction_types")
def get_transaction_type():
    try:
        data = [e.value for e in schemas.TransactionType]
        return {"response": data}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err)) from err


@app.get("/transaction/transaction_category")
def get_transaction_category(transaction_type: schemas.TransactionType):
    transaction_category = schemas.TYPE_TO_ENUM[transaction_type]
    data = [e.value for e in transaction_category]
    return {"response": data}


@app.get("/entity")
def get_all_entity():
    try:
        repo = get_repo()
        data = repo.get_all_entities()
        return {"response": data}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err)) from err


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


# --- Investments ---


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


# --- Contacts & Virtual ---


@app.post("/entities/external-contact", status_code=201)
async def create_external_contact(data: schemas.ExternalContactCreate):
    contact = schemas.ExternalContact(name=data.name, category=data.category, is_institution=data.is_institution)
    return save_entity(contact)


@app.post("/entities/virtual", status_code=201)
async def create_virtual_entity(data: schemas.OtherEntityCreate):
    virtual = schemas.Other(name=data.name, tags=data.tags, description=data.description)
    return save_entity(virtual)


# --- The Ledger ---


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
    # for debug purpse
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
