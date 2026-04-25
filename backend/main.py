import schemas
import uvicorn
from config import settings
from db import create_db_and_tables
from fastapi import FastAPI, HTTPException, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


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


@app.get("/")
def server_running():
    return {"message": "server is running fine"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches any error not explicitly handled in routes."""
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "type": type(exc).__name__},
    )


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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
