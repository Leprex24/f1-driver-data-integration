from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base
class Team(Base):
    __tablename__ = 'teams'
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    nationality = Column(String, nullable=False)
    team_id = Column(String, nullable=False, unique=True)
    driver_session_results = relationship("DriverSessionResult", back_populates="team")
    team_season_engines = relationship("TeamSeasonEngine", back_populates="team")