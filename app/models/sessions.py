from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey('events.id'), nullable=False)
    type = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    laps = relationship("Lap", back_populates="session")
    weather_snapshots = relationship("WeatherSnapshot", back_populates="session")
    driver_session_results = relationship("DriverSessionResult", back_populates="session")
    event = relationship("Event", back_populates="sessions")