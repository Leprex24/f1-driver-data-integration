from pydantic import BaseModel

from app.schemas.engine_supplier import EngineSupplierSchema
from app.schemas.team import TeamShortSchema


class TeamSeasonEngineSchema(BaseModel):
    id: int
    season: int
    team: TeamShortSchema
    engine_supplier: EngineSupplierSchema

    class Config:
        from_attributes = True