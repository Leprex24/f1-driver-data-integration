from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    season = Column(Integer, nullable=False)
    round_number = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    circuit_id = Column(Integer,  ForeignKey('circuits.id'), nullable=False)
    sessions = relationship("Session", back_populates="event")
    circuit = relationship("Circuit", back_populates="events")