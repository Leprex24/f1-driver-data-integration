import fastapi

from app.database import engine, Base

from app.models import (
    drivers,
    teams,
    circuits,
    events,
    sessions,
    laps,
    weather_snapshots,
    driver_session_results,
    engine_suppliers,
    team_season_engines,
)
app = fastapi.FastAPI()
Base.metadata.create_all(engine)