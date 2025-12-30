"""
    `backend/api/models/Livro.py`
    
    Definição do modelo `Livro` e do seu campo `Status`.
    Um `Livro` é uma entidade definida por
    
    - `id`      :   str, ch. primária, identificador único de um livro
    - `titulo`  :   str, título do livro
    - `autor`   :   str, autor do livro
    - `ano`     :   int, ano do livro
    - `status`  :   enum[str], status do livro
    
    quanto ao status, um `Livro` pode ser exclusivamente um dos seguintes:
    - `DISPONIVEL`, se o livro estiver na biblioteca e puder ser emprestado;
    - `EMPRESTADO`, se o livro estiver emprestado;
    - `PARA_GUARDAR`, se o livro estiver na biblioteca, mas não pode ser emprestado;
    - `DOADO`, se o livro foi doado; ou
    - `PERDIDO`, se o livro foi perdido
    
    @version: 1.1
"""

from django.db import models
from django.db.models import Q
from datetime import date


class Livro(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=["status"]),
        ]

    class Status(models.TextChoices):
        """
            Status possíveis de um Livro
        """
        DISPONIVEL  = "DISPONIVEL",     "Disponível"
        EMPRESTADO  = "EMPRESTADO",     "Emprestado"
        GUARDADO    = "PARA_GUARDAR",   "Para guardar"
        DOADO       = "DOADO", "Doado"
        PERDIDO     = "PERDIDO", "Perdido"

    #   identificador alfanumérico único de um livro
    id = models.CharField(
        max_length=10,
        primary_key=True,
    )
    
    #   título do livro
    titulo = models.CharField(max_length=255)
    
    #   autor do livro
    autor = models.CharField(max_length=255)
    
    #   ano de publicação do livro
    ano = models.PositiveIntegerField()
    
    #   status do livro
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.DISPONIVEL
    )

    def pode_ser_emprestado(self) -> bool:
        """
        Regra de negócio explícita para determinar se um livro pode ser emprestado.
        """
        print(f"DEBUG pode_ser_emprestado() - Livro: {self.id}, Status: {self.status}")
        
        # Primeiro verifica o status
        if self.status != Livro.Status.DISPONIVEL:
            print(f"DEBUG pode_ser_emprestado() - Status não é DISPONIVEL")
            return False
        
        # Verifica empréstimos ativos
        from .Emprestimo import Emprestimo
        emprestimos_ativos = Emprestimo.objects.filter(
            livro=self,
            data_devolucao__isnull=True
        )
        
        if emprestimos_ativos.exists():
            print(f"DEBUG pode_ser_emprestado() - Tem {emprestimos_ativos.count()} empréstimo(s) ativo(s)")
            return False
        
        print(f"✅ DEBUG pode_ser_emprestado() - Pode ser emprestado")
        return True
    
    def get_emprestimo_ativo(self):
        """
        Retorna o empréstimo ativo deste livro, se existir.
        """
        from .Emprestimo import Emprestimo
        
        try:
            return Emprestimo.objects.get(
                livro=self,
                data_devolucao__isnull=True
            )
        except Emprestimo.DoesNotExist:
            return None
        except Emprestimo.MultipleObjectsReturned:
            # Caso raro: mais de um empréstimo ativo
            # Retorna o mais recente
            return Emprestimo.objects.filter(
                livro=self,
                data_devolucao__isnull=True
            ).latest('data_emprestimo')
    
    def verificar_consistencia(self) -> dict:
        """
        Verifica a consistência entre o status do livro e os empréstimos.
        Útil para diagnósticos.
        """
        from .Emprestimo import Emprestimo
        
        emprestimos_ativos = Emprestimo.objects.filter(
            livro=self,
            data_devolucao__isnull=True
        ).count()
        
        inconsistencias = []
        
        if self.status == Livro.Status.DISPONIVEL and emprestimos_ativos > 0:
            inconsistencias.append(f"Status DISPONIVEL mas tem {emprestimos_ativos} empréstimo(s) ativo(s)")
        
        if self.status == Livro.Status.EMPRESTADO and emprestimos_ativos == 0:
            inconsistencias.append("Status EMPRESTADO mas não tem empréstimos ativos")
        
        return {
            'livro_id': self.id,
            'status_atual': self.status,
            'emprestimos_ativos': emprestimos_ativos,
            'pode_ser_emprestado': self.pode_ser_emprestado(),
            'inconsistencias': inconsistencias,
            'consistente': len(inconsistencias) == 0
        }

    def __str__(self):
        return f"{self.titulo} ({self.id})" 