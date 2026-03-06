"""
    `api/serializers/Auth.py`

    Serializers exclusivos para autenticação:
        - LoginSerializer        → valida credenciais de entrada
        - DjangoUserSerializer   → serializa auth.User aninhado
        - AssociadoAuthSerializer → serializa Associado completo para a resposta de auth
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import serializers

from api.models import Associado


class LoginSerializer(serializers.Serializer):
    """Valida username + password no login."""

    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, data):
        user = authenticate(
            request=self.context.get("request"),
            username=data["username"],
            password=data["password"],
        )

        if not user:
            raise serializers.ValidationError(
                "Credenciais inválidas. Verifique username e senha.",
                code="authorization",
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "Esta conta está inativa.",
                code="authorization",
            )

        data["user"] = user
        return data


class DjangoUserSerializer(serializers.ModelSerializer):
    """Serializa os campos do auth.User aninhado no Associado."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "is_active",
        ]
        read_only_fields = fields


class AssociadoAuthSerializer(serializers.ModelSerializer):
    """
    Serializa o Associado completo para as respostas de autenticação
    (login e me). Espelha o tipo `Associado` do frontend.
    """

    user = DjangoUserSerializer(read_only=True)

    # Properties do modelo expostas explicitamente
    nome_completo = serializers.CharField(source="nome_completo", read_only=True)
    email        = serializers.EmailField(source="email", read_only=True)
    esta_ativo   = serializers.BooleanField(source="esta_ativo", read_only=True)

    class Meta:
        model = Associado
        fields = [
            "id",
            "user",
            "aniversario",
            "telefone",
            "nome_completo",
            "email",
            "esta_ativo",
        ]
        read_only_fields = fields