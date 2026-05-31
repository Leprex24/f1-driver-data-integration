from pydantic import BaseModel, ConfigDict

from app.schemas.session import SessionSchema


class WeatherSnapshotSchema(BaseModel):
    id: int
    session: SessionSchema
    air_temp: float
    track_temp: float
    humidity: float
    wind_speed: float
    rainfall: bool

    model_config = ConfigDict(from_attributes=True)