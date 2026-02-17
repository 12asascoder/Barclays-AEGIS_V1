from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from ..core.config import settings

_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(settings.DATABASE_URL, future=True)
    return _engine


def get_session():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True))
    return _SessionLocal


def get_db():
    db = get_session()
    try:
        yield db
    finally:
        db.remove()


# helper used in startup
def get_engine_for_alembic():
    """Return a SQLAlchemy Engine for Alembic migrations."""
    return get_engine()
