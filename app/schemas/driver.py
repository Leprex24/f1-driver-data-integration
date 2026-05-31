from pydantic import BaseModel, ConfigDict

class DriverSchema(BaseModel):
    id: int
    first_name: str
    last_name: str
    abbreviation: str
    nationality: str | None
    number: str

    model_config = ConfigDict(from_attributes=True)

class DriverShortSchema(BaseModel):
    id: int
    abbreviation: str
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)