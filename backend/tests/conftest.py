import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool


@pytest.fixture(name="session")
def session_fixture():
    # 1. Create a fresh in-memory database for every test
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    # 2. Yield the session to the test
    with Session(engine) as session:
        yield session

    # 3. Cleanup after test
    SQLModel.metadata.drop_all(engine)
