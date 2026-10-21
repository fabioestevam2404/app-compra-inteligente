// Catálogo, lista inicial e mercados de DEMONSTRAÇÃO.
// Nenhum preço aqui representa oferta real.
const Dados = (() => {
  const CATEGORIAS = [
    'Hortifrúti',
    'Açougue e peixaria',
    'Laticínios e frios',
    'Mercearia',
    'Padaria',
    'Bebidas',
    'Limpeza',
    'Higiene',
    'Outros',
  ];

  const UNIDADES = ['un', 'kg', 'g', 'L', 'ml', 'pct', 'cx', 'dz'];

  // Preço de referência por unidade indicada.
  const CATALOGO = [
    { nome: 'Arroz branco 5 kg', categoria: 'Mercearia', unidade: 'pct', preco: 27.9 },
    { nome: 'Feijão carioca 1 kg', categoria: 'Mercearia', unidade: 'pct', preco: 8.49 },
    { nome: 'Café torrado 500 g', categoria: 'Mercearia', unidade: 'pct', preco: 18.9 },
    { nome: 'Açúcar refinado 1 kg', categoria: 'Mercearia', unidade: 'pct', preco: 4.99 },
    { nome: 'Óleo de soja 900 ml', categoria: 'Mercearia', unidade: 'un', preco: 7.49 },
    { nome: 'Macarrão espaguete 500 g', categoria: 'Mercearia', unidade: 'pct', preco: 4.79 },
    { nome: 'Molho de tomate 300 g', categoria: 'Mercearia', unidade: 'un', preco: 3.29 },
    { nome: 'Ovos brancos', categoria: 'Mercearia', unidade: 'dz', preco: 13.9 },
    { nome: 'Leite integral 1 L', categoria: 'Laticínios e frios', unidade: 'L', preco: 5.29 },
    { nome: 'Queijo muçarela', categoria: 'Laticínios e frios', unidade: 'kg', preco: 44.9 },
    { nome: 'Presunto', categoria: 'Laticínios e frios', unidade: 'kg', preco: 34.9 },
    { nome: 'Manteiga 200 g', categoria: 'Laticínios e frios', unidade: 'un', preco: 12.9 },
    { nome: 'Iogurte natural', categoria: 'Laticínios e frios', unidade: 'un', preco: 3.99 },
    { nome: 'Peito de frango', categoria: 'Açougue e peixaria', unidade: 'kg', preco: 18.9 },
    { nome: 'Carne moída', categoria: 'Açougue e peixaria', unidade: 'kg', preco: 36.9 },
    { nome: 'Filé de tilápia', categoria: 'Açougue e peixaria', unidade: 'kg', preco: 49.9 },
    { nome: 'Banana prata', categoria: 'Hortifrúti', unidade: 'kg', preco: 6.49 },
    { nome: 'Maçã', categoria: 'Hortifrúti', unidade: 'kg', preco: 9.99 },
    { nome: 'Tomate', categoria: 'Hortifrúti', unidade: 'kg', preco: 8.99 },
    { nome: 'Batata', categoria: 'Hortifrúti', unidade: 'kg', preco: 5.99 },
    { nome: 'Cebola', categoria: 'Hortifrúti', unidade: 'kg', preco: 4.99 },
    { nome: 'Alface', categoria: 'Hortifrúti', unidade: 'un', preco: 3.49 },
    { nome: 'Pão francês', categoria: 'Padaria', unidade: 'kg', preco: 16.9 },
    { nome: 'Pão de forma', categoria: 'Padaria', unidade: 'pct', preco: 8.99 },
    { nome: 'Água mineral 1,5 L', categoria: 'Bebidas', unidade: 'un', preco: 2.99 },
    { nome: 'Suco de laranja 1 L', categoria: 'Bebidas', unidade: 'un', preco: 9.9 },
    { nome: 'Refrigerante 2 L', categoria: 'Bebidas', unidade: 'un', preco: 8.99 },
    { nome: 'Detergente 500 ml', categoria: 'Limpeza', unidade: 'un', preco: 2.79 },
    { nome: 'Sabão em pó 1,6 kg', categoria: 'Limpeza', unidade: 'cx', preco: 21.9 },
    { nome: 'Água sanitária 2 L', categoria: 'Limpeza', unidade: 'un', preco: 6.49 },
    { nome: 'Papel higiênico 12 rolos', categoria: 'Higiene', unidade: 'pct', preco: 19.9 },
    { nome: 'Creme dental 90 g', categoria: 'Higiene', unidade: 'un', preco: 4.49 },
    { nome: 'Sabonete', categoria: 'Higiene', unidade: 'un', preco: 2.49 },
    { nome: 'Xampu 350 ml', categoria: 'Higiene', unidade: 'un', preco: 15.9 },
  ];

  // Usado quando o produto incluído não está no catálogo.
  const PRECO_PADRAO_CATEGORIA = {
    'Hortifrúti': 7.0,
    'Açougue e peixaria': 35.0,
    'Laticínios e frios': 12.0,
    'Mercearia': 9.0,
    'Padaria': 10.0,
    'Bebidas': 7.0,
    'Limpeza': 8.0,
    'Higiene': 9.0,
    'Outros': 10.0,
  };

  const LISTA_INICIAL = [
    ['Arroz branco 5 kg', 1],
    ['Feijão carioca 1 kg', 2],
    ['Café torrado 500 g', 1],
    ['Leite integral 1 L', 6],
    ['Ovos brancos', 1],
    ['Peito de frango', 1.5],
    ['Banana prata', 1],
    ['Tomate', 1],
    ['Pão francês', 0.5],
    ['Detergente 500 ml', 2],
    ['Papel higiênico 12 rolos', 1],
  ];

  // Mercados fictícios do comparador demonstrativo.
  // `fator` desloca o nível geral de preços; cada produto ainda recebe uma variação própria.
  const MERCADOS_DEMO = [
    { id: 'demo-a', nome: 'Mercado Demo A', fator: 1.0 },
    { id: 'demo-b', nome: 'Mercado Demo B', fator: 0.96 },
    { id: 'demo-c', nome: 'Mercado Demo C', fator: 1.06 },
    { id: 'demo-d', nome: 'Atacarejo Demo', fator: 0.91 },
  ];

  const indiceCatalogo = new Map(CATALOGO.map((p) => [Util.normalizar(p.nome), p]));

  function buscarCatalogo(nome) {
    return indiceCatalogo.get(Util.normalizar(nome)) || null;
  }

  function precoPadrao(categoria) {
    return PRECO_PADRAO_CATEGORIA[categoria] ?? PRECO_PADRAO_CATEGORIA.Outros;
  }

  function listaInicial() {
    return LISTA_INICIAL.map(([nome, quantidade]) => {
      const p = buscarCatalogo(nome);
      return { id: Util.uid(), nome: p.nome, categoria: p.categoria, quantidade, unidade: p.unidade, precoRef: p.preco };
    });
  }

  // Preço unitário demonstrativo de um item em um mercado fictício (variação de ±8%).
  function precoDemo(item, mercado) {
    const variacao = ((Util.hash(Util.normalizar(item.nome) + '|' + mercado.id) % 1000) / 1000) * 0.16 - 0.08;
    return Util.arredondar(item.precoRef * mercado.fator * (1 + variacao));
  }

  return {
    CATEGORIAS,
    UNIDADES,
    CATALOGO,
    MERCADOS_DEMO,
    buscarCatalogo,
    precoPadrao,
    listaInicial,
    precoDemo,
  };
})();
