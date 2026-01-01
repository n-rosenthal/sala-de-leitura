#   `backend/api/fixtures`
*Fixtures* são dados fixos, passíveis de serem versionados por Git. São utilizados para popular o banco de dados de desenvolvimento e para testes. Foram usados *Django fixtures*, para fazer uso do ORM do Django em vez de SQL puro, respeitando os relacionamentos entre objetos.

##  Arquivos
-   `backend/api/fixtures/associados.json`, *fixtures* de associados.
-   `backend/api/fixtures/livros.json`, *fixtures* de livros.
-   `backend/api/fixtures/emprestimos.json`, *fixtures* de empréstimos.

##  Uso
Os *fixtures* são lidos via script pelo Postgresql:

```
psql "postgresql://user:pass@host:port/dbname" -f seed.sql
```

sendo `seed.sql` o script de população do banco de dados.

---