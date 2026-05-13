import fastapi

from app.database import engine, Base

app = fastapi.FastAPI()
Base.metadata.create_all(engine)