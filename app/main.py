import fastapi

from app.database import engine, Base
from app.routers import drivers, sessions, export, auth

from app.models import (
    drivers as drivers_model,
    teams,
    circuits,
    events,
    sessions as sessions_model,
    laps,
    weather_snapshots,
    driver_session_results,
    engine_suppliers,
    team_season_engines,
)
app = fastapi.FastAPI()
Base.metadata.create_all(engine)
app.include_router(drivers.router, prefix="/drivers", tags=["drivers"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])