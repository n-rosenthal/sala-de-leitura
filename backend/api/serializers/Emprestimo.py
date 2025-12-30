"""
    `backend/api/serializers/Emprestimo.py`
    
    Serializer para entidade `Emprestimo`.
    Exibe todos os campos de um `Emprestimo`.
    
    @version: 1.2
"""

from rest_framework import serializers

from ..models import Emprestimo

class EmprestimoSerializer(serializers.ModelSerializer):
    livro_titulo = serializers.CharField(
        source="livro.titulo", read_only=True
    )
    associado_nome = serializers.CharField(
        source="associado.nome", read_only=True
    )
    
    # Campos extras para informações do gerente (apenas leitura)
    quem_emprestou_nome = serializers.CharField(
        source="quem_emprestou.nome", read_only=True
    )
    quem_devolveu_nome = serializers.CharField(
        source="quem_devolveu.nome", read_only=True
    )

    class Meta:
        model = Emprestimo
        fields = [
            "id",
            "livro",
            "livro_titulo",
            "associado",
            "associado_nome",
            "data_emprestimo",
            "data_prevista",
            "data_devolucao",
            "quem_emprestou",
            "quem_emprestou_nome",  # Campo somente leitura
            "quem_devolveu",
            "quem_devolveu_nome",   # Campo somente leitura
        ]
        read_only_fields = [
            "id",
            "data_emprestimo",
            "quem_emprestou",
            "quem_emprestou_nome",
            "quem_devolveu_nome",
            "livro_titulo",
            "associado_nome",
        ]