from idlelib import query

from app.models.circuits import Circuit
from app.models.drivers import Driver
from app.models.events import Event
from app.models.laps import Lap
from app.models.sessions import Session as SessionModel


def get_driver_laps(db, driver_abbr, session_id, only_valid=True):
    query = db.query(Lap).join(Driver).filter(Driver.abbreviation == driver_abbr).filter(Lap.session_id == session_id)
    if only_valid:
        query = query.filter(Lap.is_valid == True)
    return query.all()

def get_session(db, circuit_id, season, session_type):
    return db.query(SessionModel).join(Event).join(Circuit).filter(Circuit.circuit_id == circuit_id).filter(Event.season == season).filter(SessionModel.type == session_type).first()

def avg_lap_time(laps):
    times = [l.lap_time for l in laps if l.lap_time is not None]
    return sum(times) / len(times) if times else None

def fastest_lap(laps):
    valid = [l for l in laps if l.lap_time is not None]
    return min(valid, key=lambda l: l.lap_time, default=None)

def avg_time_per_compound(laps):
    from collections import defaultdict
    compunds = defaultdict(list)
    for lap in laps:
        if lap.compound and lap.lap_time:
            compunds[lap.compound].append(lap.lap_time)
    return {c: sum(t)/len(t) for c, t in compunds.items()}

def avg_sector_times(laps):
    s1 = [l.sector1 for l in laps if l.sector1 is not None]
    s2 = [l.sector2 for l in laps if l.sector2 is not None]
    s3 = [l.sector3 for l in laps if l.sector3 is not None]
    return {
        "sector1": sum(s1) / len(s1) if s1 else None,
        "sector2": sum(s2) / len(s2) if s2 else None,
        "sector3": sum(s3) / len(s3) if s3 else None,
    }

def get_driver_summary(db, driver_abbr, session_id):
    laps = get_driver_laps(db, driver_abbr, session_id)
    best_lap = fastest_lap(laps)
    return {
        "driver": driver_abbr,
        "avg_lap_time": avg_lap_time(laps),
        "fastest_lap": best_lap.lap_time if best_lap else None,
        "avg_sectors": avg_sector_times(laps),
        "avg_time_per_compound": avg_time_per_compound(laps),
    }

def compare_driver_summary(db, driver1, driver2, circuit_id, season, session_type):
    session = get_session(db, circuit_id, season, session_type)
    if not session:
        return None
    return {
        "session": session,
        "driver1": get_driver_summary(db, driver1, session.id),
        "driver2": get_driver_summary(db, driver2, session.id),
    }