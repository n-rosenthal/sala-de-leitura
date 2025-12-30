# 2. Comandos de gerência do backend

## Introdução

O diretório api/management/commands/ contém comandos de gerência personalizados do Django. Esses comandos são utilizados para tarefas administrativas, diagnósticos e manutenção do sistema, permitindo interagir diretamente com o banco de dados e os logs da aplicação.

Todos os comandos podem ser executados a partir da raiz do backend usando:

```bash
python manage.py <nome_do_comando>
```

Isto geralmente é feito dentro do contâiner Docker, então o comando se torna

```bash
docker compose exec backend python manage.py <nome_do_comando>
```

---
## Estrutura dos Comandos
```bash
api/management/commands/
├── corrigir_inconsistencias.py
├── verificar_livros.py
└── view_logs.py
```

---
## Comandos de Auditoria

### Comando `verificar_livros`

#### Objetivo
Verificar a consistência entre o status dos livros e os empréstimos ativos registrados no sistema.

#### Descrição
O comando percorre todos os livros cadastrados e valida se:

* Um livro marcado como `DISPONÍVEL` não possui empréstimos ativos.
* Um livro marcado como `EMPRESTADO` possui pelo menos um empréstimo ativo.

#### Execução

`python manage.py verificar_livros`

#### Saída esperada

Lista detalhada de inconsistências encontradas, ou

Mensagem de sucesso caso todos os livros estejam consistentes.

#### Uso recomendado

- Diagnóstico do sistema
- Auditoria de dados
- Antes de relatórios ou manutenções críticas

### Comando `corrigir_inconsistencias`

#### Objetivo
Corrigir automaticamente inconsistências detectadas entre livros e empréstimos.

#### Descrição
Este comando:

* Ajusta o status do livro para `EMPRESTADO` quando existem empréstimos ativos.
* Ajusta o status para `DISPONÍVEL` quando não há empréstimos ativos.
* Registra no terminal cada correção realizada.

#### Execução

`python manage.py corrigir_inconsistencias`

#### Saída esperada

- Log detalhado das correções efetuadas
- Total de livros corrigidos ao final da execução

#### Uso recomendado

- Manutenção do banco de dados
- Correção rápida de inconsistências operacionais

---

## Comandos de Logging

### Comando `view_logs`

#### Objetivo
Exibir os logs recentes de auditoria da aplicação.

#### Descrição
O comando lê o arquivo `logs/application.log` e filtra apenas registros de auditoria (AUDIT_LOG), exibindo os eventos mais recentes no terminal.

#### Execução

`python manage.py view_logs`

#### Parâmetros opcionais

`python manage.py view_logs --lines 100`

#### Opções

* `--lines`: define o número de registros exibidos (padrão: 50)

#### Uso recomendado

* Auditoria de ações do sistema
* Diagnóstico de comportamento do backend
* Monitoramento administrativo

---