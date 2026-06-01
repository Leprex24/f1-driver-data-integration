from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.circuits import Circuit
from app.services.auth_service import get_current_user

router = APIRouter()

@router.get("/")
def get_circuits(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    circuits = db.query(Circuit).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "city": c.city,
            "country": c.country,
            "surface_type": c.surface_type,
            "circuit_type": c.circuit_type,
        }
        for c in circuits
    ]