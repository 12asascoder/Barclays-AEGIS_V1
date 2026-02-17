"""
Regulatory Simulation Engine
THE DIFFERENTIATOR FEATURE

Simulates how regulators evaluate SARs
Identifies weaknesses before filing
Provides defensibility scoring and improvement recommendations
"""
from .. import models
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from datetime import datetime
import re


class RegulatorySimulator:
    """
    Simulates regulatory review of SAR reports
    Provides defensibility scoring and gap analysis
    """
    
    def __init__(self):
        # Regulatory requirements checklist
        self.requirements = {
            "subject_identification": {
                "weight": 0.20,
                "keywords": ["customer", "subject", "account holder", "individual", "entity", "name"],
                "min_references": 2
            },
            "suspicious_activity_description": {
                "weight": 0.25,
                "keywords": ["suspicious", "unusual", "red flag", "indicator", "pattern", "activity"],
                "min_references": 3
            },
            "transaction_details": {
                "weight": 0.20,
                "keywords": ["transaction", "amount", "date", "txn_id", "transfer", "payment"],
                "min_references": 4
            },
            "timeline_chronology": {
                "weight": 0.15,
                "keywords": ["timeline", "period", "between", "occurred", "date", "when"],
                "min_references": 2
            },
            "evidence_citations": {
                "weight": 0.10,
                "keywords": ["evidence", "documented", "recorded", "observed", "noted", "reference"],
                "min_references": 3
            },
            "regulatory_reasoning": {
                "weight": 0.10,
                "keywords": ["reasonable", "belief", "suspicious", "indicates", "suggests", "likely"],
                "min_references": 2
            }
        }
    
    def simulate_regulatory_review(self, db: Session, sar_id: int) -> Dict[str, Any]:
        """
        Main simulation method
        Returns comprehensive defensibility assessment
        """
        sar = db.query(models.SARReport).filter(models.SARReport.id == sar_id).first()
        if not sar:
            return {"error": "SAR not found"}
        
        narrative = sar.narrative or ""
        
        # Run all regulatory checks
        results = {
            "sar_id": sar.id,
            "sar_ref": sar.sar_ref,
            "overall_defensibility_score": 0.0,
            "grade": "",
            "requirement_scores": {},
            "gaps": [],
            "strengths": [],
            "recommendations": [],
            "regulatory_readiness": "",
            "simulated_at": datetime.utcnow().isoformat()
        }
        
        # Score each requirement
        total_score = 0.0
        for requirement_name, criteria in self.requirements.items():
            score = self._score_requirement(narrative, criteria)
            results["requirement_scores"][requirement_name] = {
                "score": score,
                "weight": criteria["weight"],
                "weighted_score": score * criteria["weight"]
            }
            total_score += score * criteria["weight"]
            
            # Identify gaps
            if score < 0.7:
                results["gaps"].append({
                    "requirement": requirement_name,
                    "severity": "CRITICAL" if score < 0.4 else "HIGH" if score < 0.6 else "MEDIUM",
                    "current_score": score,
                    "gap": f"Missing or insufficient {requirement_name.replace('_', ' ')}",
                    "required_improvement": f"{(0.9 - score) * 100:.0f}% improvement needed"
                })
            elif score >= 0.85:
                results["strengths"].append({
                    "requirement": requirement_name,
                    "score": score,
                    "note": f"Excellent {requirement_name.replace('_', ' ')} coverage"
                })
        
        results["overall_defensibility_score"] = total_score
        results["grade"] = self._assign_grade(total_score)
        results["regulatory_readiness"] = self._assess_readiness(total_score, len(results["gaps"]))
        
        # Generate recommendations
        results["recommendations"] = self._generate_recommendations(results)
        
        # Structural analysis
        structure_analysis = self._analyze_structure(narrative)
        results["structure_quality"] = structure_analysis
        
        return results
    
    def _score_requirement(self, narrative: str, criteria: Dict) -> float:
        """Score a specific regulatory requirement"""
        narrative_lower = narrative.lower()
        
        # Count keyword matches
        keyword_matches = sum(
            narrative_lower.count(keyword) 
            for keyword in criteria["keywords"]
        )
        
        # Score based on presence and frequency
        if keyword_matches >= criteria["min_references"] * 2:
            return 1.0
        elif keyword_matches >= criteria["min_references"]:
            return 0.85
        elif keyword_matches >= criteria["min_references"] * 0.7:
            return 0.65
        elif keyword_matches > 0:
            return 0.40
        return 0.0
    
    def _analyze_structure(self, narrative: str) -> Dict[str, Any]:
        """Analyze narrative structure and organization"""
        paragraphs = [p.strip() for p in narrative.split('\n\n') if p.strip()]
        sentences = re.split(r'[.!?]+', narrative)
        
        return {
            "paragraph_count": len(paragraphs),
            "sentence_count": len(sentences),
            "avg_sentence_length": len(narrative) / max(len(sentences), 1),
            "has_clear_sections": len(paragraphs) >= 3,
            "structural_score": min(1.0, len(paragraphs) / 4.0) * 0.5 + min(1.0, len(sentences) / 10.0) * 0.5
        }
    
    def _assign_grade(self, score: float) -> str:
        """Assign letter grade based on defensibility score"""
        if score >= 0.90:
            return "A+ (Excellent)"
        elif score >= 0.85:
            return "A (Very Strong)"
        elif score >= 0.80:
            return "B+ (Strong)"
        elif score >= 0.75:
            return "B (Good)"
        elif score >= 0.70:
            return "C+ (Acceptable)"
        elif score >= 0.65:
            return "C (Marginal)"
        elif score >= 0.60:
            return "D (Weak)"
        return "F (Inadequate)"
    
    def _assess_readiness(self, score: float, gap_count: int) -> str:
        """Assess regulatory filing readiness"""
        if score >= 0.85 and gap_count == 0:
            return "READY_TO_FILE"
        elif score >= 0.75 and gap_count <= 1:
            return "MINOR_REVISIONS_NEEDED"
        elif score >= 0.65:
            return "SIGNIFICANT_REVISIONS_REQUIRED"
        elif score >= 0.50:
            return "MAJOR_REWORK_REQUIRED"
        return "NOT_READY_FOR_FILING"
    
    def _generate_recommendations(self, results: Dict) -> List[Dict[str, str]]:
        """Generate actionable improvement recommendations"""
        recommendations = []
        
        for gap in results["gaps"]:
            requirement = gap["requirement"]
            
            if requirement == "subject_identification":
                recommendations.append({
                    "priority": "HIGH",
                    "requirement": requirement,
                    "action": "Add clear identification of subject including full name, account numbers, and role",
                    "expected_impact": "+15-20% defensibility improvement"
                })
            
            elif requirement == "suspicious_activity_description":
                recommendations.append({
                    "priority": "CRITICAL",
                    "requirement": requirement,
                    "action": "Provide detailed description of suspicious patterns with specific red flag indicators",
                    "expected_impact": "+20-25% defensibility improvement"
                })
            
            elif requirement == "transaction_details":
                recommendations.append({
                    "priority": "HIGH",
                    "requirement": requirement,
                    "action": "Include specific transaction amounts, dates, and reference numbers",
                    "expected_impact": "+15-18% defensibility improvement"
                })
            
            elif requirement == "timeline_chronology":
                recommendations.append({
                    "priority": "MEDIUM",
                    "requirement": requirement,
                    "action": "Create clear chronological timeline of events with specific dates",
                    "expected_impact": "+10-12% defensibility improvement"
                })
            
            elif requirement == "evidence_citations":
                recommendations.append({
                    "priority": "HIGH",
                    "requirement": requirement,
                    "action": "Reference specific evidence sources and documentation",
                    "expected_impact": "+12-15% defensibility improvement"
                })
            
            elif requirement == "regulatory_reasoning":
                recommendations.append({
                    "priority": "CRITICAL",
                    "requirement": requirement,
                    "action": "Articulate clear reasoning for why activity is considered suspicious under regulations",
                    "expected_impact": "+18-22% defensibility improvement"
                })
        
        # Add structural recommendations
        if results.get("structure_quality", {}).get("structural_score", 1.0) < 0.7:
            recommendations.append({
                "priority": "MEDIUM",
                "requirement": "narrative_structure",
                "action": "Improve narrative organization with clear sections and logical flow",
                "expected_impact": "+8-10% defensibility improvement"
            })
        
        return recommendations


def simulate_regulatory_review(db: Session, sar_id: int) -> Dict[str, Any]:
    """
    Convenience function to run regulatory simulation
    Stores results and returns analysis
    """
    simulator = RegulatorySimulator()
    results = simulator.simulate_regulatory_review(db, sar_id)
    
    # Store simulation results as audit log
    audit = models.AuditLog(
        user_id=None,  # System-generated
        action="REGULATORY_SIMULATION",
        entity_type="SARReport",
        entity_id=str(sar_id),
        metadata=f"Defensibility Score: {results['overall_defensibility_score']:.2f}, Grade: {results['grade']}, Gaps: {len(results['gaps'])}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return results


def get_improvement_plan(simulation_results: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate detailed improvement plan based on simulation results
    """
    plan = {
        "current_state": {
            "score": simulation_results["overall_defensibility_score"],
            "grade": simulation_results["grade"],
            "readiness": simulation_results["regulatory_readiness"]
        },
        "target_state": {
            "score": 0.90,
            "grade": "A+",
            "readiness": "READY_TO_FILE"
        },
        "required_improvements": [],
        "estimated_effort": "",
        "priority_actions": []
    }
    
    # Sort recommendations by priority
    critical = [r for r in simulation_results["recommendations"] if r["priority"] == "CRITICAL"]
    high = [r for r in simulation_results["recommendations"] if r["priority"] == "HIGH"]
    medium = [r for r in simulation_results["recommendations"] if r["priority"] == "MEDIUM"]
    
    plan["priority_actions"] = critical + high + medium
    plan["required_improvements"] = len(simulation_results["gaps"])
    
    # Estimate effort
    if simulation_results["overall_defensibility_score"] >= 0.75:
        plan["estimated_effort"] = "1-2 hours of revision"
    elif simulation_results["overall_defensibility_score"] >= 0.65:
        plan["estimated_effort"] = "3-5 hours of revision"
    else:
        plan["estimated_effort"] = "6-10 hours of major rework"
    
    return plan
