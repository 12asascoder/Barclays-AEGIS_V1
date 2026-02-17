"""
Cross-Case Intelligence & Typology Drift Detection Engine
Analyzes patterns across ALL SARs to detect emerging threats
Provides forward-looking intelligence from historical data
"""
from .. import models
from sqlalchemy.orm import Session
from sklearn.cluster import KMeans, DBSCAN
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import numpy as np
import re


class CrossCaseIntelligenceEngine:
    """
    Analyzes patterns across all cases and SARs
    Detects emerging typologies and threat trends
    """
    
    def analyze_cross_case_patterns(self, db: Session) -> Dict[str, Any]:
        """
        Main analysis method
        Returns enterprise-level intelligence
        """
        # Fetch all SARs
        sars = db.query(models.SARReport).all()
        if len(sars) < 2:
            return {"message": "Insufficient data for cross-case analysis"}
        
        results = {
            "total_cases_analyzed": len(sars),
            "analysis_date": datetime.utcnow().isoformat(),
            "pattern_clusters": [],
            "emerging_typologies": [],
            "drift_alerts": [],
            "network_risks": [],
            "temporal_trends": {},
            "recommendations": []
        }
        
        # 1. Pattern Clustering
        clusters = self._cluster_sar_narratives(sars)
        results["pattern_clusters"] = clusters
        
        # 2. Typology Drift Detection
        drift_analysis = self._detect_typology_drift(db)
        results["drift_alerts"] = drift_analysis
        
        # 3. Emerging Typology Detection
        emerging = self._identify_emerging_typologies(db, sars)
        results["emerging_typologies"] = emerging
        
        # 4. Network Risk Analysis
        network_risks = self._analyze_network_patterns(db)
        results["network_risks"] = network_risks
        
        # 5. Temporal Trends
        trends = self._analyze_temporal_trends(sars)
        results["temporal_trends"] = trends
        
        # Generate executive recommendations
        results["recommendations"] = self._generate_executive_recommendations(results)
        
        return results
    
    def _cluster_sar_narratives(self, sars: List) -> List[Dict[str, Any]]:
        """
        Cluster SAR narratives to find similar patterns
        """
        if len(sars) < 3:
            return []
        
        # Extract narratives
        narratives = [sar.narrative or "" for sar in sars]
        sar_refs = [sar.sar_ref for sar in sars]
        
        try:
            # TF-IDF vectorization
            vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
            vectors = vectorizer.fit_transform(narratives)
            
            # K-Means clustering
            n_clusters = min(5, len(sars) // 2)
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(vectors)
            
            # Organize results
            clusters = []
            for cluster_id in range(n_clusters):
                cluster_sars = [sar_refs[i] for i, label in enumerate(cluster_labels) if label == cluster_id]
                if cluster_sars:
                    # Extract common keywords
                    cluster_narratives = [narratives[i] for i, label in enumerate(cluster_labels) if label == cluster_id]
                    common_keywords = self._extract_common_keywords(cluster_narratives)
                    
                    clusters.append({
                        "cluster_id": cluster_id,
                        "size": len(cluster_sars),
                        "sar_refs": cluster_sars,
                        "common_keywords": common_keywords[:10],
                        "pattern_type": self._infer_pattern_type(common_keywords)
                    })
            
            return clusters
        except Exception as e:
            return [{"error": f"Clustering failed: {str(e)}"}]
    
    def _extract_common_keywords(self, narratives: List[str]) -> List[str]:
        """Extract most common keywords from cluster"""
        all_words = []
        for narrative in narratives:
            words = re.findall(r'\b[a-z]{4,}\b', narrative.lower())
            all_words.extend(words)
        
        # Filter out common words
        stop_words = {'this', 'that', 'with', 'from', 'have', 'been', 'were', 'will', 
                      'their', 'there', 'what', 'when', 'which', 'would', 'could', 'should'}
        filtered = [w for w in all_words if w not in stop_words]
        
        return [word for word, _ in Counter(filtered).most_common(15)]
    
    def _infer_pattern_type(self, keywords: List[str]) -> str:
        """Infer typology from keywords"""
        keyword_set = set(keywords)
        
        if any(k in keyword_set for k in ['structur', 'split', 'multiple', 'below']):
            return "Structuring Pattern"
        elif any(k in keyword_set for k in ['layer', 'complex', 'chain', 'obfusc']):
            return "Layering Pattern"
        elif any(k in keyword_set for k in ['rapid', 'velocity', 'frequent', 'many']):
            return "Velocity Anomaly"
        elif any(k in keyword_set for k in ['offshore', 'international', 'foreign']):
            return "Geographic Risk Pattern"
        else:
            return "Mixed/Unknown Pattern"
    
    def _detect_typology_drift(self, db: Session) -> List[Dict[str, Any]]:
        """
        Detect shifts in typology patterns over time
        """
        # Get typology detections over time
        typologies = db.query(models.TypologyDetection).order_by(models.TypologyDetection.created_at).all()
        
        if len(typologies) < 10:
            return []
        
        # Group by time periods (last 30 days vs previous 30 days)
        now = datetime.utcnow()
        recent_period = now - timedelta(days=30)
        previous_period = now - timedelta(days=60)
        
        recent_types = Counter([t.detection_type for t in typologies if t.created_at >= recent_period])
        previous_types = Counter([t.detection_type for t in typologies 
                                 if previous_period <= t.created_at < recent_period])
        
        drift_alerts = []
        for typology_type in set(list(recent_types.keys()) + list(previous_types.keys())):
            recent_count = recent_types.get(typology_type, 0)
            previous_count = previous_types.get(typology_type, 0)
            
            if previous_count > 0:
                change_pct = ((recent_count - previous_count) / previous_count) * 100
                
                if abs(change_pct) > 50:  # Significant change
                    drift_alerts.append({
                        "typology": typology_type,
                        "trend": "INCREASING" if change_pct > 0 else "DECREASING",
                        "change_percentage": f"{change_pct:+.1f}%",
                        "recent_count": recent_count,
                        "previous_count": previous_count,
                        "severity": "HIGH" if abs(change_pct) > 100 else "MEDIUM",
                        "recommendation": self._get_drift_recommendation(typology_type, change_pct)
                    })
        
        return sorted(drift_alerts, key=lambda x: abs(float(x["change_percentage"].rstrip('%'))), reverse=True)
    
    def _get_drift_recommendation(self, typology: str, change_pct: float) -> str:
        """Get recommendation based on drift"""
        if change_pct > 0:
            return f"Increasing {typology} activity detected. Recommend enhanced monitoring and resource allocation."
        else:
            return f"Decreasing {typology} activity. Review detection rules for potential evasion techniques."
    
    def _identify_emerging_typologies(self, db: Session, sars: List) -> List[Dict[str, Any]]:
        """
        Identify new or emerging suspicious patterns
        """
        # Recent SARs (last 30 days)
        recent_cutoff = datetime.utcnow() - timedelta(days=30)
        recent_sars = [s for s in sars if s.created_at >= recent_cutoff]
        
        if len(recent_sars) < 3:
            return []
        
        # Extract unique patterns from recent narratives
        all_keywords = []
        for sar in recent_sars:
            narrative = sar.narrative or ""
            keywords = re.findall(r'\b[a-z]{5,}\b', narrative.lower())
            all_keywords.extend(keywords)
        
        # Find keywords that appear frequently in recent period
        keyword_freq = Counter(all_keywords)
        
        # Common AML keywords to focus on
        aml_keywords = ['cryptocurrency', 'crypto', 'bitcoin', 'wallet', 'mixer', 'tumbler', 
                        'darknet', 'ransomware', 'mule', 'synthetic', 'identity', 'deepfake',
                        'nft', 'defi', 'stablecoin', 'metaverse', 'gaming']
        
        emerging = []
        for keyword in aml_keywords:
            count = keyword_freq.get(keyword, 0)
            if count >= 2:  # Appears in multiple recent SARs
                emerging.append({
                    "pattern_keyword": keyword,
                    "frequency": count,
                    "emergence_date": recent_cutoff.isoformat(),
                    "risk_level": "HIGH" if count >= 4 else "MEDIUM",
                    "description": f"New pattern involving '{keyword}' detected in {count} recent SARs",
                    "recommendation": f"Establish monitoring protocols for {keyword}-related activities"
                })
        
        return sorted(emerging, key=lambda x: x["frequency"], reverse=True)
    
    def _analyze_network_patterns(self, db: Session) -> List[Dict[str, Any]]:
        """
        Analyze network-level suspicious patterns
        (Simplified - would use graph analysis in production)
        """
        # Get all cases with customers
        cases = db.query(models.Case).filter(models.Case.customer_id.isnot(None)).all()
        
        # Group by customer to find multiple cases per customer
        customer_case_count = defaultdict(list)
        for case in cases:
            customer_case_count[case.customer_id].append(case.case_ref)
        
        network_risks = []
        for customer_id, case_refs in customer_case_count.items():
            if len(case_refs) >= 2:
                customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
                network_risks.append({
                    "customer_id": customer.customer_id,
                    "customer_name": customer.name,
                    "linked_cases": case_refs,
                    "case_count": len(case_refs),
                    "risk_score": min(1.0, len(case_refs) / 5.0),
                    "pattern": "Repeat suspicious activity",
                    "recommendation": "Conduct comprehensive relationship review"
                })
        
        return sorted(network_risks, key=lambda x: x["case_count"], reverse=True)
    
    def _analyze_temporal_trends(self, sars: List) -> Dict[str, Any]:
        """
        Analyze temporal trends in SAR generation
        """
        if not sars:
            return {}
        
        # Group by month
        monthly_counts = defaultdict(int)
        for sar in sars:
            month_key = sar.created_at.strftime("%Y-%m")
            monthly_counts[month_key] += 1
        
        # Calculate trend
        sorted_months = sorted(monthly_counts.items())
        if len(sorted_months) >= 2:
            recent_avg = np.mean([count for _, count in sorted_months[-3:]])
            previous_avg = np.mean([count for _, count in sorted_months[:-3]]) if len(sorted_months) > 3 else recent_avg
            
            trend_direction = "INCREASING" if recent_avg > previous_avg else "DECREASING" if recent_avg < previous_avg else "STABLE"
            change = ((recent_avg - previous_avg) / previous_avg * 100) if previous_avg > 0 else 0
        else:
            trend_direction = "INSUFFICIENT_DATA"
            change = 0
        
        return {
            "monthly_volumes": dict(monthly_counts),
            "trend_direction": trend_direction,
            "volume_change_pct": f"{change:+.1f}%",
            "recent_monthly_avg": f"{recent_avg:.1f}" if len(sorted_months) >= 2 else "N/A"
        }
    
    def _generate_executive_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate executive-level strategic recommendations"""
        recommendations = []
        
        # Drift-based recommendations
        if analysis.get("drift_alerts"):
            high_drift = [d for d in analysis["drift_alerts"] if d["severity"] == "HIGH"]
            if high_drift:
                recommendations.append({
                    "category": "Typology Drift",
                    "priority": "CRITICAL",
                    "finding": f"{len(high_drift)} typologies showing significant drift",
                    "action": "Immediate review of detection rules and analyst training",
                    "impact": "Potential regulatory exposure if emerging patterns not addressed"
                })
        
        # Emerging threat recommendations
        if analysis.get("emerging_typologies"):
            recommendations.append({
                "category": "Emerging Threats",
                "priority": "HIGH",
                "finding": f"{len(analysis['emerging_typologies'])} new suspicious patterns detected",
                "action": "Establish dedicated monitoring and enhance detection capabilities",
                "impact": "Proactive risk mitigation and regulatory readiness"
            })
        
        # Network risk recommendations
        if analysis.get("network_risks"):
            recommendations.append({
                "category": "Network Risk",
                "priority": "HIGH",
                "finding": f"{len(analysis['network_risks'])} customers with multiple suspicious cases",
                "action": "Conduct comprehensive relationship reviews and consider account closure",
                "impact": "Reduce institutional exposure to repeat offenders"
            })
        
        # Volume trend recommendations
        trends = analysis.get("temporal_trends", {})
        if trends.get("trend_direction") == "INCREASING":
            recommendations.append({
                "category": "Volume Trend",
                "priority": "MEDIUM",
                "finding": f"SAR volume increasing by {trends.get('volume_change_pct', '0%')}",
                "action": "Assess resource adequacy and process efficiency",
                "impact": "Maintain quality standards while handling increased workload"
            })
        
        return recommendations


def generate_intelligence_report(db: Session) -> Dict[str, Any]:
    """
    Generate comprehensive cross-case intelligence report
    """
    engine = CrossCaseIntelligenceEngine()
    analysis = engine.analyze_cross_case_patterns(db)
    
    # Store as audit log
    audit = models.AuditLog(
        user_id=None,  # System-generated
        action="CROSS_CASE_INTELLIGENCE_GENERATED",
        entity_type="System",
        entity_id="intelligence_engine",
        metadata=f"Analyzed {analysis.get('total_cases_analyzed', 0)} cases, {len(analysis.get('drift_alerts', []))} drift alerts",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return analysis
