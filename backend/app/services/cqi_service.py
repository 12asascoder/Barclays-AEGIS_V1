from .. import models
from datetime import datetime
from .regulatory_simulation_service import simulate_regulatory_review


def calculate_cqi(db, sar_id: int):
    """
    Enhanced CQI calculation incorporating regulatory simulation
    Combines traditional metrics with defensibility analysis
    """
    sar = db.query(models.SARReport).filter(models.SARReport.id == sar_id).first()
    if not sar:
        raise ValueError("SAR not found")
    
    narrative = sar.narrative or ""
    
    # Traditional CQI metrics
    evidence_coverage = min(1.0, narrative.count('txn_id') / 5.0)
    completeness = min(1.0, len(narrative) / 2000.0)
    confidence = 0.8 if 'likely' in narrative or 'probable' in narrative else 0.6
    traceability = 0.7 if 'evidence' in narrative or 'transaction' in narrative else 0.5
    
    # NEW: Incorporate regulatory defensibility score
    try:
        simulation = simulate_regulatory_review(db, sar_id)
        defensibility_score = simulation["overall_defensibility_score"]
    except Exception:
        # Fallback if simulation fails
        defensibility_score = 0.5
    
    # Enhanced overall score: 60% traditional metrics + 40% defensibility
    traditional_score = (evidence_coverage + completeness + confidence + traceability) / 4.0
    overall = (traditional_score * 0.6) + (defensibility_score * 0.4)
    
    cqi = models.CQIScore(
        sar_id=sar.id,
        evidence_coverage=float(evidence_coverage),
        completeness=float(completeness),
        confidence=float(confidence),
        traceability=float(traceability),
        overall_score=float(overall),
        calculated_at=datetime.utcnow(),
    )
    db.add(cqi)
    db.commit()
    db.refresh(cqi)
    return cqi

