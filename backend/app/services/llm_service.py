from ..core.config import settings
import os
from typing import Optional

# A minimal LLM wrapper. In production, replace with langchain wrapper and model selection.

class LLMClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY

    def generate(self, prompt: str, max_tokens: int = 512) -> dict:
        # If OPENAI_API_KEY is present, call OpenAI (simple requests). Otherwise return a deterministic stub.
        if self.api_key:
            try:
                import openai
                openai.api_key = self.api_key
                resp = openai.ChatCompletion.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                )
                return {"text": resp.choices[0].message.content, "raw": resp}
            except Exception as e:
                return {"text": f"LLM call failed: {e}", "raw": None}
        # fallback deterministic response for local dev
        return {"text": "<LLM stub> Generated SAR narrative for prompt: " + (prompt[:200]), "raw": None}


llm_client = LLMClient()
