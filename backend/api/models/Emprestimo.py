"""
    `backend/api/models/Emprestimo.py`
    
    Definição do modelo de dados `Emprestimo`.
    Um `Emprestimo` é uma entidade definida por:
    
    
    @version: 1.2
"""
from datetime import timedelta
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from .Livro import Livro
from .Associado import Associado

class Emprestimo(models.Model):
    """
    Entidade `Emprestimo`:
    - `livro`        :   Livro, livro emprestado
    - `associado`    :   Associado, associado que emprestou o livro
    - `data_emprestimo` :   date, data em que o livro foi emprestado
    - `data_devolucao`  :   date, data em que o livro foi devolvido
    """
    class Meta:
        indexes = [
            models.Index(fields=["data_devolucao"]),
            models.Index(fields=["data_prevista"]),
            models.Index(fields=["livro"]),
            models.Index(fields=["associado"]),
        ]
    
    #   `Livro` a ser emprestado
    livro = models.ForeignKey(
        Livro,
        on_delete=models.PROTECT,
        related_name="emprestimos"
    )
    
    #   `Associado` a quem é emprestado o livro
    associado = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos"
    )

    #   Data na qual foi feito o empréstimo
    data_emprestimo = models.DateField(auto_now_add=True)
    
    #  Data prevista de devolução, por padrão é 7 dias (uma semana) após o empréstimo
    data_prevista = models.DateField(default=now() + timedelta(days=7))
    
    #   Data na qual o livro foi devolvido, possivelmente vazio
    data_devolucao = models.DateField(null=True, blank=True)
    
    #   Gerente que fez o empréstimo
    quem_emprestou = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos_feitos",
        null=True,
        blank=True
    )
    
    #   Gerente que fez a devolução
    quem_devolveu = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos_devolvidos",
        null=True,
        blank=True
    )

    def clean(self):
        """
        Validação de um empréstimo **ANTERIOR** a sua criação.
        """
        if self._state.adding:
            print(f"🔍 DEBUG clean() - Livro ID: {self.livro.id}, Status: {self.livro.status}")
            print(f"🔍 DEBUG clean() - pode_ser_emprestado: {self.livro.pode_ser_emprestado()}")
            
            # Verifica se o livro pode ser emprestado
            if not self.livro.pode_ser_emprestado():
                print(f"❌ DEBUG clean() - Livro NÃO pode ser emprestado")
                raise ValidationError(
                    f"O livro `[{self.livro.id}] {self.livro.titulo}` já foi emprestado."
                )
            else:
                print(f"✅ DEBUG clean() - Livro PODE ser emprestado")

    def save(self, *args, **kwargs):
        """
        Salva o empréstimo no banco de dados e atualiza o status do livro, se necessário.
        """
        # Verifica se o empréstimo é novo
        is_novo = self.pk is None
        
        # Para um novo empréstimo, define data_emprestimo se não estiver definida
        if is_novo and not self.data_emprestimo:
            from django.utils import timezone
            self.data_emprestimo = timezone.now().date()
        
        # Valida o empréstimo
        self.full_clean()
        
        # Salva o empréstimo
        super().save(*args, **kwargs)
        
        # Verifica inconsistências antes de atualizar
        from .Livro import Livro
        
        # Verifica se há outros empréstimos ativos para este livro
        emprestimos_ativos = Emprestimo.objects.filter(
            livro=self.livro,
            data_devolucao__isnull=True
        ).exclude(id=self.id)  # Exclui o próprio empréstimo
        
        if emprestimos_ativos.exists():
            # Se há outros empréstimos ativos, é uma inconsistência grave
            print(f"⚠️ AVISO: Livro {self.livro.id} tem múltiplos empréstimos ativos!")
            print(f"  - Este empréstimo: {self.id}")
            print(f"  - Outros empréstimos ativos: {emprestimos_ativos.count()}")
        
        # Atualiza o status do livro
        if is_novo:  # Novo empréstimo
            if self.livro.status != Livro.Status.EMPRESTADO:
                self.livro.status = Livro.Status.EMPRESTADO
                self.livro.save()
                print(f"✅ Status atualizado: {self.livro.id} → EMPRESTADO")
        
        # Se houver data de devolução, atualiza status para DISPONIVEL
        if self.data_devolucao:
            # Verifica se ainda há empréstimos ativos
            emprestimos_restantes = Emprestimo.objects.filter(
                livro=self.livro,
                data_devolucao__isnull=True
            ).exists()
            
            if not emprestimos_restantes:
                self.livro.status = Livro.Status.DISPONIVEL
                self.livro.save()
                print(f"✅ Status atualizado: {self.livro.id} → DISPONIVEL")



    def __str__(self):
        return f"Empréstimo #{self.id}";