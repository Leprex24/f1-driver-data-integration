from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class TeamSeasonEngine(Base):
    __tablename__ = "team_season_engines"
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    engine_supplier_id = Column(Integer, ForeignKey('engine_suppliers.id'), nullable=False)
    season = Column(Integer, nullable=False)
    team = relationship("Team", back_populates="team_season_engines")
    engine_supplier = relationship("EngineSupplier", back_populates="team_season_engines")