"""
    `backend/api/views/Associado.py`
    
    ViewSet para o modelo de dados `Associado` usando Django REST framework.
    `Associado` é o perfil estendido de um usuário da aplicação, `User`.
    
    Implementa as operações CRUD, endpoints personalizados {} e permissões granulares (ainda não implementado).
    
    @version: 2.0
"""

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
import rest_framework.permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ValidationError

from ..models import Associado
from ..serializers import AssociadoSerializer, AssociadoCreateSerializer


class AssociadoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Associados.
    
    Fornece endpoints para:
    - Listar todos os associados (com filtros)
    - Criar novo associado (registro)
    - Obter detalhes de um associado específico
    - Atualizar/Deletar associado (com permissões)
    - Endpoints personalizados: 'me', 'activate', 'deactivate'
    """
    queryset = Associado.objects.select_related('user').all()
    serializer_class = AssociadoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'user__username',
        'user__email', 
        'user__first_name',
        'user__last_name',
        'telefone'
    ]
    ordering_fields = [
        'user__username',
        'user__date_joined',
        'aniversario',
        'data_cadastro'
    ]
    ordering = ['user__username']
    
    def get_permissions(self):
        """
        Define permissões baseadas na ação.
        
        - CREATE: Qualquer um pode criar (registro)
        - LIST: Apenas autenticados
        - RETRIEVE: Autenticados podem ver qualquer um
        - UPDATE/DELETE: Dono ou admin
        - Ações personalizadas: Baseadas no contexto
        
        Atualmente não implementado.
        """
        # if self.action == 'create':
        #     return [permissions.AllowAny()]
        # elif self.action == 'list':
        #     return [permissions.IsAuthenticated()]
        # elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
        #     return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        # elif self.action in ['me', 'atualizar_me']:
        #     return [permissions.IsAuthenticated()]
        # elif self.action in ['activate', 'deactivate']:
        #     return [permissions.IsAdminUser()]
        # return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_serializer_class(self):
        """
        Seleciona o serializer apropriado baseado na ação.
        
        - CREATE: AssociadoCreateSerializer (com validação de senha)
        - Outras ações: AssociadoSerializer padrão
        """
        if self.action == 'create':
            return AssociadoCreateSerializer
        return AssociadoSerializer
    
    def get_queryset(self):
        """
        Filtra o queryset baseado no usuário e permissões.
        
        - Admin: Vê todos os associados
        - Usuário normal: Vê apenas associados ativos
        - Dono: Pode ver seu próprio perfil mesmo se inativo
        """
        queryset = super().get_queryset()
        # user = self.request.user
        
        # if not user.is_authenticated:
        #     return queryset.none()
        
        # # Admin vê tudo
        # if user.is_superuser or user.is_staff:
        #     return queryset
        
        # # Usuários normais só veem ativos, mas podem ver seu próprio perfil
        # queryset = queryset.filter(user__is_active=True)
        
        # # Se for o próprio perfil, inclui mesmo se inativo
        # if self.action == 'retrieve':
        #     try:
        #         if str(self.kwargs.get('pk')) == str(user.associado.id):
        #             return Associado.objects.select_related('user').filter(id=user.associado.id)
        #     except Associado.DoesNotExist:
        #         pass
        
        return queryset

    def create(self, request, *args, **kwargs):
        """
        Cria um novo Associado (registro).
        
        Processo:
        1. Valida dados com AssociadoCreateSerializer
        2. Cria User e Associado em transação atômica
        3. Retorna dados criados com status 201
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                associado = serializer.save()
            
            # Serializar resposta (sem senha)
            response_serializer = AssociadoSerializer(
                associado,
                context=self.get_serializer_context()
            )
            
            headers = self.get_success_headers(response_serializer.data)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        
        except ValidationError as e:
            return Response(
                {'detail': str(e) + ' - ' + str(serializer.errors)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """
        Atualização completa de Associado.
        
        Notas:
        - Não permite alterar username via update regular
        - Para alterar senha, use endpoint específico
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Impede alteração de username via update
        if 'username' in request.data:
            request.data.pop('username', None)
        
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                self.perform_update(serializer)
            
            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}
            
            return Response(serializer.data)
        
        except ValidationError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def perform_update(self, serializer):
        """Salva a instância durante update."""
        serializer.save()
    
    def destroy(self, request, *args, **kwargs):
        """
        Deleta um Associado e seu User relacionado.
        
        Notas:
        - Apenas admin ou o próprio usuário pode deletar
        - Implementação segura com transação
        """
        instance = self.get_object()
        user = instance.user
        
        try:
            with transaction.atomic():
                self.perform_destroy(instance)
                # Deleta o User também
                user.delete()
            
            return Response(
                {'detail': 'Associado deletado com sucesso.'},
                status=status.HTTP_204_NO_CONTENT
            )
        
        except Exception as e:
            return Response(
                {'detail': f'Erro ao deletar: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_destroy(self, instance):
        """Executa a deleção da instância."""
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Endpoint para obter dados do usuário autenticado.
        
        GET /api/associados/me/
        """
        try:
            associado = request.user.associado
            serializer = self.get_serializer(associado)
            return Response(serializer.data)
        
        except Associado.DoesNotExist:
            return Response(
                {'detail': 'Perfil de associado não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['put', 'patch'], url_path='me/atualizar')
    def atualizar_me(self, request):
        """
        Endpoint para atualizar dados do usuário autenticado.
        
        PUT/PATCH /api/associados/me/atualizar/
        """
        try:
            associado = request.user.associado
            partial = request.method == 'PATCH'
            
            # Impede alteração de username via este endpoint
            if 'username' in request.data:
                request.data.pop('username', None)
            
            serializer = self.get_serializer(
                associado,
                data=request.data,
                partial=partial,
                context=self.get_serializer_context()
            )
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                serializer.save()
            
            return Response(serializer.data)
        
        except Associado.DoesNotExist:
            return Response(
                {'detail': 'Perfil de associado não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Ativa um associado (admin only).
        
        POST /api/associados/{id}/activate/
        """
        associado = self.get_object()
        
        if associado.user.is_active:
            return Response(
                {'detail': 'Associado já está ativo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        associado.user.is_active = True
        associado.user.save()
        
        return Response(
            {'detail': 'Associado ativado com sucesso.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Desativa um associado (admin only).
        
        POST /api/associados/{id}/deactivate/
        """
        associado = self.get_object()
        
        # Impede que admin desative a si mesmo
        if associado.user == request.user:
            return Response(
                {'detail': 'Não é possível desativar seu próprio usuário.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not associado.user.is_active:
            return Response(
                {'detail': 'Associado já está inativo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        associado.user.is_active = False
        associado.user.save()
        
        return Response(
            {'detail': 'Associado desativado com sucesso.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='search')
    def search_associados(self, request):
        """
        Endpoint de busca avançada (opcional).
        
        GET /api/associados/search/?q=termo
        """
        query = request.query_params.get('q', '')
        
        if not query:
            return Response(
                {'detail': 'Parâmetro de busca "q" é requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Busca em múltiplos campos
        associados = Associado.objects.select_related('user').filter(
            user__username__icontains=query
        ) | Associado.objects.select_related('user').filter(
            user__email__icontains=query
        ) | Associado.objects.select_related('user').filter(
            user__first_name__icontains=query
        ) | Associado.objects.select_related('user').filter(
            user__last_name__icontains=query
        )
        
        # Aplica filtros de permissão
        if not request.user.is_superuser and not request.user.is_staff:
            associados = associados.filter(user__is_active=True)
        
        page = self.paginate_queryset(associados)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(associados, many=True)
        return Response(serializer.data)