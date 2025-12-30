#   Páginas padrão do Next.js (page, layout, error, loading, not-found)
A partir do Next.js, podemos definir algumas páginas que deverão ser exibidas ou renderizadas se, e somente se, alguma condição ocorrer. A página `page.tsx` refere-se ao conteúdo que realmente queremos mostrar quando o usuário acessar uma rota. Caso o usuário acesse uma rota e esta ainda não tenha sido totalmente carregada, mostraremos o conteúdo de `loading.tsx`. Caso o usuário acesse uma rota que não existe, mostraremos o conteúdo de `not-found.tsx`. Caso haja um erro ao executar o componente, mostraremos o conteúdo de `error.tsx`.

---
##  `page.tsx`
A página `page.tsx` refere-se ao conteúdo que realmente queremos mostrar quando o usuário acessar uma rota.

##  `layout.tsx`
A página `layout.tsx` refere-se ao layout que queremos mostrar quando o usuário acessar uma rota. Devemos construir `page.tsx` tal que ela seja renderizada dentro de `layout.tsx`.

##  `loading.tsx`
Captura o carregamento de uma página. Enquanto `page.tsx` não for totalmente carregada, exibimos `loading.tsx`.
As componentes `loading.tsx` exibem o esqueleto do *layout*, `PageSkeleton`. Alguns componentes tem esqueletos específicos, como `LivroCardSkeleton` para manter o *layout* de um cartão de livro, antes que este carregue. `FormSkeleton` para manter o *layout* de um formulário, antes que este carregue, e assim por diante.

##  `error.tsx`
*Error boundary* para páginas. Esta página captura **qualquer** erro de runtime (execução). 

##  `not-found.tsx`
Captura erros `404 Not Found`, isto é, para páginas não encontradas.

---