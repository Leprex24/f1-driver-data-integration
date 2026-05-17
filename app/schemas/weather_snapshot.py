from pydantic import BaseModel

from app.schemas.session import SessionSchema


class WeatherSnapshotSchema(BaseModel):
    id: int
    session: SessionSchema
    air_temp: float
    track_temp: float
    humidity: float
    wind_speed: float
    rainfall: bool

    class Config:
        from_attributes = True