from pydantic import BaseModel, ConfigDict

from app.schemas.circuit import CircuitSchema


class EventSchema(BaseModel):
    id: int
    season: int
    round_number: int
    name: str
    circuit: CircuitSchema

    model_config = ConfigDict(from_attributes=True)