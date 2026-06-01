import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()
CONNECTION_STRING = os.getenv("DATABASE_URL")

engine = create_engine(CONNECTION_STRING, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

SessionReadOnly = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_read_db():
    db = SessionReadOnly()
    try:
        db.execute(text("PRAGMA read_uncommitted = true"))
        yield db
    finally:
        db.close()