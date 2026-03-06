---
schema: 1
type: study-concept

id: 0c5963d2-a423-4ae8-914b-7398d15ae500

aliases: []
topics: []
courses: []

tags: [concept, study]

created: 2026-02-08
updated: 2026-02-08
---
# (sala-de-leitura) refatoração do modelo de dados Associado
Identificamos que o modelo `User` padrão do Django é suficiente para todas as funcionalidades que gostaríamos de expôr aos nossos usuários. Portanto, este é a documentação da migração do modelo de dados `Associado`, que deverá **se desvincular** das funções de usuário e deverá servir como **perfil estendido do usuário**.

Partimos do modelo de dados antigo:

```python
class Associado(models.Model):
    """
        Modelo para um associado (usuário) da sala de leitura.
        
        Um associado é caracterizado por
        -   seu nome;
        -   seu aniversário;
        -   se ele está ativo;
        -   se ele é gerente.
    """
    user = models.OneToOneField(
            settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE,
            related_name="associado",
        )

    nome = models.CharField(max_length=255)
    aniversario = models.DateField()
    esta_ativo = models.BooleanField(default=True)
    gerente = models.BooleanField(default=False)
```

No modelo `User` padrão, encontramos diversos campos que cumprem as funções anteriormente implementadas em `Associado`:
- `username`: nome de usuário único
- `first_name` e `last_name`: nome e sobrenome de um usuário;
- `email`;
- `is_active`: usuário ativo;
- `is_staff`: usuário tem acesso ao painel de administração de `myapp`($=$ sala de leitura, aqui);
- `is_superuser`: superusuário do projeto Django;
- `date_joined` e `last_login`.

Devemos manter em `Associado` aqueles campos que são relacionados ao _perfil estendido_ de um usuário. O campos `nome` e `esta_ativo` já estão em `User`. O campo booleano `gerente` deixará de existir (assim como as permissões relacionadas), pois `is_staff` já nos serve muito bem.

```python
"""
    `backend/api/models/Associado.py`
    
    `Associado` é o perfil estendido de um usuário (`Django.models.User`) da sala de leitura. Armazena informações específicas da sua aplicação que não existem no User padrão.
"""

from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Associado(models.Model):
    """
        Perfil estendido para usuários da sala de leitura.
        Complementa o modelo User padrão do Django.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="associado",
        verbose_name="Usuário"
    )
    
    # perfil estendido: campos que não existem no User padrão
    aniversario = models.DateField(
        verbose_name="Data de aniversário",
        help_text="Data de nascimento do associado"
    )
    
    telefone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Telefone"
    )

    class Meta:
        verbose_name = "Associado"
        verbose_name_plural = "Associados"
        ordering = ['user__first_name']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.user.username}"

    # Propriedades úteis
    @property
    def nome_completo(self):
        """Delega para o User"""
        return self.user.get_full_name()
    
    @property
    def email(self):
        """Delega para o User"""
        return self.user.email
    
    @property
    def esta_ativo(self):
        """Delega para o User"""
        return self.user.is_active
```

Note que podemos definir _propriedades_ para o modelo de dados `Associado` que fazem uso dos campos `email` e do método `get_full_name()` do modelo `User`. De maneira análoga, usamos o campo booleano `User.is_active` para substituir o agora removido `Associado.esta_ativo`.

---
# sinais para sincronização
É necessário que haja sempre uma concordância entre pares de usuários e associados.  Para tanto, implementamos os _sinais_ abaixo, executados sempre que um `Associado`, ou um `User`, é criado.

```python
# backend/api/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Associado

@receiver(post_save, sender=User)
def criar_perfil_associado(sender, instance, created, **kwargs):
    """Cria perfil de Associado automaticamente para novos usuários"""
    if created:
        Associado.objects.create(user=instance)

@receiver(post_save, sender=User)
def salvar_perfil_associado(sender, instance, **kwargs):
    """Garante que o perfil seja salvo quando o usuário for salvo"""
    instance.associado.save()
```

---
# cadastro de novos usuários
Para registrar novos usuários (associados) à sala de leitura, usaremos o módulo `forms` do Django, bem como o formulário específico para criar objetos `User`, `UserCreationForm`. Esta é uma classe para a qual podemos escrever subclasses que são formulários customizados para novo usuário. Em nosso caso, não queremos nada muito diferente do modelo padrão.

```python
# backend/api/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Associado

class FormRegistroUsuario(UserCreationForm):
    """Form para registro de usuário (campos do User)"""
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 
                  'email', 'password1', 'password2']

class FormPerfilAssociado(forms.ModelForm):
    """Form para perfil estendido (campos do Associado)"""
    class Meta:
        model = Associado
        fields = ['aniversario', 'telefone', 'foto', 'bio', 'gerente']
```

---