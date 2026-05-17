from pydantic import BaseModel


class EngineSupplierSchema(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True