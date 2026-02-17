"""
Enhanced Risk Analysis & Typology Detection Engine
Detects:
- Structuring
- Layering
- Velocity anomalies
- Income-to-transaction mismatch
- Geographic risk
- Counterparty risk propagation
"""
from .. import models
from sqlalchemy.orm import Session
from sklearn.cluster import KMeans
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import Counter


def analyze_transaction_risk(db: Session, case_id: int) -> Dict[str, Any]:
    """
    Comprehensive risk analysis of transaction patterns
    Returns structured risk intelligence profile
    """
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case or not case.customer_id:
        return {"error": "Case or customer not found"}
    
    customer = db.query(models.Customer).filter(models.Customer.id == case.customer_id).first()
    transactions = []
    for account in customer.accounts:
        transactions.extend(account.transactions)
    
    risk_profile = {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "risk_rating": customer.risk_rating,
        "total_transactions": len(transactions),
        "total_volume": sum(t.amount for t in transactions),
        "detections": []
    }
    
    # 1. Structuring Detection
    structuring_score = _detect_structuring(transactions)
    if structuring_score > 0.7:
        risk_profile["detections"].append({
            "type": "structuring",
            "score": structuring_score,
            "severity": "HIGH" if structuring_score > 0.9 else "MEDIUM",
            "evidence": "Multiple transactions below reporting threshold detected",
            "recommendation": "Flag for enhanced due diligence"
        })
    
    # 2. Layering Detection
    layering_score = _detect_layering(transactions)
    if layering_score > 0.6:
        risk_profile["detections"].append({
            "type": "layering",
            "score": layering_score,
            "severity": "HIGH" if layering_score > 0.8 else "MEDIUM",
            "evidence": "Complex transaction chains indicating obfuscation",
            "recommendation": "Investigate transaction origins"
        })
    
    # 3. Velocity Anomaly Detection
    velocity_score = _detect_velocity_anomaly(transactions)
    if velocity_score > 0.75:
        risk_profile["detections"].append({
            "type": "velocity_anomaly",
            "score": velocity_score,
            "severity": "HIGH" if velocity_score > 0.9 else "MEDIUM",
            "evidence": f"Abnormally high transaction frequency: {len(transactions)} in short period",
            "recommendation": "Review customer business profile"
        })
    
    # 4. Income-to-Transaction Mismatch
    mismatch_score = _detect_income_mismatch(customer, transactions)
    if mismatch_score > 0.7:
        risk_profile["detections"].append({
            "type": "income_mismatch",
            "score": mismatch_score,
            "severity": "HIGH",
            "evidence": "Transaction volume inconsistent with stated income/business profile",
            "recommendation": "Request updated KYC documentation"
        })
    
    # 5. Geographic Risk
    geo_risk_score = _evaluate_geographic_risk(transactions)
    if geo_risk_score > 0.65:
        risk_profile["detections"].append({
            "type": "geographic_risk",
            "score": geo_risk_score,
            "severity": "MEDIUM",
            "evidence": "Transactions involving high-risk jurisdictions",
            "recommendation": "Enhanced monitoring for sanctions compliance"
        })
    
    # 6. Counterparty Risk Propagation
    counterparty_score = _analyze_counterparty_risk(transactions)
    if counterparty_score > 0.6:
        risk_profile["detections"].append({
            "type": "counterparty_risk",
            "score": counterparty_score,
            "severity": "MEDIUM" if counterparty_score < 0.8 else "HIGH",
            "evidence": "Transactions with potentially high-risk counterparties",
            "recommendation": "Conduct counterparty due diligence"
        })
    
    # Overall risk score
    if risk_profile["detections"]:
        risk_profile["overall_risk_score"] = np.mean([d["score"] for d in risk_profile["detections"]])
        risk_profile["risk_level"] = _categorize_risk(risk_profile["overall_risk_score"])
    else:
        risk_profile["overall_risk_score"] = 0.0
        risk_profile["risk_level"] = "LOW"
    
    return risk_profile


def _detect_structuring(transactions: List) -> float:
    """Detect structuring (smurfing) patterns"""
    if len(transactions) < 3:
        return 0.0
    
    # Threshold just below reporting limit ($10,000 USD)
    THRESHOLD = 9500
    suspicious_count = sum(1 for t in transactions if 8000 <= t.amount <= THRESHOLD)
    
    if suspicious_count >= 3:
        # Check temporal clustering
        timestamps = [t.timestamp for t in transactions if 8000 <= t.amount <= THRESHOLD]
        if timestamps:
            time_deltas = [(timestamps[i+1] - timestamps[i]).total_seconds() / 3600 
                           for i in range(len(timestamps)-1)]
            # If transactions within 24 hours
            clustered = sum(1 for delta in time_deltas if delta < 24)
            return min(1.0, 0.6 + (clustered / len(transactions)) * 0.4)
    
    return min(1.0, suspicious_count / len(transactions))


def _detect_layering(transactions: List) -> float:
    """Detect layering through complex transaction patterns"""
    if len(transactions) < 5:
        return 0.0
    
    # Look for rapid movement patterns
    wire_transfers = [t for t in transactions if 'wire' in t.txn_type.lower()]
    if len(wire_transfers) >= 3:
        # High number of wire transfers suggests layering
        return min(1.0, len(wire_transfers) / len(transactions) + 0.3)
    
    # Check for round-trip patterns (placeholder - would need counterparty data)
    return min(0.8, len(wire_transfers) / 10.0)


def _detect_velocity_anomaly(transactions: List) -> float:
    """Detect abnormal transaction velocity"""
    if len(transactions) < 2:
        return 0.0
    
    # Calculate transaction frequency
    timestamps = sorted([t.timestamp for t in transactions])
    time_span = (timestamps[-1] - timestamps[0]).total_seconds() / 86400  # days
    
    if time_span < 1:
        time_span = 1  # At least 1 day
    
    velocity = len(transactions) / time_span
    
    # Normal business: ~2-5 transactions/day
    # Suspicious: >15 transactions/day
    if velocity > 15:
        return min(1.0, velocity / 20.0)
    elif velocity > 10:
        return 0.75
    elif velocity > 7:
        return 0.6
    return 0.0


def _detect_income_mismatch(customer, transactions: List) -> float:
    """Detect mismatch between customer profile and transaction volume"""
    if not transactions:
        return 0.0
    
    total_volume = sum(t.amount for t in transactions)
    
    # Simplified risk scoring based on customer risk rating
    # In production, would compare against declared income/revenue
    if customer.risk_rating >= 4:  # High risk customer
        if total_volume > 500000:  # $500k threshold
            return 0.9
        elif total_volume > 250000:
            return 0.75
    
    if total_volume > 1000000:  # $1M threshold for any customer
        return 0.85
    
    return min(1.0, total_volume / 2000000)  # Scale up to $2M


def _evaluate_geographic_risk(transactions: List) -> float:
    """Evaluate geographic risk factors"""
    # Simplified - would integrate with sanctions lists & high-risk jurisdictions
    # Check transaction metadata for geographic indicators
    
    high_risk_keywords = ['offshore', 'cayman', 'panama', 'hong kong', 'switzerland']
    risk_count = 0
    
    for t in transactions:
        metadata = (t.meta_data or "").lower()
        if any(keyword in metadata for keyword in high_risk_keywords):
            risk_count += 1
    
    if risk_count > 0:
        return min(1.0, risk_count / len(transactions) + 0.5)
    
    return 0.0


def _analyze_counterparty_risk(transactions: List) -> float:
    """Analyze counterparty risk propagation"""
    # Simplified - would perform network analysis of counterparties
    # Check for PEP, sanctions, adverse media
    
    # For demo: check transaction patterns
    large_transactions = [t for t in transactions if t.amount > 50000]
    
    if large_transactions:
        return min(0.8, len(large_transactions) / len(transactions) + 0.4)
    
    return 0.0


def _categorize_risk(score: float) -> str:
    """Categorize overall risk level"""
    if score >= 0.85:
        return "CRITICAL"
    elif score >= 0.70:
        return "HIGH"
    elif score >= 0.50:
        return "MEDIUM"
    elif score >= 0.30:
        return "LOW"
    return "MINIMAL"


def store_risk_analysis(db: Session, case_id: int, risk_profile: Dict[str, Any]):
    """Store risk analysis results in database"""
    # This would create Risk Analysis records
    # For now, we'll use the existing typology detection table
    for detection in risk_profile.get("detections", []):
        typology = models.TypologyDetection(
            sar_id=None,  # Link to SAR later
            detection_type=detection["type"],
            score=detection["score"],
            details=f"{detection['evidence']} | {detection['recommendation']}",
            created_at=datetime.utcnow()
        )
        db.add(typology)
    
    db.commit()
    return risk_profile
