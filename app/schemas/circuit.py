from pydantic.v1 import BaseModel


class CircuitSchema(BaseModel):
    id: int
    name: str
    country: str
    city: str
    surface_type: str | None
    circuit: str | None

    class Config:
        from_attributes = True