from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class Circuit(Base):
    __tablename__ = "circuits"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    city = Column(String, nullable=False)
    circuit_id = Column(String, nullable=False, unique=True)
    events = relationship("Event", back_populates="circuit")