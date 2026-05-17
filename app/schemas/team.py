from pydantic import BaseModel


class TeamSchema(BaseModel):
    id: int
    name: str
    team_color: str
    team_id: str

    class Config:
        from_attributes = True


class TeamShortSchema(BaseModel):
    id: int
    name: str
    team_color: str

    class Config:
        from_attributes = True