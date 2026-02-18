"""
    `backend/api/signals.py`
    
    Sinais para o back-end.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Emprestimo, Livro, Associado

@receiver(post_save, sender=Emprestimo)
def verificar_consistencia_emprestimo(sender, instance, created, **kwargs):
    """
    Signal para verificar consistência após salvar um empréstimo.
    """
    livro = instance.livro
    emprestimos_ativos = Emprestimo.objects.filter(
        livro=livro,
        data_devolucao__isnull=True
    ).count()
    
    # Atualiza status baseado na realidade
    if emprestimos_ativos > 0 and livro.status != Livro.Status.EMPRESTADO:
        livro.status = Livro.Status.EMPRESTADO
        livro.save()
    elif emprestimos_ativos == 0 and livro.status == Livro.Status.EMPRESTADO:
        livro.status = Livro.Status.DISPONIVEL
        livro.save()