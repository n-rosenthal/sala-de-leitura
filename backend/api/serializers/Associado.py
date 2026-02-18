"""
    `backend/api/serializers/Associado.py`
    
    Serializador para `Associado` e que também faz uso de campos em `User`.
    Serializador para criação de novo `Associado`.
    
    @version: 2.0
"""

from rest_framework import serializers
from django.contrib.auth.models import User

from ..models import Associado

class AssociadoSerializer(serializers.ModelSerializer):
    """Serializer que combina dados do User e do Associado"""
    
    # Campos do User (read/write)
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    
    # Campos do Associado (já definidos no Meta)
    
    class Meta:
        model = Associado
        fields = [
            # Campos do User
            'username', 'email', 'first_name', 'last_name',
            'is_active', 'date_joined',
            
            # Campos do Associado
            'id', 'aniversario', 'telefone',
        ]
        read_only_fields = ['id', 'data_cadastro', 'is_active']
    
    def create(self, validated_data):
        """
        Cria um novo Associado com base nos dados fornecidos.
        
        Processo:
        1. Separa dados do User e do Associado
        2. Cria User com create_user
        3. Cria Associado com os dados fornecidos
        4. Retorna o Associado criado
        """
        user_data = validated_data.pop('user', {})
        password = validated_data.pop('password', None)

        user = User.objects.create_user(
            username=user_data.get('username'),
            email=user_data.get('email'),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            password=password
        )
        associado = Associado.objects.create(user=user, **validated_data)
        return associado
    
    def update(self, instance, validated_data):
        """Atualiza User e Associado"""
        user_data = validated_data.pop('user', {})
        
        # Atualiza o Associado
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Atualiza o User
        user = instance.user
        if user_data:
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        return instance

class AssociadoCreateSerializer(AssociadoSerializer):
    """Serializer específico para criação com validação de senha"""
    password = serializers.CharField(write_only=True, required=True)
    password_confirmation = serializers.CharField(write_only=True, required=True)
    
    class Meta(AssociadoSerializer.Meta):
        fields = AssociadoSerializer.Meta.fields + ['password', 'password_confirmation']
    
    def validate(self, data):
        """Validação personalizada para criação"""
        if data.get('password') != data.get('password_confirmation'):
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirmation', None)
        # 'password' permanece em validated_data e o pai irá consumi-lo
        return super().create(validated_data)