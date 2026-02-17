"""
Risk Analysis & Regulatory Simulation API Endpoints
Exposes advanced risk detection and SAR defensibility analysis
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from .. import models
from ..database import get_db
from ..services.risk_analysis_service import analyze_transaction_risk
from ..services.regulatory_simulation_service import (
    perform_regulatory_simulation,
    get_improvement_plan
)
from ..services.cross_case_intelligence_service import generate_intelligence_report
from ..auth import get_current_user

router = APIRouter(prefix="/risk", tags=["Risk Analysis"])


@router.get("/analyze/{case_id}")
def analyze_case_risk(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Perform comprehensive risk analysis on a case
    Detects 6 typologies: structuring, layering, velocity, income mismatch, geographic, counterparty
    """
    # Verify case exists
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )
    
    try:
        risk_profile = analyze_transaction_risk(db, case_id)
        return {
            "success": True,
            "case_id": case_id,
            "case_ref": case.case_ref,
            "risk_profile": risk_profile
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk analysis failed: {str(e)}"
        )


@router.post("/sar/{sar_id}/simulate")
def simulate_regulatory_review(
    sar_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    THE DIFFERENTIATOR FEATURE
    Simulate regulatory review of a SAR before filing
    Returns defensibility score, gaps, recommendations
    """
    # Verify SAR exists
    sar = db.query(models.SARReport).filter(models.SARReport.id == sar_id).first()
    if not sar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SAR {sar_id} not found"
        )
    
    try:
        simulation_results = perform_regulatory_simulation(db, sar_id)
        
        # Get improvement plan
        improvement_plan = get_improvement_plan(simulation_results)
        
        return {
            "success": True,
            "sar_id": sar_id,
            "sar_ref": sar.sar_ref,
            "simulation": simulation_results,
            "improvement_plan": improvement_plan
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Regulatory simulation failed: {str(e)}"
        )


@router.get("/sar/{sar_id}/readiness")
def check_filing_readiness(
    sar_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Quick check: Is this SAR ready to file?
    """
    sar = db.query(models.SARReport).filter(models.SARReport.id == sar_id).first()
    if not sar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SAR {sar_id} not found"
        )
    
    try:
        simulation = perform_regulatory_simulation(db, sar_id)
        
        ready = simulation["regulatory_readiness"] in ["READY_TO_FILE", "MINOR_REVISIONS_NEEDED"]
        
        return {
            "sar_id": sar_id,
            "sar_ref": sar.sar_ref,
            "ready_to_file": ready,
            "defensibility_score": simulation["overall_defensibility_score"],
            "grade": simulation["grade"],
            "readiness_status": simulation["regulatory_readiness"],
            "critical_gaps": [g for g in simulation["gaps"] if g["severity"] == "CRITICAL"],
            "quick_actions": simulation["recommendations"][:3]  # Top 3
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Readiness check failed: {str(e)}"
        )


@router.get("/intelligence/cross-case")
def get_cross_case_intelligence(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate enterprise-level cross-case intelligence report
    Detects emerging threats, typology drift, network risks
    Requires admin or auditor role
    """
    if current_user.role not in ["admin", "auditor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin or auditor role required."
        )
    
    try:
        intelligence = generate_intelligence_report(db)
        return {
            "success": True,
            "intelligence": intelligence
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intelligence generation failed: {str(e)}"
        )


@router.get("/dashboard/risk-summary")
def get_risk_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Risk summary for dashboard visualization
    """
    # Get all typology detections
    typologies = db.query(models.TypologyDetection).all()
    
    # Count by type
    type_counts = {}
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    
    for typ in typologies:
        # Count by type
        type_counts[typ.detection_type] = type_counts.get(typ.detection_type, 0) + 1
        
        # Parse metadata for severity
        import json
        try:
            meta = json.loads(typ.metadata) if typ.metadata else {}
            severity = meta.get("severity", "MEDIUM")
            if severity in severity_counts:
                severity_counts[severity] += 1
        except:
            pass
    
    # Get recent SARs with CQI scores
    recent_sars = db.query(models.SARReport).order_by(models.SARReport.created_at.desc()).limit(10).all()
    
    avg_cqi = 0
    if recent_sars:
        cqi_scores = []
        for sar in recent_sars:
            cqi = db.query(models.CQIScore).filter(models.CQIScore.sar_id == sar.id).first()
            if cqi:
                cqi_scores.append(cqi.overall_score)
        
        if cqi_scores:
            avg_cqi = sum(cqi_scores) / len(cqi_scores)
    
    return {
        "typology_distribution": type_counts,
        "severity_breakdown": severity_counts,
        "total_detections": len(typologies),
        "average_cqi_score": round(avg_cqi, 2),
        "recent_sar_count": len(recent_sars),
        "high_risk_cases": severity_counts["CRITICAL"] + severity_counts["HIGH"]
    }
