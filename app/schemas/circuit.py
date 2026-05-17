from pydantic.v1 import BaseModel


class CircuitSchema(BaseModel):
    id: int
    name: str
    country: str
    city: str

    class Config:
        from_attributes = True