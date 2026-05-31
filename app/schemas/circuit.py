from pydantic.v1 import BaseModel, ConfigDict


class CircuitSchema(BaseModel):
    id: int
    name: str
    country: str
    city: str
    surface_type: str | None
    circuit: str | None

    model_config = ConfigDict(from_attributes=True)