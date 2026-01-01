##   $\S 1.$ Domínio de Dados
###  Entidade `Associado`
Um `Associado` é um usuário da sala de leitura. A todo `Associado` é vinculado um modelo `User` do Django. 
Existem associados comuns, usuários do sistema, e gerentes. Um gerente tem permissão para tudo aquilo que um usuário comum tem, além de outras permissões.
Define-se um `Associado` por

```python
class Associado(models.Model):
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

onde
- `user` é o modelo `User` do Django;
- `nome` é o nome completo do associado da sala de leitura;
- `aniversario` é a data de nascimento do associado;
- `esta_ativo` indica se o associado está ativo;
- `gerente` indica se o associado é gerente da sala de leitura.

note que, em Django, um `User` é

```python
class User(AbstractUser):
    #   nome de usuário
    username = models.CharField(max_length=150, unique=True)

    #   endereço de e-mail
    email = models.EmailField(max_length=254, unique=True)

    #   gerência, interno
    is_staff = models.BooleanField(default=False)

    #   superusuário
    is_superuser = models.BooleanField(default=False)

    #   ver. atividade
    is_active = models.BooleanField(default=True)
    ...
```

para melhor alinhar o Backend com o restante do projeto, alguns campos do modelo `User` foram aproveitados para definir campos em `Associado`.

---

###  Entidades `Livro` e `LivroStatus`
Um `Livro` representa um livro físico, unicamente identificado por uma *string*, na sala de leitura. A todo `Livro`, associa-se um `LivroStatus`, que é o estado atual do livro na sala de leitura. Através deste *status* (e, na prática, de verificações e validações no banco de dados), são definidas *ações* possíveis sobre o livro (por exemplo, se um livro está *disponível*, então ele pode ser *emprestado* etc).

Definem-se `Livro` e `LivroStatus` por

```python
class Status(models.TextChoices):
        """
            Status possíveis de um Livro
        """
        DISPONIVEL  = "DISPONIVEL",     "Disponível"
        EMPRESTADO  = "EMPRESTADO",     "Emprestado"
        GUARDADO    = "PARA_GUARDAR",   "Para guardar"
        DOADO       = "DOADO", "Doado"
        PERDIDO     = "PERDIDO", "Perdido"

    #   identificador alfanumérico único de um livro
    id = models.CharField(
        max_length=10,
        primary_key=True,
    )
    
    #   título do livro
    titulo = models.CharField(max_length=255)
    
    #   autor do livro
    autor = models.CharField(max_length=255)
    
    #   ano de publicação do livro
    ano = models.PositiveIntegerField()
    
    #   status do livro
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.DISPONIVEL
    )
```

---

###  Entidade `Emprestimo`
Representação de um empréstimo de um `Livro` para um `Associado`. Um `Emprestimo` guarda todas as informações necessárias para registrar a transação na sala de leitura; quando ocorre a devolução do livro, o objeto `Emprestimo` é atualizado.
Define-se um `Emprestimo` por

```python
#   `Livro` a ser emprestado
    livro = models.ForeignKey(
        Livro,
        on_delete=models.PROTECT,
        related_name="emprestimos"
    )
    
    #   `Associado` a quem é emprestado o livro
    associado = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos"
    )

    #   Data na qual foi feito o empréstimo
    data_emprestimo = models.DateField(auto_now_add=True)
    
    #  Data prevista de devolução, por padrão é 7 dias (uma semana) após o empréstimo
    data_prevista = models.DateField(default=now() + timedelta(days=7))
    
    #   Data na qual o livro foi devolvido, possivelmente vazio
    data_devolucao = models.DateField(null=True, blank=True)
    
    #   Gerente que fez o empréstimo
    quem_emprestou = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos_feitos",
        null=True,
        blank=True
    )
    
    #   Gerente que fez a devolução
    quem_devolveu = models.ForeignKey(
        Associado,
        on_delete=models.PROTECT,
        related_name="emprestimos_devolvidos",
        null=True,
        blank=True
    )
```

---
## `\S 2.$ Entidade `AuditLog`
A entidade `AuditLog` representa um *log* de ações do sistema. Não se trata, portanto, do domínio do problema, mas da implementação da solução. Para toda $*$ ação de um usuário no sistema, um objeto `AuditLog` é registrado no banco de dados. Os *logs* podem visualizados no frontend.
Define-se um `AuditLog` por

```python
class AuditLog(models.Model):
    """
        Log de ações do sistema
    """
    class Action(models.TextChoices):
        """
            Enumeração de ações possíveis para o sistema de auditoria
        """
        #   Autenticação de usuário
        LOGIN = "LOGIN"
        LOGOUT = "LOGOUT"
        LOGIN_FAILED = "LOGIN_FAILED"

        #   Transformações sobre objetos
        CREATE = "CREATE"
        UPDATE = "UPDATE"
        DELETE = "DELETE"
        
        #   Diagnósticos sobre objetos
        CONSISTENCIA = "CONSISTENCIA"

        #   Funções sobre objetos `Emprestimo`
        EMPRESTIMO = "EMPRESTIMO"
        DEVOLUCAO = "DEVOLUCAO"

    #   usuário que realizou a ação
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    #   ação realizada
    action = models.CharField(max_length=50, choices=Action.choices)

    #   dados da ação
    resource_type = models.CharField(max_length=50, null=True, blank=True)
    resource_id = models.PositiveIntegerField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    success = models.BooleanField(default=True)
    message = models.TextField(null=True, blank=True)

    diff = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
```

---
### `\S 3.$ Banco de Dados
O banco de dados é PostgreSQL, definido no arquivo `docker-compose.yaml`. O banco de dados `db` é utilizado pelo backend. Atualmente, todas as tabelas do banco são:

`pg_dump`:

```sql
--
-- Name: api_associado_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

ALTER TABLE public.api_associado ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.api_associado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: api_livro; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.api_livro (
    id character varying(10) NOT NULL,
    titulo character varying(255) NOT NULL,
    autor character varying(255) NOT NULL,
    ano integer NOT NULL,
    status character varying(12) NOT NULL,
    CONSTRAINT api_livro_ano_check CHECK ((ano >= 0))
);

--
-- Name: api_emprestimo; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.api_emprestimo (
    id bigint NOT NULL,
    data_emprestimo date NOT NULL,
    data_devolucao date,
    associado_id bigint NOT NULL,
    livro_id character varying(10) NOT NULL,
    data_prevista date NOT NULL,
    quem_devolveu_id bigint,
    quem_emprestou_id bigint
);

--
-- Name: api_auditlog; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.api_auditlog (
    id bigint NOT NULL,
    action character varying(50) NOT NULL,
    resource_type character varying(50),
    resource_id integer,
    ip_address inet,
    user_agent text,
    success boolean NOT NULL,
    message text,
    diff jsonb,
    created_at timestamp with time zone NOT NULL,
    user_id integer,
    CONSTRAINT api_auditlog_resource_id_check CHECK ((resource_id >= 0))
);
```

Para ver o `pg_dump` todo, consulte o arquivo `schema.sql`.