"""
    `backend/api/permissions/roles.py`
    
    Definição das permissoes baseadas em roles (gerente, usuário e admin)
    
    Usuários (associados) podem:
        1.  VER todos os LIVROS;
        2.  VER todos os SEUS EMPRÉSTIMOS, atuais ou passados;
        3.  VER informações sobre a SUA CONTA ('/me') isto é, sobre seu usuário e seu associado;
    
    Gerentes (staff) podem:
        Usuário ++
        
            4.  ALTERAR (patch) todos os EMPRÉSTIMOS:
                4.1.    FAZER um EMPRÉSTIMO (POST);
                4.2.    DEVOLVER um EMPRÉSTIMO (PATCH);
            
            5.  VER o dashboard ('/dashboard');
            
            6.  REGISTRAR NOVOS ASSOCIADOS / USUÁRIOS (POST);
            
            7.  VER os logs de autenticação e auditoria ('/logs');
            
    
    Administradores (admin) podem:
        Usuário ++ Gerente ++
        
            5.  POST, PATCH, DELETE em todos os { LIVROS, ASSOCIADOS ++ USUÁRIOS, EMPRÉSTIMOS }
"""

from rest_framework.permissions import BasePermission


class IsStaff(BasePermission):
    """
    Permite acesso apenas a usuários staff.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class IsAdmin(BasePermission):
    """
    Permite acesso apenas a superusers.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )