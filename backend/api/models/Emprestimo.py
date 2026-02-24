"""
    `backend/api/models/Emprestimo.py`

    @version: 1.3
"""
from datetime import timedelta
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from .Livro import Livro
from .Associado import Associado


def default_data_prevista():
    """Callable: avaliado por instância, não no import."""
    return now().date() + timedelta(days=7)


class Emprestimo(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=["data_devolucao"]),
            models.Index(fields=["data_prevista"]),
            models.Index(fields=["livro"]),
            models.Index(fields=["associado"]),
        ]

    livro = models.ForeignKey(
        Livro,
        on_delete=models.PROTECT,
        related_name="emprestimos",
    )
    associado = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos",
    )
    data_emprestimo = models.DateField(auto_now_add=True)

    # default é um callable, não um valor fixo calculado no boot
    data_prevista = models.DateField(default=default_data_prevista)

    data_devolucao = models.DateField(null=True, blank=True)

    quem_emprestou = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos_feitos",
        null=True,
        blank=True,
    )
    quem_devolveu = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos_devolvidos",
        null=True,
        blank=True,
    )

    def clean(self):
        """
        Validação ANTES da criação.

        usa select_for_update() para travar o livro e evitar
        race condition entre dois empréstimos simultâneos do mesmo livro.
        Deve ser chamado dentro de uma transação atômica (o save() garante isso).
        """
        if self._state.adding:
            from django.db import transaction

            # Trava o registro do livro para leitura exclusiva até o fim da transação
            livro_locked = (
                Livro.objects.select_for_update()
                .filter(pk=self.livro_id)
                .first()
            )

            if livro_locked is None:
                raise ValidationError("Livro não encontrado.")

            # Dupla verificação: status E existência de empréstimo ativo
            emprestimo_ativo = Emprestimo.objects.filter(
                livro=livro_locked,
                data_devolucao__isnull=True,
            ).exists()

            if emprestimo_ativo or livro_locked.status != Livro.Status.DISPONIVEL:
                raise ValidationError(
                    f"O livro [{self.livro_id}] já está emprestado ou indisponível."
                )

    def save(self, *args, **kwargs):
        from django.db import transaction

        is_novo = self.pk is None

        # Executa tudo dentro de uma transação para que o select_for_update
        # no clean() seja efetivo — sem transação, o lock não funciona
        with transaction.atomic():
            self.full_clean()
            super().save(*args, **kwargs)

            if is_novo:
                # Atualiza status do livro para EMPRESTADO
                Livro.objects.filter(pk=self.livro_id).update(
                    status=Livro.Status.EMPRESTADO
                )

            elif self.data_devolucao:
                # Se não há mais empréstimos ativos, libera o livro
                ainda_ativo = Emprestimo.objects.filter(
                    livro_id=self.livro_id,
                    data_devolucao__isnull=True,
                ).exclude(pk=self.pk).exists()

                if not ainda_ativo:
                    Livro.objects.filter(pk=self.livro_id).update(
                        status=Livro.Status.DISPONIVEL
                    )

    def __str__(self):
        return f"Empréstimo #{self.id}"