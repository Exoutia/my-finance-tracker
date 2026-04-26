from typing import Annotated

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


@app.get("/transaction/transaction_types_to_categories")
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


@app.post("/entities/liquid-account", response_model=schemas.LiquidAccountRead)
def create_liquid_account(session: SessionDep, data: schemas.LiquidAccountCreate):
    try:
        data = service.create_liquid_account(session, data)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


@app.get("/entities/liquid-account", response_model=list[schemas.LiquidAccountRead])
def get_all_liquid_accounts(session: SessionDep, offset: int = 0, limit: int = Query(default=100, le=100)):
    try:
        data = service.get_all_liquid_accounts(session, offset, limit)
        return data
    except service.DBException as err:
        raise HTTPException(status_code=500, detail="Internal data error") from err


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
