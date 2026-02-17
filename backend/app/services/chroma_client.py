"""
ChromaDB client for template and knowledge base storage
"""
from typing import List, Dict, Any, Optional
import httpx
from ..core.config import settings


class ChromaDBClient:
    """Client for interacting with ChromaDB vector store"""
    
    def __init__(self, chroma_url: Optional[str] = None):
        self.chroma_url = (chroma_url or settings.CHROMA_API_URL).rstrip('/')
        self.collection_name = "sar_templates"
    
    def query_templates(
        self,
        query_text: str,
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        """Query ChromaDB for relevant templates"""
        try:
            # ChromaDB REST API query
            url = f"{self.chroma_url}/api/v1/collections/{self.collection_name}/query"
            response = httpx.post(
                url,
                json={
                    "query_texts": [query_text],
                    "n_results": n_results
                },
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                results = []
                # Parse ChromaDB response format
                if 'documents' in data and len(data['documents']) > 0:
                    for i, doc in enumerate(data['documents'][0]):
                        results.append({
                            'id': data.get('ids', [[]])[0][i] if 'ids' in data else f'doc_{i}',
                            'content': doc,
                            'metadata': data.get('metadatas', [[]])[0][i] if 'metadatas' in data else {}
                        })
                return results
        except Exception as e:
            print(f"ChromaDB query failed: {e}")
        
        # Fallback templates
        return self._get_fallback_templates()
    
    def add_template(
        self,
        template_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Add a template to ChromaDB"""
        try:
            url = f"{self.chroma_url}/api/v1/collections/{self.collection_name}/add"
            response = httpx.post(
                url,
                json={
                    "ids": [template_id],
                    "documents": [content],
                    "metadatas": [metadata or {}]
                },
                timeout=5.0
            )
            return response.status_code == 200
        except Exception as e:
            print(f"ChromaDB add failed: {e}")
            return False
    
    def _get_fallback_templates(self) -> List[Dict[str, Any]]:
        """Fallback templates when ChromaDB is unavailable"""
        return [
            {
                'id': 'template_1',
                'content': 'Suspicious Activity Report - Structuring Pattern: Document multiple transactions below reporting thresholds, analyze velocity, timing, and customer behavior.',
                'metadata': {'type': 'structuring'}
            },
            {
                'id': 'template_2',
                'content': 'SAR Narrative Template: Include customer background, transaction timeline, red flag indicators, typology classification, and recommended actions.',
                'metadata': {'type': 'general'}
            },
            {
                'id': 'template_3',
                'content': 'Layering Detection Template: Describe complex transaction chains, multiple jurisdictions, rapid movement of funds, and obfuscation techniques.',
                'metadata': {'type': 'layering'}
            }
        ]


# Singleton instance
chroma_client = ChromaDBClient()
