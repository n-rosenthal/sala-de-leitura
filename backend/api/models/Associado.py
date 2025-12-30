"""
    `backend/api/models/Associado.py`
    
    Definição do modelo de dados `Associado`.
    Um `Associado` é uma entidade definida por:
    
    - `nome`        :   str, nome do associado
    - `aniversario` :   date, aniversário do associado
    - `esta_ativo`  :   bool, indica se o associado está ativo
    - `gerente`     :   bool, indica se o associado é gerente
    
    
    @version: 1.1
"""
from django.db import models
from django.conf import settings

class Associado(models.Model):
    """
        Modelo para um associado (usuário) da sala de leitura.
        
        Um associado é caracterizado por
        -   seu nome;
        -   seu aniversário;
        -   se ele está ativo;
        -   se ele é gerente.
    """
    user = models.OneToOneField(
            settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE,
            related_name="associado",
        )

    nome = models.CharField(max_length=255)
    aniversario = models.DateField()
    esta_ativo = models.BooleanField(default=True)
    gerente = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # domínio manda → auth reflete
        if self.user:
            self.user.is_staff = self.gerente
            self.user.save(update_fields=["is_staff"])

    def __str__(self):
        return self.nome