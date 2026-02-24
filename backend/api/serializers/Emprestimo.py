"""
    `backend/api/serializers/Emprestimo.py`

    @version: 1.3
"""
from rest_framework import serializers
from ..models import Emprestimo


class EmprestimoSerializer(serializers.ModelSerializer):
    livro_titulo = serializers.CharField(source="livro.titulo", read_only=True)

    # ✅ Bug 5 corrigido: Associado não tem campo 'nome'; o nome vem do User relacionado
    associado_nome = serializers.SerializerMethodField()
    quem_emprestou_nome = serializers.SerializerMethodField()
    quem_devolveu_nome = serializers.SerializerMethodField()

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
            "quem_emprestou_nome",
            "quem_devolveu",
            "quem_devolveu_nome",
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

    def _nome_associado(self, associado):
        if associado is None:
            return None
        nome = associado.user.get_full_name()
        return nome if nome.strip() else associado.user.username

    def get_associado_nome(self, obj):
        return self._nome_associado(obj.associado)

    def get_quem_emprestou_nome(self, obj):
        return self._nome_associado(obj.quem_emprestou)

    def get_quem_devolveu_nome(self, obj):
        return self._nome_associado(obj.quem_devolveu)