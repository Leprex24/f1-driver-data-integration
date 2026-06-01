from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.drivers import Driver
from app.schemas.driver import DriverShortSchema, DriverSchema
from app.services.auth_service import get_current_user

router = APIRouter()

@router.get("/", response_model=list[DriverSchema])
def get_drivers(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Driver).all()

@router.get("/{abbreviation}", response_model=DriverSchema)
def get_driver(abbreviation: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Driver).filter(Driver.abbreviation == abbreviation).first()