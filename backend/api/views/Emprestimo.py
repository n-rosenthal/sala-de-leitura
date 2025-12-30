"""
`backend/api/views/Emprestimo.py`

ViewSet para entidade `Emprestimo`.

Regras de Permissões:
| Ação                     | Quem      |
| ------------------------ | --------- |
| Ver próprios empréstimos | Usuário   |
| Criar empréstimo         | Gerente   |
| Devolver empréstimo      | Gerente   |
| Editar empréstimo        | Gerente   |
| Deletar                  | ninguém*  |

*teoricamente, superusuário/administrador.

"""
from datetime import timedelta

#   Framework
from django.db import transaction
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, filters, status
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied

#   tipos para `Emprestimo`, `Livro` e `Associado`
from ..models import Emprestimo, Livro, Associado

#   serializador para `Emprestimo`
from ..serializers import EmprestimoSerializer

#   Permissão de gerente
from ..permissions import IsStaff

#   serviço de auditoria (logging)
from ..services.audit_service import AuditService


class EmprestimoViewSet(viewsets.ModelViewSet):
    #   serializador para `Emprestimo`
    serializer_class = EmprestimoSerializer
    
    def get_queryset(self):
        """
            Retorna todos os empréstimos para gerentes e administradores,
            ou apenas os empréstimos do próprio usuário comum.
        """
        user = self.request.user

        # Gerentes e admins veem tudo
        if user.is_staff or user.is_superuser:
            return Emprestimo.objects.all().order_by("-data_emprestimo")

        # Usuário comum vê apenas os seus
        try:
            associado = user.associado
            return Emprestimo.objects.filter(
                associado=associado
            ).order_by("-data_emprestimo")
        except Associado.DoesNotExist:
            return Emprestimo.objects.none()
    
    def get_permissions(self):
        """
        Define as permissões para cada ação do viewset.

        Se a ação for criar, atualizar, atualizar parcialmente ou devolver um livro,
        verifica se o usuário autenticado é um gerente (staff).

        Caso contrário, verifica se o usuário autenticado pode fazer a ação.

        :return: Uma lista de permissões necessárias para a ação.
        :rtype: list[rest_framework.permissions.BasePermission]
        """
        if self.action in [
            "create",
            "update",
            "partial_update",
            "devolver_livro",
        ]:
            return [IsAuthenticated(), IsStaff()]
        return [IsAuthenticated()]
    

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = ["livro", "associado"]
    search_fields = [
        "livro__titulo",
        "associado__nome",
    ]
    ordering_fields = [
        "data_emprestimo",
        "livro__titulo",
        "associado__nome",
    ]

    @transaction.atomic
    def perform_create(self, serializer):
        livro = serializer.validated_data["livro"]
        
        # Verifica se o livro pode ser emprestado (status deve ser DISPONIVEL)
        if livro.status != Livro.Status.DISPONIVEL:
            raise ValidationError({
                "livro": "Este livro não está disponível para empréstimo."
            })
        
        # Obtém o associado logado como gerente
        try:
            gerente = self.request.user.associado
        except AttributeError:
            try:
                gerente = Associado.objects.get(user=self.request.user)
            except Associado.DoesNotExist:
                raise ValidationError({
                    "gerente": "Usuário não vinculado a um associado."
                })
        
        # CORREÇÃO: Não altere o status do livro aqui!
        # O método save() do modelo Emprestimo fará isso automaticamente
        # REMOVA estas linhas:
        # livro.status = Livro.Status.EMPRESTADO
        # livro.save()
        
        # Cria o empréstimo - o método save() do modelo atualizará o status
        emprestimo = serializer.save(
            data_emprestimo=timezone.now().date(),
            quem_emprestou=gerente
        )
        
        # Log do empréstimo
        AuditService.log(
            user=self.request.user,
            action='EMPRESTIMO',
            success=True,
            message='Emprestimo criado com sucesso',
            resource_type='emprestimo',
            resource_id=emprestimo.id,
            request=self.request,
        )
        
        return emprestimo

    @transaction.atomic
    def perform_update(self, serializer):
        """
        Atualiza um empréstimo com base nos dados validados no serializer.

        Se o empréstimo estiver sem uma data de devolução e o serializer tem uma data de devolução,
        registro a devolução com o associado logado como gerente.

        Se o empréstimo estiver com uma data de devolução e o serializer não tem uma data de devolução,
        lança uma exceção de que o empréstimo já foi devolvido.

        Caso contrário, realiza as alterações normais (sem devolução) e loga a atualização.

        :param serializer: Serializer com os dados validados para atualizar o empréstimo
        :type serializer: EmprestimoSerializer
        :return: O empréstimo atualizado
        :rtype: Emprestimo
        """
        instance = self.get_object()
        livro = instance.livro

        devolucao_antes = instance.data_devolucao
        devolucao_depois = serializer.validated_data.get("data_devolucao")
        
        if devolucao_antes is not None and devolucao_depois is not None:
            raise ValidationError({
                "data_devolucao": "Este empréstimo já foi encerrado."
            })

        # Se está registrando uma devolução
        if devolucao_antes is None and devolucao_depois is not None:
            # Obtém o associado logado como gerente da devolução
            try:
                gerente_devolucao = self.request.user.associado
            except AttributeError:
                try:
                    gerente_devolucao = Associado.objects.get(user=self.request.user)
                except Associado.DoesNotExist:
                    raise ValidationError({
                        "quem_devolveu": "Usuário não vinculado a um associado."
                    })
            
            # Adiciona quem_devolveu aos dados validados
            serializer.validated_data["quem_devolveu"] = gerente_devolucao
            
            # Salva as alterações
            emprestimo = serializer.save()
            
            # Atualiza status do livro
            livro.status = Livro.Status.DISPONIVEL
            livro.save()
            
            # Log da devolução
            AuditService.log(
                user=self.request.user,
                action='DEVOLUCAO',
                success=True,
                message='Livro devolvido com sucesso',
                resource_type='emprestimo',
                resource_id=emprestimo.id,
                request=self.request
            )
        else:
            # Atualizações normais (sem devolução)
            emprestimo = serializer.save()
            
            # Log de atualização (sem devolução)
            changes = {}
            for field, value in serializer.validated_data.items():
                if field not in ['quem_devolveu', 'quem_emprestou'] and getattr(instance, field) != value:
                    changes[field] = {
                        'de': getattr(instance, field),
                        'para': value
                    }
            
            if changes:
                AuditService.log(
                    user=self.request.user,
                    action='UPDATE',
                    success=True,
                    message='Emprestimo atualizado com sucesso',
                    resource_type='emprestimo',
                    resource_id=emprestimo.id,
                    details=changes,
                    request=self.request
                )

    @action(
        detail=False,
        methods=["get"],
        url_path="ativos",
    )
    def ativos(self, request):
        """
        Retorna empréstimos ainda ativos (não devolvidos).
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(
                data_devolucao__isnull=True
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(
        detail=True,
        methods=["post"],
        url_path="devolver",
        permission_classes=[IsAuthenticated]
    )
    def devolver_livro(self, request, pk=None):
        """
        Endpoint específico para devolução de livro.
        Registra quem fez a devolução e atualiza status do livro.
        """
        emprestimo = self.get_object()
        
        # Verifica se já foi devolvido
        if emprestimo.data_devolucao is not None:
            return Response(
                {"error": "Este empréstimo já foi devolvido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Obtém o associado logado que está fazendo a devolução
            try:
                # Assumindo que o usuário está vinculado a um Associado
                # Se você tem um relacionamento OneToOne entre User e Associado
                gerente_devolucao = request.user.associado
                
                # Verifica se o associado é um gerente (se necessário)
                # Remova esta verificação se qualquer associado pode devolver
                if not gerente_devolucao.gerente:
                    return Response(
                        {"error": "Apenas gerentes podem registrar devoluções."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    
            except AttributeError:
                # Se não há relacionamento direto, tenta encontrar o associado pelo usuário
                try:
                    gerente_devolucao = Associado.objects.get(user=request.user)
                except Associado.DoesNotExist:
                    return Response(
                        {"error": "Usuário não vinculado a um associado."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Atualiza a data de devolução e quem devolveu
            emprestimo.data_devolucao = timezone.now().date()
            emprestimo.quem_devolveu = gerente_devolucao
            emprestimo.save()
            
            # Atualiza status do livro
            livro = emprestimo.livro
            livro.status = Livro.Status.DISPONIVEL
            
            #   cache
            if hasattr(livro, 'tem_emprestimo_ativo'):
                livro.tem_emprestimo_ativo = False
                
            livro.save()
            
            # Log da devolução
            AuditService.log(
                user=request.user,
                action='DEVOLUCAO',
                success=True,
                message='Livro devolvido com sucesso',
                resource_type='emprestimo',
                resource_id=emprestimo.id,
                request=request
            )
        
        serializer = self.get_serializer(emprestimo)
        return Response(serializer.data)
    
    #   Renovar um livro
    @action(
    detail=True,
    methods=["post"],
    url_path="renovar",
    permission_classes=[IsAuthenticated, IsStaff],
    )
    def renovar(self, request, pk=None):
        """
        Renova um empréstimo ativo.
        Apenas gerentes podem renovar.
        """
        emprestimo = self.get_object()

        # Não pode renovar empréstimo já devolvido
        if emprestimo.data_devolucao is not None:
            raise ValidationError({
                "emprestimo": "Este empréstimo já foi devolvido e não pode ser renovado."
            })

        # Define política de renovação (ex: +7 dias)
        dias_renovacao = 7

        hoje = timezone.now().date()

        # Se já existe data prevista, renova a partir dela
        base = (
            emprestimo.data_devolucao_prevista
            if emprestimo.data_devolucao_prevista
            else hoje
        )

        nova_data = base + timedelta(days=dias_renovacao)

        emprestimo.data_devolucao_prevista = nova_data
        emprestimo.save()

        # Auditoria
        AuditService.log(
            user=request.user,
            action="RENOVACAO",
            success=True,
            message="Empréstimo renovado com sucesso",
            resource_type="emprestimo",
            resource_id=emprestimo.id,
            details={
                "nova_data_devolucao_prevista": str(nova_data)
            },
            request=request,
        )

        serializer = self.get_serializer(emprestimo)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Empréstimos não podem ser removidos.")