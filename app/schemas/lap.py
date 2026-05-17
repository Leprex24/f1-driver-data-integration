from pydantic import BaseModel

from app.schemas.driver import DriverShortSchema
from app.schemas.session import SessionSchema


class LapSchema(BaseModel):
    id: int
    session: SessionSchema
    driver: DriverShortSchema
    lap_number: int
    lap_time: float | None
    sector1: float | None
    sector2: float | None
    sector3: float | None
    compound: str | None
    tyre_life: float | None
    is_valid: bool

    class Config:
        from_attributes = True

class LapShortSchema(BaseModel):
    id: int
    session: SessionSchema
    driver: DriverShortSchema
    lap_number: int
    lap_time: float | None
    compound: str | None
    tyre_life: float | None
    is_valid: bool

    class Config:
        from_attributes = True