from pydantic import BaseModel


class LoadSessionRequest(BaseModel):
    year: int
    grand_prix: str
    session_type: str