from models import Tag
from sqlmodel import select


def test_create_tag(session):
    # Setup: Create a new tag
    new_tag = Tag(name="Groceries")
    session.add(new_tag)
    session.commit()
    session.refresh(new_tag)

    # Execution: Fetch it back
    statement = select(Tag).where(Tag.name == "Groceries")
    results = session.exec(statement).all()

    # Verification
    assert len(results) == 1
    assert results[0].name == "Groceries"
