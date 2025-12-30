# Autenticação e Permissões
---

## 1. Visão geral do modelo de autenticação

O backend do aplicativo Sala de Leitura utiliza um modelo de autenticação baseado em JWT (JSON Web Tokens), implementado com o Django Rest Framework e a biblioteca SimpleJWT.

A autenticação é stateless, sendo realizada por meio de tokens enviados no header HTTP Authorization, no formato:

```shell
Authorization: Bearer <access_token>
```


Por padrão, todas as rotas da API são protegidas, exigindo autenticação prévia, exceto aquelas explicitamente marcadas como públicas.

---

## 2. Configuração global de autenticação

A configuração de autenticação e permissões globais encontra-se em `core/settings.py`.

### 2.1 Classe de autenticação padrão
```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}
```

Isso define que:

- Todas as requisições autenticadas devem fornecer um JWT válido
- O usuário autenticado é automaticamente injetado em `request.user`

---
### 2.2 Permissão global padrão

```python
"DEFAULT_PERMISSION_CLASSES": (
    "rest_framework.permissions.IsAuthenticated",
)
```

Com essa configuração:

- Todas as views exigem autenticação
- Views públicas devem declarar explicitamente `AllowAny`

Essa abordagem segue o princípio de *secure by default*.

---
### 2.3 Configuração dos tokens JWT

```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}
```


- Access Token: válido por 30 minutos
- Refresh Token: válido por 1 dia
- O token é enviado via header Authorization: Bearer

---
## 3. Modelo de usuário e domínio
### 3.1 Usuário Django (User)

O sistema utiliza o modelo padrão User do Django para autenticação, contendo:
- username
- email
- password
- is_staff
- is_superuser

---
### 3.2 Modelo Associado

A entidade de domínio Associado representa o usuário da sala de leitura e está vinculada ao usuário Django via relacionamento One-to-One:

```python
user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="associado",
)
```
Cada associado possui os seguintes atributos próprios do domínio:
- nome
- aniversario
- esta_ativo
- gerente

Note que o campo gerente define usuários com privilégios administrativos no domínio da aplicação.

---
## 4. Criação de usuários Django

A criação de associados ocorre via serializer `AssociadoCreate`. Durante o processo:

- Um usuário Django é criado apenas se username e password forem fornecidos
- O campo gerente define automaticamente is_staff no usuário Django

```python
user = User.objects.create_user(
    username=username,
    password=password,
    email=email,
    is_staff=validated_data.get("gerente", False),
)
```

Isso garante sincronização entre os domínios Associado e User.

---
## 5. Endpoints de autenticação

### 5.1 Login

#### Endpoint

`POST /api/auth/login/`

#### Permissão

Pública (`AllowAny`)

#### Fluxo

1. Recebe username e password
2. Autentica usando django.contrib.auth.authenticate
3. Verifica se o usuário está ativo
4. Registra o login no sistema de auditoria
5. Retorna informações básicas do usuário

#### Eventos auditados

* Login bem-sucedido
* Tentativa com conta inativa
* Tentativa com credenciais inválidas

### 5.2 Logout

#### Endpoint

`POST /api/auth/logout/`

#### Permissão

Apenas usuários autenticados (`IsAuthenticated`)

#### Fluxo

1. Registra o logout no sistema de auditoria
2. Encerra a sessão do usuário

---
## 6. Endpoint do usuário autenticado
Este endpoint é responsável por retornar informações sobre o usuário autenticado atualmente.


### 6.1 Endpoint `/me`

`GET /api/me/`

#### Permissão

`IsAuthenticated`, somente usuários (associados).

#### Descrição

Retorna informações do usuário atualmente autenticado, permitindo que o frontend:

* Valide a sessão
* Identifique permissões
* Personalize a interface

#### Campos retornados
* [id](#id)
* [username](#username)
* [email](#email)
* [is_staff](#is_staff)
* [is_superuser](#is_superuser)

---
## 7. Sistema de permissões
### 7.1 Permissões padrão

Todas as *views* exigem autenticação, exceto aquelas explicitamente públicas. Veja a próxima secção, *4 permissões e endpoints*, para mais detalhes.

### 7.2 Permissão customizada: `IsGerente`

```python
class IsGerente(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff
```

Essa permissão restringe o acesso a usuários que:

1. Estão autenticados, e
2. Possuem privilégios administrativos (`is_staff == True`)

Essa abordagem permite controle de acesso baseado em papéis (RBAC).
Essa abordagem foi escolhida para fazer uso da própria ferramenta do Django para usuários gerentes (`is_staff == True`), o que facilita a integração com outras áreas do aplicativo. 

---
## 8. Auditoria e autenticação
### 8.1 Logs de autenticação
---------------------------

O sistema registra eventos críticos relacionados à autenticação, como:

* Login
* Logout
* Tentativas falhas
* Conta inativa

Esses eventos incluem:

* ID do usuário (ou anonymous)
* IP do cliente
* User-Agent
* Timestamp

### 8.2 Middleware de auditoria
---------------------------

O AuditLogMiddleware registra automaticamente todas as requisições feitas para /api/, incluindo:

* Usuário autenticado
* Método HTTP
* Endpoint acessado
* Código de resposta
* Tempo de execução

Isso garante rastreabilidade completa das ações do sistema.

---