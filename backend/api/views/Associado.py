"""
    `backend/api/views/Associado.py`
    
    ViewSet para entidade `Associado`.
"""
#   viewset e filtros
from rest_framework import viewsets, filters

#   filtros
from django_filters.rest_framework import DjangoFilterBackend

#   permissões: somente gerentes ou administradores podem alterar associados
from rest_framework.permissions import IsAuthenticated
from ..permissions import IsStaff

#   todo associado é também um usuário
from django.contrib.auth.models import User

#   decorador para ações especiais, tipo resposta e tipo exceção erro de validação
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

#   tipo `Associado`, serializadores `Associado` e criador de associado.
from ..models import Associado
from ..serializers.AssociadoCreate import AssociadoCreateSerializer
from ..serializers import AssociadoSerializer

#   serviço de auditoria (logging)
from ..services.audit_service import AuditService


class AssociadoViewSet(viewsets.ModelViewSet):
    """
        ViewSet para entidade `Associado`.
    """
    #   ordenar todos os associados por nome
    queryset = Associado.objects.all().order_by("nome")
    serializer_class = AssociadoSerializer
    
    #   somente gerentes ou administradores podem alterar associados
    permission_classes = [IsAuthenticated, IsStaff]
    
    
    def get_serializer_class(self):
        if self.action == "create":
            return AssociadoCreateSerializer
        return AssociadoSerializer
    
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    
    filterset_fields = ["gerente"]
    search_fields = ["nome"]
    ordering_fields = ["nome"]
    ordering = ["nome"]
    
    def perform_create(self, serializer):
        """
        Cria um associado e registra a criação no log de ações do sistema.
        """
        associado = serializer.save()
        AuditService.log(
            user=self.request.user,
            action='CREATE',
            success=True,
            message='Associado criado com sucesso',
            resource_type='associado',
            resource_id=associado.id,
            request=self.request,
        )
    
    def perform_update(self, serializer):
        """
        Atualiza um associado e registra as alterações no log de ações do sistema.
        
        :param serializer: Serializer com os dados validados para atualizar o associado
        :type serializer: AssociadoSerializer
        :return: O associado atualizado
        :rtype: Associado
        """
        old_instance = self.get_object()
        old_data = {
            'nome': old_instance.nome,
            'email': old_instance.email,
            'telefone': old_instance.telefone
        }
        
        associado = serializer.save()
        
        # Identifica mudanças
        changes = {}
        for field in ['nome', 'email', 'telefone', 'endereco', 'gerente']:
            old_value = getattr(old_instance, field, None)
            new_value = getattr(associado, field, None)
            if old_value != new_value:
                changes[field] = {
                    'de': old_value,
                    'para': new_value
                }
        
        AuditService.log(
            user=self.request.user,
            action='UPDATE',
            success=True,
            message='Associado atualizado com sucesso',
            resource_type='associado',
            resource_id=associado.id,
            diff=changes,
            request=self.request,
        )
    
    def perform_destroy(self, instance):
        """
        Exclui um associado e registra a exclusão no log de ações do sistema.
        
        :param instance: O associado a ser excluído
        :type instance: Associado
        """
        associado_data = {
            'id': instance.id,
            'nome': instance.nome,
            'email': instance.email
        }
        
        AuditService.log(
            user=self.request.user,
            action='DELETE',
            success=True,
            message='Associado excluído com sucesso',
            resource_type='associado',
            resource_id=instance.id,
            details=associado_data,
            request=self.request,
        )
        
        # Exclui o associado
        instance.delete()
    
    @action(
        detail=True,
        methods=["post"],
        url_path="vincular-usuario",
    )
    def vincular_usuario(self, request, pk=None):
        """
        Vincula um usuário a um associado.
        """
        associado = self.get_object()
        user_id = request.data.get("user_id")

        if not user_id:
            raise ValidationError("user_id é obrigatório")

        user = User.objects.get(id=user_id)

        associado.user = user
        associado.save()

        # Log da vinculação
        AuditService.log(
            user=request.user,
            action='UPDATE',
            success=True,
            message='Usuário vinculado com sucesso',
            resource_type='associado',
            resource_id=associado.id,
            details={
                'associado_id': associado.id,
                'associado_nome': associado.nome,
                'user_id': user.id,
                'username': user.username
            },
            request=request,
        )

        return Response({"status": "Usuário vinculado"})
    
    @action(
        detail=True,
        methods=["post"],
        url_path="resetar-senha",
    )
    def resetar_senha(self, request, pk=None):
        """
        Redefine a senha do usuário vinculado a um associado.
        """
        associado = self.get_object()

        if not associado.user:
            raise ValidationError("Associado não possui usuário")

        nova_senha = request.data.get("password")
        if not nova_senha:
            raise ValidationError("Senha é obrigatória")

        associado.user.set_password(nova_senha)
        associado.user.save()

        # Log do reset de senha
        AuditService.log(
            user=request.user,
            action='UPDATE',
            success=True,
            message='Senha redefinida com sucesso',
            resource_type='associado',
            resource_id=associado.id,
            details={
                'associado_id': associado.id,
                'associado_nome': associado.nome,
                'user_id': associado.user.id,
                'username': associado.user.username
            },
            request=request,
        )

        return Response({"status": "Senha redefinida"})