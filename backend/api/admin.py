from django.contrib import admin
from .models import Livro, Associado, Emprestimo


@admin.register(Livro)
class LivroAdmin(admin.ModelAdmin):
    list_display = ("id", "titulo", "autor", "status")
    list_filter = ("status",)
    search_fields = ("titulo", "autor")


@admin.register(Associado)
class AssociadoAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "esta_ativo", "gerente")
    list_filter = ("esta_ativo", "gerente")


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
