from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.event import EventSchema


class SessionSchema(BaseModel):
    id: int
    type: str
    date: datetime
    event: EventSchema

    model_config = ConfigDict(from_attributes=True)