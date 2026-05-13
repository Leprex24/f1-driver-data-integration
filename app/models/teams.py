from sqlalchemy import Column, Integer, String

from app.database import Base
class Team(Base):
    __tablename__ = 'teams'
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    nationality = Column(String, nullable=False)
    team_id = Column(String, nullable=False, unique=True)