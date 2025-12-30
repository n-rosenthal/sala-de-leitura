"""
    `backend/api/serializers/Associado.py`
    
    Serializer para entidade `Associado`.
    Exibe todos os campos de um `Associado`.
    
    @version: 1.1
"""

from rest_framework import serializers

from ..models import Associado

class AssociadoSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(
        source="user.id",
        read_only=True
    )
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )
    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )
    
    class Meta:
        model = Associado
        fields = [
            "id",
            "nome",
            "aniversario",
            "esta_ativo",
            "gerente",
            "user_id",
            "username",
            "email",
        ]

    def update(self, instance, validated_data):
        gerente_antes = instance.gerente
        associado = super().update(instance, validated_data)

        if associado.user and gerente_antes != associado.gerente:
            associado.user.is_staff = associado.gerente
            associado.user.save()

        return associado