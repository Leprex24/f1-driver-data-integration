from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.load_session import LoadSessionRequest
from app.services.auth_service import require_admin
from app.services.f1_data_service import load_session

router = APIRouter()

@router.post("/load")
def load_session_endpoint(request: LoadSessionRequest, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    try:
        load_session(request.year, request.grand_prix, request.session_type, db)
        return {"message": "Session loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))