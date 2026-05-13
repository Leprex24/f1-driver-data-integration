from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class EngineSupplier(Base):
    __tablename__ = "engine_suppliers"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    team_season_engines = relationship("TeamSeasonEngine", back_populates="engine_supplier")