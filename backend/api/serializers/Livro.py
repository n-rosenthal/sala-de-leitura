"""
    `backend/api/serializers/Livro.py`
    
    Serializer para entidade `Livro`.
    Exibe todos os campos de um `Livro`.
    
    @version: 1.1
"""

from rest_framework import serializers

from ..models import Livro

class LivroSerializer(serializers.ModelSerializer):
    """
    Serializer para entidade `Livro`.
    Exibe todos os campos de um `Livro`.
    """
    class Meta:
        model = Livro
        fields = [
            "id",
            "titulo",
            "autor",
            "ano",
            "status",
            "pode_ser_emprestado",
        ]

    def get_pode_ser_emprestado(self, obj):
        return obj.pode_ser_emprestado()