from datetime import datetime

from pydantic import BaseModel

from app.schemas.event import EventSchema


class SessionSchema(BaseModel):
    id: int
    type: str
    date: datetime
    event: EventSchema

    class Config:
        from_attributes = True