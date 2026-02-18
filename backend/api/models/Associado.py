"""
    `backend/api/models/Associado.py`
    
    `Associado` é o perfil estendido de um usuário (`Django.models.User`) da sala de leitura. Armazena informações específicas da sua aplicação que não existem no User padrão.


    @version: 2.0
"""
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Associado(models.Model):
    """
        Perfil estendido para usuários da sala de leitura.
        Complementa o modelo User padrão do Django.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="associado",
        verbose_name="Usuário"
    )
    
    # perfil estendido: campos que não existem no User padrão
    aniversario = models.DateField(
        verbose_name="Data de aniversário",
        help_text="Data de nascimento do associado"
    )
    
    telefone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Telefone"
    )

    class Meta:
        verbose_name = "Associado"
        verbose_name_plural = "Associados"
        ordering = ['user__first_name']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.user.username}"

    # Propriedades úteis
    @property
    def nome_completo(self):
        """Delega para o User"""
        return self.user.get_full_name()
    
    @property
    def email(self):
        """Delega para o User"""
        return self.user.email
    
    @property
    def esta_ativo(self):
        """Delega para o User"""
        return self.user.is_active