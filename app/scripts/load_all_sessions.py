import time

import fastf1
from app.models.sessions import Session as SessionModel
from app.models.events import Event
from app.database import SessionLocal, engine, Base
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
from app.services.f1_data_service import load_session

import os

def is_session_loaded(db, year, gp_name, session_type_name):
    result = db.query(SessionModel)\
        .join(Event)\
        .filter(Event.season == year)\
        .filter(Event.name.contains(gp_name))\
        .filter(SessionModel.type == session_type_name)\
        .first()
    return result is not None

if not os.path.exists('cache'):
    os.makedirs('cache')
fastf1.Cache.enable_cache('cache')

Base.metadata.create_all(engine)
def get_gps_for_year(year):
    base = ['Bahrain', 'Abu Dhabi', 'Monaco', 'Baku', 'Monza']
    if year == 2021:
        return base + ['British']
    else:
        return base + ['Japanese']

if __name__ == "__main__":
    db = SessionLocal()
    try:
        for year in [2021, 2022, 2023, 2024]:
            selected_gps = get_gps_for_year(year)
            for gp in selected_gps:
                for session_type in ['R']:
                    session_type_name = 'Race' if session_type == 'R' else 'Qualifying'
                    if is_session_loaded(db, year, gp, session_type_name):
                        print(f"Skipping {year} {gp} {session_type} - already loaded")
                        continue
                    try:
                        print(f"Loading {year} {gp} {session_type}...")
                        load_session(year, gp, session_type, db)
                        time.sleep(3)
                    except Exception as e:
                        print(f"Failed {year} {gp} {session_type}: {e}")
                        continue
    finally:
        db.close()