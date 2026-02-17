from fastapi import APIRouter, Depends
from ..db.session import get_db
from ..core.deps import get_current_user
from .. import models
from ..schemas import DashboardMetrics
from sqlalchemy.orm import Session
from collections import Counter

router = APIRouter()


@router.get("/metrics")
def metrics(db: Session = Depends(get_db), user=Depends(get_current_user)):
    sar_volume = db.query(models.SARReport).count()
    avg_cqi = db.query(models.CQIScore).with_entities(models.CQIScore.overall_score).all()
    avg = float(sum([r[0] for r in avg_cqi]) / len(avg_cqi)) if avg_cqi else 0.0
    typologies = db.query(models.TypologyDetection).all()
    typ_counts = Counter([t.detection_type for t in typologies])
    # risk trend simplified: return counts by day (placeholder)
    trend = []
    return {"sar_volume": sar_volume, "average_cqi": avg, "typology_counts": dict(typ_counts), "risk_score_trend": trend}
