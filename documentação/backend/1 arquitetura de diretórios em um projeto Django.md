# 1. Arquitetura de diretórios do backend Django
Visão geral

O backend do aplicativo Sala de Leitura foi desenvolvido utilizando o framework Django, seguindo uma arquitetura modular e organizada, com clara separação de responsabilidades. A estrutura de diretórios busca facilitar a manutenção, escalabilidade e compreensão do sistema.

De forma geral, o backend é dividido em:

- Projeto Django principal (`core`)
- Aplicação principal (`api`)
- Infraestrutura e suporte (`logs`, `scripts`, dependências)

---
## 2. Estrutura raiz do backend
```bash
backend/
├── api/
├── core/
├── logs/
├── manage.py
├── requirements.txt
└── endpoint.sh
```

### **Descrição dos principais itens**
- `manage.py`
    - Script principal de gerenciamento do Django. É utilizado para executar comandos como:
        - `runserver`, para iniciar o servidor de desenvolvimento;
        - `migrate`, para executar as migrações do banco de dados;
        - `createsuperuser`, para criar um superusuário;
        -  comandos personalizados do projeto

- `requirements.txt`
    - Arquivo de dependências do projeto. Contém as versões das bibliotecas e frameworks utilizados.

- `endpoint.sh`
    - Script de inicialização do endpoint. Ele executa o comando `python manage.py runserver` para iniciar o servidor de desenvolvimento.

- `logs/`
    - Diretório para armazenar logs do servidor.
    - `application.log`: Arquivo principal de logs do servidor, incluindo os **eventos de auditoria**.


---
## 3. `core/`, configuração do projeto

```bash
core/
├── asgi.py
├── settings.py
├── urls.py
└── wsgi.py
```

Este diretório representa o projeto Django principal, contendo as configurações globais da aplicação.

### `settings.py`

Arquivo central de configuração:

* Apps instalados
* Middlewares
* Banco de dados
* Autenticação
* Logging
* Variáveis de ambiente

### `urls.py`

Arquivo responsável por registrar as rotas globais do backend e delegar rotas para a aplicação `api`.

### `asgi.py` / `wsgi.py`

Pontos de entrada para servidores ASGI/WSGI, utilizados em produção.

---

## 4. `api/`, aplicação principal
```bash
api/
├── admin.py
├── apps.py
├── management/     #   comandos de gerência (auditoria)
├── middleware/     #   middlewares (auth, logs)
├── migrations/     #   migrações do banco de dados
├── models/         #   modelos de dados
├── serializers/    #   serializadores de dados
├── services/       #   serviços do backend (auditoria)
├── views/          #   views do backend
├── permissions.py  #   permissoes do backend
├── signals.py      #   signals do backend
└── urls.py         #   rotas da API
```

### Subdiretórios e arquivos

#### `models/`, Classes de domínio
---------------------------------------------------------

Contém os modelos de domínio, organizados em arquivos separados por entidade:

* `Livro.py`, definição do modelo de dados `Livro`.
* `Emprestimo.py`, definição do modelo de dados `Emprestimo`.
* `Associado.py`, definição do modelo de dados `Associado`.

Essa separação melhora a legibilidade e evita arquivos monolíticos.

#### `serializers/`, Serializadores de dados
---------------------------------------------------------

Responsável pela serialização e validação de dados, particularmente para a API REST.

* Serializers específicos para criação (`AssociadoCreate.py`)
* Serializers de leitura e escrita (`Livro.py`, `Emprestimo.py`, etc.)

#### `views/`, Views da API
---------------------------------------------------------

Contém as views da API, organizadas por contexto funcional:

* Autenticação (`Auth.py`)
* Usuário autenticado (`Me.py`)
* Gestão de livros (`Livro.py`)
* Empréstimos (`Emprestimo.py`)
* Dashboard e diagnósticos (`Dashboard.py`, `Diagnostico.py`)

#### `services/`, Serviços de domínio
---------------------------------------------------------

Abriga serviços de domínio, responsáveis por lógica que não pertence diretamente às views ou classes.

* `audit_service.py`: centraliza o registro de logs de auditoria.

#### `middleware/`, Middlewares customizados do Django
---------------------------------------------------------

Middlewares customizados do Django, utilizados para:

* Logging automático
* Verificação de consistência de dados
* Auditoria de requisições

#### `signals.py`, Sinais do Django
---------------------------------------------------------

Define signals do Django para executar ações automáticas em eventos do sistema (ex.: criação ou alteração de registros).

#### `permissions.py`, Permissões customizadas
---------------------------------------------------------

Define permissões customizadas para controle de acesso à API.
