"""
    `backend/api/models/AuditLog.py`, log de ações do sistema
    
    Logs para auditoria de ações do sistema
"""

from django.db import models
from django.contrib.auth.models import User

class AuditLog(models.Model):
    """
        Log de ações do sistema
    """
    class Action(models.TextChoices):
        """
            Enumeração de ações possíveis para o sistema de auditoria
        """
        #   Autenticação de usuário
        LOGIN = "LOGIN"
        LOGOUT = "LOGOUT"
        LOGIN_FAILED = "LOGIN_FAILED"

        #   Transformações sobre objetos
        CREATE = "CREATE"
        UPDATE = "UPDATE"
        DELETE = "DELETE"
        
        #   Diagnósticos sobre objetos
        CONSISTENCIA = "CONSISTENCIA"

        #   Funções sobre objetos `Emprestimo`
        EMPRESTIMO = "EMPRESTIMO"
        DEVOLUCAO = "DEVOLUCAO"

    #   usuário que realizou a ação
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    #   ação realizada
    action = models.CharField(max_length=50, choices=Action.choices)

    #   dados da ação
    resource_type = models.CharField(max_length=50, null=True, blank=True)
    resource_id = models.PositiveIntegerField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    success = models.BooleanField(default=True)
    message = models.TextField(null=True, blank=True)

    diff = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        Retorna uma representação textual do log, com formato:
        "<timestamp> | <usuário> | <ação>"
        """
        return f"{self.created_at} | {self.user} | {self.action}"