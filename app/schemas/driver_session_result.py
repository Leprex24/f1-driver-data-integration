from pydantic import BaseModel

from app.schemas.driver import DriverShortSchema
from app.schemas.team import TeamShortSchema


class DriverSessionResultSchema(BaseModel):
    id: int
    position: int | None
    points: float
    driver: DriverShortSchema
    team: TeamShortSchema

    class Config:
        from_attributes = True