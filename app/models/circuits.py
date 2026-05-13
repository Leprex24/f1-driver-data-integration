from sqlalchemy import Column, String

from app.database import Base


class Circuit(Base):
    __tablename__ = "circuits"
    id = Column(String, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    city = Column(String, nullable=False)
    circuit_id = Column(String, nullable=False, unique=True)