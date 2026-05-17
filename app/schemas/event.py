from pydantic import BaseModel

from app.schemas.circuit import CircuitSchema


class EventSchema(BaseModel):
    id: int
    season: int
    round_number: int
    name: str
    circuit: CircuitSchema

    class Config:
        from_attributes = True