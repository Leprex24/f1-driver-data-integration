from sqlalchemy import Column, Integer, ForeignKey, Float, String, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Lap(Base):
    __tablename__ = 'laps'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('sessions.id'), nullable=False)
    driver_id = Column(Integer, ForeignKey('drivers.id'), nullable=False)
    lap_number = Column(Integer, nullable=False)
    lap_time = Column(Float, nullable=True)
    sector1 = Column(Float, nullable=True)
    sector2 = Column(Float, nullable=True)
    sector3 = Column(Float, nullable=True)
    compound = Column(String, nullable=True)
    tyre_life = Column(Float, nullable=True)
    is_valid = Column(Boolean, nullable=False)
    session = relationship("Session", back_populates="laps")
    driver = relationship("Driver", back_populates="laps")
