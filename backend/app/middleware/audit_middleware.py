from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from ..core.security import decode_access_token
from ..db.session import get_session
from .. import models
from datetime import datetime

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # extract token if present
        user_id = None
        auth = request.headers.get('authorization')
        if auth and auth.lower().startswith('bearer '):
            token = auth.split(' ', 1)[1]
            try:
                payload = decode_access_token(token)
                user_id = payload.get('user_id') or payload.get('sub')
            except Exception:
                user_id = None
        # call next
        response = await call_next(request)
        try:
            db = get_session()
            log = models.AuditLog(user_id=int(user_id) if user_id else None, action=f"{request.method} {request.url.path}", entity_type=None, entity_id=None, meta_data=None, timestamp=datetime.utcnow())
            db.add(log)
            db.commit()
            db.remove()
        except Exception:
            pass
        return response
