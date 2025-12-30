# Documentação da API para o Frontend

Esta seção descreve como o frontend deve consumir a API, com foco em **autenticação**, **permissões** e **endpoints principais**.

---

## $\S 1.$ Autenticação (obrigatória)
Para *rotas protegidas*, o *header* padrão é

```bash
Authorization: Bearer <access_token>
```

Se o token for inválido, o frontend deve receber um erro `401 Unauthorized`.

### $\S 1.1.$ Login
#### *Endpoint*

```bash
POST /api/auth/login/
```

#### *Body*

```json
{
    "username": "usuário",
    "password": "senha"
}
```

#### *Resposta*

```json
{
  "message": "Login realizado com sucesso",
  "user_id": 3,
  "username": "usuario",
  "is_gerente": false
}
```

#### Erros

- `401 Unauthorized`: Usuário ou senha inválidos
- `403 Forbidden`: Usuário sem permissões suficientes

---
### $\S 1.2.$ Logout
#### *Endpoint*

```bash
POST /api/auth/logout/
```

#### *Headers*

```bash
Authorization: Bearer <token>
```

#### *Resposta*

```json
{
  "message": "Logout realizado com sucesso"
}
```

---
## $\S 2.$ `/me`, usuário autenticado

Este *endpoint* é usado para obter dados do usuário atualmente logado no sistema. Quando queremos, por exemplo, saber quem é o gerente que fez uma devolução ou o empréstimo de um livro, recorremos ao `/me`. De modo mais genérico, `/me` é usado para

- Persistir sessão no frontend
- Verificar se o usuário é gerente
- Controlar rotas protegidas e visibilidade de componentes

#### *Endpoint*

```bash
GET /api/me/
```

#### *Resposta*

```json
{
  "id": 3,
  "username": "usuario",
  "email": "user@email.com",
  "is_staff": false,
  "is_superuser": false
}
```

---
## $\S 3.$ Livros
### Listar livros
```bash
GET /api/livros/
Authorization: Bearer <token>
```

É possível aplicar filtros para restringir os resultados retornados pela API, utilizando *query parameters*:

```bash
#   retorna todos os livros cujo título contenha "livro"
GET /api/livros/?search=livro
 
#   retorna todos os livros (cujo título contenha "livro") e (cujo status seja "disponivel")
GET /api/livros/?search=livro&status=disponivel
```

#### Exemplo de resposta
```json
[
  {
    "id": 12,
    "titulo": "Introdução à Computação",
    "autor": "John Doe",
    "status": "disponivel"
  },
  {
    "id": 18,
    "titulo": "Estruturas de Dados",
    "autor": "Jane Smith",
    "status": "emprestado"
  }
]
```


➕ Criar livro (gerente)
POST /api/livros/
Authorization: Bearer <token>


📌 O frontend deve ocultar ações administrativas para usuários que não são gerentes.