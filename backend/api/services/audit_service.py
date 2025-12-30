"""
    `backend/api/services/audit_service.py`, serviço de auditoria
    
    Logs para auditoria de ações do sistema
"""
from api.models.AuditLog import AuditLog

class AuditService:

    @staticmethod
    def log(
        *,
        user=None,
        action,
        resource_type=None,
        resource_id=None,
        success=True,
        message=None,
        diff=None,
        request=None,
    ):
        AuditLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            success=success,
            message=message,
            diff=diff,
            ip_address=AuditService._get_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT") if request else None,
        )

    @staticmethod
    def _get_ip(request):
        if not request:
            return None
        return request.META.get("REMOTE_ADDR")