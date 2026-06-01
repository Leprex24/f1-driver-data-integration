from fastapi import APIRouter, Depends, HTTPException, Response
from lxml import etree
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db, get_read_db
from app.models.drivers import Driver
from app.models.teams import Team
from app.schemas.driver_session_result import DriverSessionResultSchema
from app.schemas.lap import LapShortSchema
from app.schemas.session import SessionSchema
from app.schemas.weather_snapshot import WeatherSnapshotSchema
from app.models.sessions import Session as SessionModel
from app.services.auth_service import get_current_user


class SessionExportSchema(BaseModel):
    session: SessionSchema
    results: list[DriverSessionResultSchema]
    laps: list[LapShortSchema]
    weather: list[WeatherSnapshotSchema]

    class Config:
        from_attributes = True

router = APIRouter()

@router.get("/session/{session_id}/json")
def export_session_json(session_id: int, db: Session = Depends(get_read_db), current_user = Depends(get_current_user)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session": session,
        "results": session.driver_session_results,
        "laps": session.laps,
        "weather": session.weather_snapshots,
    }

@router.get("/session/{session_id}/xml")
def export_session_xml(session_id: int, db: Session = Depends(get_read_db), current_user = Depends(get_current_user)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    root = etree.Element("session")
    info = etree.SubElement(root, "info")
    etree.SubElement(info, "type").text = session.type
    etree.SubElement(info, "date").text = str(session.date)

    results_el = etree.SubElement(root, "results")
    for result in session.driver_session_results:
        r = etree.SubElement(results_el, "result")
        etree.SubElement(r, "driver").text = result.driver.abbreviation
        etree.SubElement(r, "team").text = result.team.name
        etree.SubElement(r, "position").text = str(result.position)
        etree.SubElement(r, "points").text = str(result.points)

    xml_bytes = etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="utf-8")
    return Response(content=xml_bytes, media_type="application/xml")