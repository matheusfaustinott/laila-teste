Usuario (1) ────< (N) Transaction (N) >──── (1) Categoria
   |                                    ^
   |                                    |
   └───< (N) Categoria ──────────────────┘

Validando o que foi pedido no teste, basicamente:

Um Usuário tem vários lançamentos e várias categorias.
Uma Categoria pertence a um único usuário.
Um Lançamento pertence a um usuário e a uma categoria.