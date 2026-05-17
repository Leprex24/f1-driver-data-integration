from app.database import SessionLocal, engine, Base
from app.models import drivers, teams, circuits, events, sessions
from app.models import laps, weather_snapshots, driver_session_results
from app.models import engine_suppliers, team_season_engines
from app.models.engine_suppliers import EngineSupplier
from app.models.team_season_engines import TeamSeasonEngine
from app.models.teams import Team

Base.metadata.create_all(engine)

def seed_engine_suppliers(db):
    suppliers = [
        EngineSupplier(name="Honda RBPT"),
        EngineSupplier(name="Red Bull Powertrains"),
        EngineSupplier(name="Mercedes"),
        EngineSupplier(name="Renault"),
        EngineSupplier(name="Honda"),
        EngineSupplier(name="Ferrari"),
    ]
    try:
        db.add_all(suppliers)
        db.commit()
    except Exception:
        db.rollback()
        raise

def seed_team_season_engine(db):
    def get_team(team_id):
        return db.query(Team).filter_by(team_id=team_id).first()
    def get_supplier(name):
        return db.query(EngineSupplier).filter_by(name=name).first()

    data = [
        ("mercedes", "Mercedes", 2021),
        ("mercedes", "Mercedes", 2022),
        ("mercedes", "Mercedes", 2023),
        ("mercedes", "Mercedes", 2024),
        ("ferrari", "Ferrari", 2021),
        ("ferrari", "Ferrari", 2022),
        ("ferrari", "Ferrari", 2023),
        ("ferrari", "Ferrari", 2024),
        ("red_bull", "Honda", 2021),
        ("red_bull", "Red Bull Powertrains", 2022),
        ("red_bull", "Honda RBPT", 2023),
        ("red_bull", "Honda RBPT", 2024),
        ("mclaren", "Mercedes", 2021),
        ("mclaren", "Mercedes", 2022),
        ("mclaren", "Mercedes", 2023),
        ("mclaren", "Mercedes", 2024),
        ("aston_martin", "Mercedes", 2021),
        ("aston_martin", "Mercedes", 2022),
        ("aston_martin", "Mercedes", 2023),
        ("aston_martin", "Mercedes", 2024),
        ("alpine", "Renault", 2021),
        ("alpine", "Renault", 2022),
        ("alpine", "Renault", 2023),
        ("alpine", "Renault", 2024),
        ("williams", "Mercedes", 2021),
        ("williams", "Mercedes", 2022),
        ("williams", "Mercedes", 2023),
        ("williams", "Mercedes", 2024),
        ("alfa", "Ferrari", 2021),
        ("alfa", "Ferrari", 2022),
        ("alfa", "Ferrari", 2023),
        ("sauber", "Ferrari", 2024),
        ("haas", "Ferrari", 2021),
        ("haas", "Ferrari", 2022),
        ("haas", "Ferrari", 2023),
        ("haas", "Ferrari", 2024),
        ("alphatauri", "Honda", 2021),
        ("alphatauri", "Red Bull Powertrains", 2022),
        ("alphatauri", "Honda RBPT", 2023),
        ("rb", "Honda RBPT", 2024),
    ]
    entries = []
    for team_id, supplier_name, season in data:
        team = get_team(team_id)
        supplier = get_supplier(supplier_name)
        if team and supplier:
            entries.append(TeamSeasonEngine(
                team_id=team.id,
                engine_supplier_id=supplier.id,
                season=season,
            ))
    try:
        db.add_all(entries)
        db.commit()
    except Exception:
        db.rollback()
        raise

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_engine_suppliers(db)
        print("Engine suppliers seeded successfully.")
        seed_team_season_engine(db)
        print("Team season engines seeded successfully.")
    finally:
        db.close()