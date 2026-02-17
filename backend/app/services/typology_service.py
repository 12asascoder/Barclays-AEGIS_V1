from .. import models
from sklearn.cluster import KMeans
import numpy as np
from datetime import datetime


def detect_typologies(db, sar_id: int):
    sar = db.query(models.SARReport).filter(models.SARReport.id == sar_id).first()
    if not sar:
        raise ValueError("SAR not found")
    # basic rule-based detection using keywords
    narrative = (sar.narrative or "").lower()
    detections = []
    if 'structur' in narrative or 'split' in narrative:
        detections.append({'type': 'structuring', 'score': 0.9, 'details': 'Detected keywords indicating structuring.'})
    if 'layer' in narrative or 'obfusc' in narrative:
        detections.append({'type': 'layering', 'score': 0.8, 'details': 'Possible layering / layering patterns.'})
    if 'rapid' in narrative or 'velocity' in narrative or 'many tx' in narrative:
        detections.append({'type': 'velocity_anomaly', 'score': 0.85, 'details': 'High transaction velocity detected.'})

    results = []
    for d in detections:
        td = models.TypologyDetection(sar_id=sar.id, detection_type=d['type'], score=d['score'], details=d['details'], created_at=datetime.utcnow())
        db.add(td)
        results.append(td)
    db.commit()
    for r in results:
        db.refresh(r)
    return results
