from pydantic import BaseModel

class DriverSchema(BaseModel):
    id: int
    first_name: str
    last_name: str
    abbreviation: str
    nationality: str | None
    number: str

    class Config:
        from_attributes = True

class DriverShortSchema(BaseModel):
    id: int
    abbreviation: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True