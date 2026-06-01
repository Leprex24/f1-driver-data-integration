import fastapi

from app.database import engine, Base
from app.routers import drivers, sessions, export, auth, comparisons, circuits

from app.models import (
    drivers as drivers_model,
    teams,
    circuits as circuits_model,
    events,
    sessions as sessions_model,
    laps,
    weather_snapshots,
    driver_session_results,
    engine_suppliers,
    team_season_engines,
)

from fastapi.middleware.cors import CORSMiddleware
app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(engine)
app.include_router(drivers.router, prefix="/drivers", tags=["drivers"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(comparisons.router, prefix="/comparisons", tags=["comparisons"])
app.include_router(circuits.router, prefix="/circuits", tags=["circuits"])