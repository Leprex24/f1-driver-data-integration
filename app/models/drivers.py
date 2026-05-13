from sqlalchemy import Column, Integer, String

from app.database import Base


class Driver(Base):
    __tablename__ = 'drivers'
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    nationality = Column(String, nullable=False)
    number = Column(String(3), nullable=False)
    abbreviation = Column(String(3), nullable=False)
    driver_id = Column(String, unique=True, nullable=False)
