from sqlalchemy import Column, Integer, ForeignKey, String, Float
from sqlalchemy.orm import relationship

from app.database import Base


class DriverSessionResult(Base):
    __tablename__ = "driver_session_results"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('sessions.id'), nullable=False)
    driver_id = Column(Integer, ForeignKey('drivers.id'), nullable=False)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    position = Column(Integer, nullable=True)
    points = Column(Float, nullable=False)
    session = relationship("Session", back_populates="driver_session_results")
    driver = relationship("Driver", back_populates="driver_session_results")
    team = relationship("Team", back_populates="driver_session_results")