from unittest import result

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.comparison_service import compare_driver_summary, compare_drivers_detailed

router = APIRouter()

@router.get("/summary")
def summary(driver1, driver2, circuit_id, season, session_type, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = compare_driver_summary(db, driver1, driver2, circuit_id, season, session_type)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return result

@router.get("/detailed")
def detailed(driver1, driver2, circuit_id, season, session_type, lap_from: int = None, laps_to: int = None, compound: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = compare_drivers_detailed(db, driver1, driver2, circuit_id, season, session_type, lap_from, laps_to, compound)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return result