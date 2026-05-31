from pydantic import BaseModel, ConfigDict

from app.schemas.driver import DriverShortSchema
from app.schemas.team import TeamShortSchema


class DriverSessionResultSchema(BaseModel):
    id: int
    position: int | None
    points: float | None
    driver: DriverShortSchema
    team: TeamShortSchema

    model_config = ConfigDict(from_attributes=True)