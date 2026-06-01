from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, get_read_db
from app.models.driver_session_results import DriverSessionResult
from app.models.drivers import Driver
from app.models.teams import Team
from app.schemas.load_session import LoadSessionRequest
from app.services.auth_service import require_admin, get_current_user
from app.services.f1_data_service import load_session
from app.models.sessions import Session as SessionModel
from app.models.events import Event
from app.models.circuits import Circuit

router = APIRouter()


@router.get("/")
def get_sessions(db: Session = Depends(get_read_db), current_user=Depends(get_current_user)):
    sessions = db.query(SessionModel).join(Event).join(Circuit).all()
    return [
        {
            "id": s.id,
            "type": s.type,
            "date": s.date,
            "event": s.event.name,
            "season": s.event.season,
            "round": s.event.round_number,
            "circuit": s.event.circuit.city,
        }
        for s in sessions
    ]


@router.post("/load")
def load_session_endpoint(request: LoadSessionRequest, db: Session = Depends(get_db),
                          current_user=Depends(require_admin)):
    try:
        load_session(request.year, request.grand_prix, request.session_type, db)
        return {"message": "Session loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/available")
def get_available_sessions(season: int = None, circuit_id: str = None, db: Session = Depends(get_read_db),
                           current_user=Depends(get_current_user)):
    query = db.query(SessionModel).join(Event).join(Circuit)
    if season:
        query = query.filter(Event.season == season)
    if circuit_id:
        query = query.filter(Circuit.city == circuit_id)
    sessions = query.all()
    return [
        {
            "season": s.event.season,
            "circuit": s.event.circuit.city,
            "session_type": s.type,
        }
        for s in sessions
    ]


@router.get("/debug/circuits")
def debug_circuits(db: Session = Depends(get_db)):
    from app.models.circuits import Circuit
    circuits = db.query(Circuit).all()
    return [{"id": c.id, "name": c.name, "city": c.city, "circuit_id": c.circuit_id} for c in circuits]


@router.post("/load-defaults")
def load_default_session(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        from app.scripts.load_all_sessions import get_gps_for_year
        import time

        results = {"success": [], "failed": []}
        for year in [2021, 2022, 2023, 2024]:
            for gp in get_gps_for_year(year):
                try:
                    load_session(year, gp, 'R', db)
                    results["success"].append(f"{year} {gp} R")
                    time.sleep(1)
                except Exception as e:
                    results["failed"].append(f"{year} {gp} R: {str(e)}")
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}/weather")
def get_session_weather(session_id: int, db: Session = Depends(get_read_db), current_user=Depends(get_current_user)):
    from app.models.weather_snapshots import WeatherSnapshot
    snapshots = db.query(WeatherSnapshot).filter_by(session_id=session_id).all()
    return [
        {
            "index": i,
            "air_temp": s.air_temp,
            "track_temp": s.track_temp,
            "humidity": s.humidity,
            "wind_speed": s.wind_speed,
            "rainfall": s.rainfall,
        }
        for i, s in enumerate(snapshots)
    ]


@router.get("/teammates")
def get_teammates(
        season: int,
        circuit_id: str = None,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    query = db.query(Team).join(DriverSessionResult).join(SessionModel).join(Event)
    if circuit_id:
        query = query.join(Circuit, Event.circuit_id == Circuit.id).filter(Circuit.city == circuit_id)
    query = query.filter(Event.season == season)
    teams = query.distinct().all()

    result = []
    for team in teams:
        drivers_in_team = db.query(Driver).join(DriverSessionResult).join(SessionModel).join(Event).filter(Event.season == season).filter(DriverSessionResult.team_id == team.id).distinct().all()
        if len(drivers_in_team) >= 1:
            result.append({
                "team_id": team.team_id,
                "team_name": team.name,
                "team_color": team.team_color,
                "drivers": [{"abbreviation": d.abbreviation, "last_name": d.last_name} for d in drivers_in_team]
            })
    return result
