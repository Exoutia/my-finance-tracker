from typing import Generator

from config import settings
from sqlalchemy.engine.url import make_url
from sqlmodel import Session, SQLModel, create_engine

sqlite_url = make_url(settings.DATABASE_URL)

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency to be used in FastAPI routes to get a database session.
    """
    with Session(engine) as session:
        yield session
