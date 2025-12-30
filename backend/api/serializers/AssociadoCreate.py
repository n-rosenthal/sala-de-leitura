from django.contrib.auth.models import User
from rest_framework import serializers
from ..models import Associado

class AssociadoCreateSerializer(serializers.ModelSerializer):
    # Dados do usuário (opcional)
    username = serializers.CharField(required=False)
    password = serializers.CharField(required=False, write_only=True)
    email = serializers.EmailField(required=False)

    class Meta:
        model = Associado
        fields = [
            "id",
            "nome",
            "aniversario",
            "esta_ativo",
            "gerente",
            "username",
            "password",
            "email",
        ]

    def create(self, validated_data):
        username = validated_data.pop("username", None)
        password = validated_data.pop("password", None)
        email = validated_data.pop("email", "")

        user = None

        if username and password:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                is_staff=validated_data.get("gerente", False),
            )

        associado = Associado.objects.create(
            user=user,
            **validated_data
        )

        return associado
