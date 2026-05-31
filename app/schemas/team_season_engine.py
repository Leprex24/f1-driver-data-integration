from pydantic import BaseModel, ConfigDict

from app.schemas.engine_supplier import EngineSupplierSchema
from app.schemas.team import TeamShortSchema


class TeamSeasonEngineSchema(BaseModel):
    id: int
    season: int
    team: TeamShortSchema
    engine_supplier: EngineSupplierSchema

    model_config = ConfigDict(from_attributes=True)