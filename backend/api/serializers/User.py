"""
    `backend/api/serializers/User.py`
    
    Serializer para entidade `Me`, que representa o usuário autenticado.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from ..models import Associado


class AssociadoMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Associado
        fields = ["id", "nome", "gerente"]


class MeSerializer(serializers.ModelSerializer):
    associado = AssociadoMiniSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_staff",
            "is_superuser",
            "associado",
        ]