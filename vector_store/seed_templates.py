import os
import httpx

CHROMA_URL = os.environ.get('CHROMA_API_URL', 'http://localhost:8000')

TEMPLATES = [
    {"id": "tpl-1", "content": "Template: Produce a structured SAR for case {case_ref}. Summarize suspicious transactions and provide recommended next steps."},
    {"id": "tpl-typology", "content": "Template: Include typology references when generating SAR for {case_ref} - consider structuring, layering, velocity anomalies."}
]

def seed():
    try:
        for t in TEMPLATES:
            # naive REST endpoint assumed
            resp = httpx.post(f"{CHROMA_URL}/collections/templates/documents", json={"id": t['id'], "content": t['content']})
            print('seed', t['id'], resp.status_code)
    except Exception as e:
        print('Chroma seed failed', e)

if __name__ == '__main__':
    seed()
