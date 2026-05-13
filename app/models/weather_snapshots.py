from sqlalchemy import Column, Integer, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class WeatherSnapshot(Base):
    __tablename__ = 'weather_snapshots'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('sessions.id'), nullable=False)
    air_temp = Column(Float)
    track_temp = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    rainfall = Column(Boolean)
    session = relationship("Session", back_populates="weather_snapshots")