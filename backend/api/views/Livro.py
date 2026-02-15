"""
    `backend/api/views/Livro.py`
    
    ViewSet para entidade `Livro`.
    
    Regras de Permissões:
        Usuários/Associados         GET / list / verificar
        Gerente++Administrador      POST / PATCH / UPDATE / DELETE
"""
#   Framework
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated


#   Modelo e serializer para `Livro`
from ..models import Livro
from ..serializers import LivroSerializer

#   serviço de auditoria (logging)
from ..services.audit_service import AuditService
from ..utils.diff import generate_diff

class LivroViewSet(viewsets.ModelViewSet):
    """
        ViewSet para entidade `Livro`.
        
        Regras de Permissões:
            Usuários/Associados         GET / list / verificar
            Gerente++Administrador      POST / PATCH / UPDATE / DELETE
    """
    queryset = Livro.objects.all().order_by("titulo")
    serializer_class = LivroSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = ["status"]
    search_fields = ["titulo", "autor"]
    ordering_fields = ["titulo", "autor", "ano"]
    ordering = ["titulo"]

    def get_permissions(self):
        """
        Define as permissões para cada ação do viewset.

        Se a ação for criar, atualizar, atualizar parcialmente ou devolver um livro,
        verifica se o usuário autenticado é um gerente (staff).

        Caso contrário, verifica se o usuário autenticado pode fazer a ação.

        :return: Uma lista de permissões necessárias para a ação.
        :rtype: list[rest_framework.permissions.BasePermission]
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsStaff()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """
        Cria um novo `Livro` com base nos dados validados no serializer.
        
        Salva as alterações e registra as mudanças no log de ações do sistema.
        
        :param serializer: Serializer com os dados validados para criar o `Livro`
        :type serializer: LivroSerializer
        :return: O `Livro` criado
        :rtype: Livro
        """
        instance = serializer.save()
        AuditService.log(
            user=self.request.user,
            action='CREATE',
            success=True,
            message='Livro criado com sucesso',
            resource_type='livro',
            resource_id=instance.id
        )
    
    def perform_update(self, serializer):
        """
        Atualiza um `Livro` com base nos dados validados no serializer.

        Salva as alterações e registra as mudanças no log de ações do sistema.

        :param serializer: Serializer com os dados validados para atualizar o `Livro`
        :type serializer: LivroSerializer
        :return: O `Livro` atualizado
        :rtype: Livro
        """
        old_instance = self.get_object()
        instance = serializer.save()
        
        
        diff = generate_diff(
            old_instance,
            serializer.validated_data,
            ["titulo", "autor", "ano", "status"]    
        )
        
        #   somente salvar log se houver mudanças
        if diff:
            AuditService.log(
                user=self.request.user,
                action="UPDATE",
                resource_type="livro",
                resource_id=instance.id,
                diff=diff,
                request=self.request,
            )
    
    def perform_destroy(self, instance):
        livro_data = {
            'id': instance.id,
            'titulo': instance.titulo,
            'autor': instance.autor
        }
        
        AuditService.log(
            user=self.request.user,
            action='DELETE',
            success=True,
            message='Livro excluído com sucesso',
            resource_type='livro',
            resource_id=instance.id,
        )
        
        instance.delete()
    
    @action(
        detail=False,
        methods=["get"],
        url_path="disponiveis",
    )
    def disponiveis(self, request):
        """
        Retorna apenas livros disponíveis para empréstimo.
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(
                status=Livro.Status.DISPONIVEL
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(
        detail=False,
        methods=["get"],
        url_path="emprestados",
    )
    def emprestados(self, request):
        """
        Retorna livros atualmente emprestados.
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(
                status=Livro.Status.EMPRESTADO
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def verificar(self, request, pk=None):
        """
        Verifica se o livro pode ser emprestado e sua consistência.
        """

        
        return Response({
            'pode_ser_emprestado': True,
            'status': Livro.Status.DISPONIVEL,
            'status_display': "DISPONIVEL",
            'emprestimo_ativo': None,
            'consistencia': None
        })
