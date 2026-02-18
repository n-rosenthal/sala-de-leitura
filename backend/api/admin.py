from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from .models import Livro, Associado, Emprestimo



class AssociadoInline(admin.StackedInline):
    model = Associado
    can_delete = False
    verbose_name_plural = 'Perfil Associado'
    fields = ['aniversario', 'telefone']

class UserWithAssociadoAdmin(UserAdmin):
    inlines = [AssociadoInline]

# Substitui o UserAdmin padrão
admin.site.unregister(User)
admin.site.register(User, UserWithAssociadoAdmin)


@admin.register(Associado)
class AssociadoAdmin(admin.ModelAdmin):
    """Admin para o modelo Associado (visualização separada)."""
    list_display = ('id', 'get_username', 'get_full_name', 'get_email', 'aniversario', 'get_is_active')
    list_filter = ('user__is_active', 'aniversario')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'telefone')
    list_select_related = ('user',)
    ordering = ('user__username',)
    fieldsets = (
        ('Dados do Usuário', {
            'fields': ('user',)
        }),
        ('Informações do Associado', {
            'fields': ('aniversario', 'telefone')
        }),
    )
    readonly_fields = ('user',)  # Impede troca de user (deve ser criado junto)
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    get_username.admin_order_field = 'user__username'

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome Completo'
    get_full_name.admin_order_field = 'user__first_name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

    def get_is_active(self, obj):
        return obj.user.is_active
    get_is_active.short_description = 'Ativo'
    get_is_active.admin_order_field = 'user__is_active'
    get_is_active.boolean = True

@admin.register(Livro)
class LivroAdmin(admin.ModelAdmin):
    list_display = ("id", "titulo", "autor", "status")
    list_filter = ("status",)
    search_fields = ("titulo", "autor")

@admin.register(Emprestimo)
class EmprestimoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "livro",
        "associado",
        "data_emprestimo",
        "data_devolucao",
    )
    readonly_fields = ("data_emprestimo",)
