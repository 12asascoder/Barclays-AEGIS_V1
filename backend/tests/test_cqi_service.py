"""
Unit tests for CQI service
"""
import pytest
from unittest.mock import Mock
from app.services.cqi_service import calculate_cqi
from app import models


def test_calculate_cqi_basic():
    """Test CQI calculation with a basic SAR narrative"""
    db_mock = Mock()
    
    # Create a mock SAR
    sar = models.SARReport(
        id=1,
        sar_ref="SAR-TEST-001",
        narrative="This transaction shows evidence of structuring. Multiple txn_id references: txn_id_001, txn_id_002, txn_id_003. The likely pattern suggests probable money laundering.",
        approved=False
    )
    
    db_mock.query().filter().first.return_value = sar
    db_mock.add = Mock()
    db_mock.commit = Mock()
    db_mock.refresh = Mock()
    
    # Calculate CQI
    cqi = calculate_cqi(db_mock, sar_id=1)
    
    # Assertions
    assert cqi.evidence_coverage > 0.5  # Has txn_id references
    assert cqi.confidence > 0.5  # Has 'likely' and 'probable'
    assert cqi.traceability > 0.5  # Has 'evidence' and 'transaction'
    assert 0.0 <= cqi.overall_score <= 1.0


def test_calculate_cqi_empty_narrative():
    """Test CQI calculation with empty narrative"""
    db_mock = Mock()
    
    sar = models.SARReport(
        id=2,
        sar_ref="SAR-TEST-002",
        narrative="",
        approved=False
    )
    
    db_mock.query().filter().first.return_value = sar
    db_mock.add = Mock()
    db_mock.commit = Mock()
    db_mock.refresh = Mock()
    
    cqi = calculate_cqi(db_mock, sar_id=2)
    
    # Empty narrative should result in low scores
    assert cqi.evidence_coverage == 0.0
    assert cqi.completeness == 0.0
    assert cqi.overall_score < 0.5


def test_calculate_cqi_not_found():
    """Test CQI calculation when SAR doesn't exist"""
    db_mock = Mock()
    db_mock.query().filter().first.return_value = None
    
    with pytest.raises(ValueError, match="SAR not found"):
        calculate_cqi(db_mock, sar_id=999)
