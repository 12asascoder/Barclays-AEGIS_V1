"""
Unit tests for Typology Detection service
"""
import pytest
from unittest.mock import Mock
from app.services.typology_service import detect_typologies
from app import models


def test_detect_structuring():
    """Test detection of structuring typology"""
    db_mock = Mock()
    
    sar = models.SARReport(
        id=1,
        sar_ref="SAR-TEST-001",
        narrative="The customer engaged in structuring transactions by splitting large amounts into smaller deposits.",
        approved=False
    )
    
    db_mock.query().filter().first.return_value = sar
    db_mock.add = Mock()
    db_mock.commit = Mock()
    db_mock.refresh = Mock()
    
    results = detect_typologies(db_mock, sar_id=1)
    
    assert len(results) > 0
    assert any(r.detection_type == 'structuring' for r in results)


def test_detect_multiple_typologies():
    """Test detection of multiple typologies in one narrative"""
    db_mock = Mock()
    
    sar = models.SARReport(
        id=2,
        sar_ref="SAR-TEST-002",
        narrative="Rapid velocity of transactions suggests layering tactics with many tx to obfuscate the origin.",
        approved=False
    )
    
    db_mock.query().filter().first.return_value = sar
    db_mock.add = Mock()
    db_mock.commit = Mock()
    db_mock.refresh = Mock()
    
    results = detect_typologies(db_mock, sar_id=2)
    
    # Should detect both velocity and layering
    types = [r.detection_type for r in results]
    assert 'velocity_anomaly' in types
    assert 'layering' in types


def test_detect_no_typologies():
    """Test when no typologies are detected"""
    db_mock = Mock()
    
    sar = models.SARReport(
        id=3,
        sar_ref="SAR-TEST-003",
        narrative="Normal business transaction with no red flags.",
        approved=False
    )
    
    db_mock.query().filter().first.return_value = sar
    db_mock.add = Mock()
    db_mock.commit = Mock()
    db_mock.refresh = Mock()
    
    results = detect_typologies(db_mock, sar_id=3)
    
    assert len(results) == 0
