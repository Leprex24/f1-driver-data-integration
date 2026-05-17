import pandas as pd
import fastf1

from app.models.circuits import Circuit
from app.models.driver_session_results import DriverSessionResult
from app.models.drivers import Driver
from app.models.events import Event
from app.models.laps import Lap
from app.models.teams import Team
from app.models.sessions import Session as SessionModel
from app.models.weather_snapshots import WeatherSnapshot

def to_seconds(td):
    return td.total_seconds() if pd.notna(td) else None

def get_or_create_driver(db, row):
    driver = db.query(Driver).filter_by(driver_id=row['DriverId']).first()
    if driver is None:
        driver = Driver(
            first_name=row['FirstName'],
            last_name=row['LastName'],
            nationality=row['CountryCode'] if pd.notna(row['CountryCode']) else None,
            number=row['DriverNumber'],
            abbreviation=row['Abbreviation'],
            driver_id=row['DriverId'],
        )
        db.add(driver)
        db.flush()
    else:
        if pd.notna(row['CountryCode']) and not driver.nationality:
            print(f"Updating nationality for {row['DriverId']}: {row['CountryCode']}")
            driver.nationality = row['CountryCode']
            db.flush()
        else:
            print(f"Skipping {row['DriverId']}: CountryCode={row['CountryCode']}, nationality={driver.nationality}")
    return driver

def get_or_create_team(db, row):
    team = db.query(Team).filter_by(team_id=row['TeamId']).first()
    if team is None:
        team = Team(
            name=row['TeamName'],
            team_color=row['TeamColor'],
            team_id=row['TeamId'],
        )
        db.add(team)
        db.flush()
    return team


def get_or_create_circuit(db, f1_session):
    info = f1_session.session_info['Meeting']

    circuit = db.query(Circuit).filter_by(circuit_id=info['Circuit']['ShortName']).first()
    if circuit is None:
        circuit = Circuit(
            name=info['Circuit']['ShortName'],
            country=f1_session.event['Country'],
            city=f1_session.event['Location'],
            circuit_id=info['Circuit']['ShortName'],
        )
        db.add(circuit)
        db.flush()
    return circuit

def get_or_create_event(db, event_row, circuit_id):
    event = db.query(Event).filter_by(name=event_row['OfficialEventName']).first()
    if event is None:
        event = Event(
            season=event_row.year,
            round_number=int(event_row['RoundNumber']),
            name=event_row['OfficialEventName'],
            circuit_id=circuit_id,
        )
        db.add(event)
        db.flush()
    return event

def get_or_create_session(db, f1_session, event_id):
    session = db.query(SessionModel).filter_by(event_id=event_id, type=f1_session.name).first()
    if session is None:
        session = SessionModel(
            event_id = event_id,
            type = f1_session.name,
            date = f1_session.date,
        )
        db.add(session)
        db.flush()
    return session

def create_lap(db, row, session_id, driver_id):
    lap = Lap(
        session_id=session_id,
        driver_id=driver_id,
        lap_number=row['LapNumber'],
        lap_time=to_seconds(row['LapTime']),
        sector1=to_seconds(row['Sector1Time']),
        sector2=to_seconds(row['Sector2Time']),
        sector3=to_seconds(row['Sector3Time']),
        compound=row['Compound'],
        tyre_life=row['TyreLife'],
        is_valid=row['Deleted'] == False,
    )
    db.add(lap)
    db.flush()
    return lap

def create_weather_snapshot(db, row, session_id):
    snapshot = WeatherSnapshot(
        session_id=session_id,
        air_temp=row['AirTemp'],
        track_temp=row['TrackTemp'],
        humidity=row['Humidity'],
        wind_speed=row['WindSpeed'],
        rainfall=row['Rainfall'],
    )
    db.add(snapshot)
    db.flush()
    return snapshot

def create_driver_session_result(db, row, session_id, driver_id, team_id):
    driver_session_result = DriverSessionResult(
        session_id=session_id,
        driver_id=driver_id,
        team_id=team_id,
        position=int(row['ClassifiedPosition']) if str(row['ClassifiedPosition']).isdigit() else None,
        points=row['Points'],
    )
    db.add(driver_session_result)
    db.flush()
    return driver_session_result

def load_session(year, grand_prix, session_type, db):
    f1_session = fastf1.get_session(year, grand_prix, session_type)

    try:
        f1_session.load(laps=True, weather=True, telemetry=False)
        circuit = get_or_create_circuit(db, f1_session)
        event = get_or_create_event(db, f1_session.event, circuit.id)
        session = get_or_create_session(db, f1_session, event.id)

        for _, row in f1_session.results.iterrows():
            driver = get_or_create_driver(db, row)
            team = get_or_create_team(db, row)
            create_driver_session_result(db, row, session.id, driver.id, team.id)

        driver_map = {
            row['Abbreviation']: row['DriverId']
            for _, row in f1_session.results.iterrows()
        }
        for _, lap_row in f1_session.laps.iterrows():
            driver_id_str = driver_map.get(lap_row['Driver'])
            driver = db.query(Driver).filter_by(driver_id=driver_id_str).first()
            create_lap(db, lap_row, session.id, driver.id)
        for _, weather_row in f1_session.weather_data.iterrows():
            create_weather_snapshot(db, weather_row, session.id)

        db.commit()

    except Exception:
        db.rollback()
        raise