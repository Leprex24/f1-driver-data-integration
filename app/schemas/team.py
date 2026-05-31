from pydantic import BaseModel, ConfigDict


class TeamSchema(BaseModel):
    id: int
    name: str
    team_color: str
    team_id: str

    model_config = ConfigDict(from_attributes=True)


class TeamShortSchema(BaseModel):
    id: int
    name: str
    team_color: str

    model_config = ConfigDict(from_attributes=True)