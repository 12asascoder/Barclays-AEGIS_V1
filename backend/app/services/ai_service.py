from ..db.session import get_db
from .. import models
from .llm_service import llm_client
from .langchain_service import langchain_llm_service
from .chroma_client import chroma_client
from ..core.config import settings
import httpx
from datetime import datetime


def retrieve_templates(query: str = "SAR template"):
    """Retrieve templates from ChromaDB using semantic search"""
    try:
        return chroma_client.query_templates(query, n_results=3)
    except Exception as e:
        print(f"Template retrieval failed: {e}")
        return chroma_client._get_fallback_templates()


def build_prompt(case, transactions, templates, customer=None):
    """Build comprehensive prompt for SAR generation"""
    template = templates[0]['content'] if templates else "Generate SAR for case {case_ref}"
    
    # Transaction summary (limit to top 20)
    tx_summary = "\n".join([
        f"- {t.txn_id}: ${t.amount:,.2f} {t.txn_type} @ {t.timestamp}"
        for t in transactions[:20]
    ])
    
    # Customer info
    customer_info = ""
    if customer:
        customer_info = f"""
Customer: {customer.name}
Customer ID: {customer.customer_id}
Risk Rating: {customer.risk_rating}/5
KYC Notes: {customer.kyc or 'N/A'}
"""
    
    # Build full prompt
    prompt = f"""
Case Reference: {case.case_ref}
Title: {case.title}

{customer_info}

Case Description:
{case.description or 'No description provided'}

Recent Transactions:
{tx_summary or 'No transactions available'}

Template Guidelines:
{template}

Please generate a detailed SAR narrative following the template guidelines.
"""
    return prompt


def log_ai_invocation(db, user_id, sar_id, prompt, response, model="gpt-stub", tokens=0):
    ai = models.AIInvocation(user_id=user_id, sar_id=sar_id, prompt=prompt, response=response, model=model, tokens=tokens, created_at=datetime.utcnow())
    db.add(ai)
    db.commit()
    db.refresh(ai)
    
    # Also create audit log for AI invocation
    audit = models.AuditLog(
        user_id=user_id,
        action="AI_INVOCATION",
        entity_type="AIInvocation",
        entity_id=str(ai.id),
        metadata=f"sar_id={sar_id}, model={model}, tokens={tokens}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return ai


def generate_sar(db, case_id: int, user_id: int):
    """Generate SAR using LangChain + ChromaDB RAG pipeline"""
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise ValueError("Case not found")
    
    # Fetch transactions linked to case/customer
    txs = []
    customer = None
    if case.customer_id:
        customer = db.query(models.Customer).filter(models.Customer.id == case.customer_id).first()
        if customer:
            # Collect transactions across accounts
            for acct in customer.accounts:
                txs.extend(acct.transactions)
    
    # Retrieve templates from ChromaDB using semantic search
    query = f"SAR template for {case.title} suspicious activity"
    templates = retrieve_templates(query)
    
    # Build structured prompt
    prompt = build_prompt(case, txs, templates, customer)
    
    # Use LangChain service for generation
    customer_summary = f"{customer.name} (Risk: {customer.risk_rating}/5)" if customer else "N/A"
    tx_summary = f"{len(txs)} transactions totaling ${sum(t.amount for t in txs):,.2f}" if txs else "No transactions"
    
    resp = langchain_llm_service.generate_sar_narrative(
        case_ref=case.case_ref,
        case_description=case.description or "",
        transactions_summary=tx_summary,
        customer_info=customer_summary,
        templates=templates
    )
    
    # Store SAR
    sar = models.SARReport(
        sar_ref=f"SAR-{case.case_ref}-{int(datetime.utcnow().timestamp())}",
        case_id=case.id,
        created_by=user_id,
        narrative=resp.get('text'),
        approved=False,
        created_at=datetime.utcnow(),
    )
    db.add(sar)
    db.commit()
    db.refresh(sar)
    
    # Log invocation
    log_ai_invocation(
        db, user_id, sar.id, prompt, resp.get('text'),
        model=resp.get('model', 'unknown'),
        tokens=resp.get('tokens', 0)
    )
    
    return sar
