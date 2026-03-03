"""
    `backend/api/permissions.py`

    Custom DRF permission classes for the API.
"""

from rest_framework.permissions import BasePermission


class IsStaff(BasePermission):
    """
    Allows access only to staff users (gerentes / administradores).
    Used for write operations on Livro and Emprestimo.
    """
    message = "Apenas gerentes e administradores podem realizar esta ação."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsOwnerOrStaff(BasePermission):
    """
    Object-level permission: allows access if the requesting user is the
    owner of the Associado profile, or is a staff member.

    Assumes the object being checked has an `user` attribute (i.e. Associado).
    """
    message = "Você não tem permissão para modificar o perfil de outro usuário."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user == request.user
