"""
Enhanced LangChain-based LLM service with RAG support
"""
from typing import Optional, Dict, Any
from ..core.config import settings
import os

# Try to import LangChain components
try:
    from langchain.chat_models import ChatOpenAI
    from langchain.schema import HumanMessage, SystemMessage
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False


class LangChainLLMService:
    """Production-grade LLM service using LangChain"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model
        self.llm = None
        
        if LANGCHAIN_AVAILABLE and self.api_key:
            try:
                self.llm = ChatOpenAI(
                    model_name=self.model,
                    openai_api_key=self.api_key,
                    temperature=0.7,
                    max_tokens=1024
                )
            except Exception as e:
                print(f"Failed to initialize LangChain LLM: {e}")
    
    def generate_with_context(
        self,
        prompt: str,
        system_prompt: str = "You are an expert compliance analyst generating SAR narratives.",
        max_tokens: int = 1024
    ) -> Dict[str, Any]:
        """Generate text using LangChain with system context"""
        
        if not self.llm:
            # Fallback to deterministic stub
            return {
                "text": f"[LangChain Stub] Generated response for: {prompt[:200]}...",
                "model": "stub",
                "tokens": 0
            }
        
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=prompt)
            ]
            response = self.llm(messages)
            
            return {
                "text": response.content,
                "model": self.model,
                "tokens": len(response.content.split())  # Rough token estimate
            }
        except Exception as e:
            return {
                "text": f"LLM generation failed: {str(e)}",
                "model": self.model,
                "tokens": 0,
                "error": str(e)
            }
    
    def generate_sar_narrative(
        self,
        case_ref: str,
        case_description: str,
        transactions_summary: str,
        customer_info: str,
        templates: list
    ) -> Dict[str, Any]:
        """Generate SAR narrative with structured input"""
        
        template_context = "\n".join([t.get('content', '') for t in templates[:3]])
        
        system_prompt = """You are an expert AML compliance analyst creating Suspicious Activity Reports (SARs).
Generate a professional, detailed SAR narrative following regulatory standards.
Include:
1. Summary of suspicious activity
2. Transaction patterns and red flags
3. Customer background and risk factors
4. Conclusion and recommendation

Use clear, formal language suitable for regulatory submission."""
        
        user_prompt = f"""Generate a SAR narrative for the following case:

Case Reference: {case_ref}
Case Description: {case_description}

Customer Information:
{customer_info}

Transaction Summary:
{transactions_summary}

Template Guidelines:
{template_context}

Please generate a comprehensive SAR narrative."""
        
        return self.generate_with_context(user_prompt, system_prompt)


# Singleton instance
langchain_llm_service = LangChainLLMService()
