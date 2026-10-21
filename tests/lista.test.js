const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, criarArmazenamento, simples } = require('./helpers/ambiente');

// Lista vazia por padrão para isolar cada teste do estado inicial.
const app = (opcoes = {}) => carregar({ semente: { lista: [] }, ...opcoes });

test('CA-LST-01 primeiro acesso começa com a lista vazia', () => {
  const { Lista } = carregar();
  assert.equal(Lista.todos().length, 0);
});

test('CA-LST-02 agrupa na ordem fixa das categorias e omite categorias vazias', () => {
  const { Lista } = app();
  const itens = [
    { nome: 'Sabonete', categoria: 'Higiene' },
    { nome: 'Banana', categoria: 'Hortifrúti' },
    { nome: 'Coisa', categoria: 'Inexistente' },
    { nome: 'Arroz', categoria: 'Mercearia' },
  ];
  const grupos = simples(Lista.agrupar(itens)).map(([cat, lista]) => [cat, lista.map((i) => i.nome)]);
  assert.deepEqual(grupos, [
    ['Hortifrúti', ['Banana']],
    ['Mercearia', ['Arroz']],
    ['Higiene', ['Sabonete']],
    ['Outros', ['Coisa']],
  ]);
});

test('CA-LST-03 produto do catálogo herda nome, categoria e unidade', () => {
  const { Lista } = app();
  Lista.adicionar({ nome: '  arroz BRANCO 5 kg ', categoria: '', quantidade: 1, unidade: '' });
  const [item] = simples(Lista.todos());
  assert.equal(item.nome, 'Arroz branco 5 kg');
  assert.equal(item.categoria, 'Mercearia');
  assert.equal(item.unidade, 'pct');
});

test('CA-LST-04 produto fora do catálogo vai para "Outros" com unidade "un"', () => {
  const { Lista } = app();
  Lista.adicionar({ nome: 'Vela aromática', categoria: '', quantidade: 2, unidade: '' });
  const [item] = simples(Lista.todos());
  assert.equal(item.categoria, 'Outros');
  assert.equal(item.unidade, 'un');
  assert.equal(item.quantidade, 2);
});

test('CA-LST-05 escolha do usuário prevalece sobre o catálogo', () => {
  const { Lista } = app();
  Lista.adicionar({ nome: 'Tomate', categoria: 'Mercearia', quantidade: 3, unidade: 'un' });
  const [item] = simples(Lista.todos());
  assert.equal(item.categoria, 'Mercearia');
  assert.equal(item.unidade, 'un');
});

test('CA-LST-06 mesmo nome e mesma unidade somam a quantidade', () => {
  const { Lista } = app();
  Lista.adicionar({ nome: 'Feijão carioca 1 kg', categoria: '', quantidade: 1, unidade: '' });
  Lista.adicionar({ nome: 'FEIJAO CARIOCA 1 KG', categoria: '', quantidade: 2, unidade: '' });
  const itens = simples(Lista.todos());
  assert.equal(itens.length, 1);
  assert.equal(itens[0].quantidade, 3);
});

test('CA-LST-06 mesmo nome com unidade diferente cria outro item, sem conversão (DEF-01)', () => {
  const { Lista } = app();
  Lista.adicionar({ nome: 'Peito de frango', categoria: '', quantidade: 1, unidade: '' }); // kg
  Lista.adicionar({ nome: 'Peito de frango', categoria: '', quantidade: 500, unidade: 'g' });
  const itens = simples(Lista.todos());
  assert.equal(itens.length, 2);
  assert.deepEqual(
    itens.map((i) => [i.quantidade, i.unidade]),
    [
      [1, 'kg'],
      [500, 'g'],
    ]
  );
});

test('CA-LST-07 nome vazio ou quantidade <= 0 não inclui nada', () => {
  const { Lista } = app();
  assert.equal(Lista.adicionar({ nome: '   ', categoria: '', quantidade: 1, unidade: '' }), null);
  assert.equal(Lista.adicionar({ nome: 'Arroz', categoria: '', quantidade: 0, unidade: '' }), null);
  assert.equal(Lista.adicionar({ nome: 'Arroz', categoria: '', quantidade: -1, unidade: '' }), null);
  assert.equal(Lista.adicionar({ nome: 'Arroz', categoria: '', quantidade: NaN, unidade: '' }), null);
  assert.equal(Lista.todos().length, 0);
});

test('CA-LST-08 passo de +/− por unidade e mínimo 0', () => {
  const { Lista } = app();
  const q = (quantidade, unidade, acao) => Lista.proximaQuantidade({ quantidade, unidade }, acao);
  assert.equal(q(1, 'kg', 'mais'), 1.5);
  assert.equal(q(1, 'kg', 'menos'), 0.5);
  assert.equal(q(200, 'g', 'mais'), 300);
  assert.equal(q(200, 'ml', 'menos'), 100);
  assert.equal(q(2, 'un', 'mais'), 3);
  assert.equal(q(1, 'dz', 'menos'), 0);
  assert.equal(q(0, 'un', 'menos'), 0);
  assert.equal(q(50, 'g', 'menos'), 0);
});

test('CA-LST-09 quantidade digitada inválida ou negativa vira 0', () => {
  const { Lista } = app();
  assert.equal(Lista.normalizarQuantidade('2.5'), 2.5);
  assert.equal(Lista.normalizarQuantidade('1.23456'), 1.235);
  assert.equal(Lista.normalizarQuantidade('-3'), 0);
  assert.equal(Lista.normalizarQuantidade('abc'), 0);
  assert.equal(Lista.normalizarQuantidade(''), 0);
});

test('CA-LST-09 alteração de quantidade e unidade é salva', () => {
  const armazenamento = criarArmazenamento();
  const { Lista } = app({ armazenamento });
  const item = Lista.adicionar({ nome: 'Tomate', categoria: '', quantidade: 1, unidade: '' });
  Lista.atualizar(item.id, { quantidade: 4, unidade: 'un' });
  const [salvo] = JSON.parse(armazenamento.getItem('compracerta:lista'));
  assert.equal(salvo.quantidade, 4);
  assert.equal(salvo.unidade, 'un');
});

test('CA-LST-10 item zerado continua na lista', () => {
  const { Lista } = app();
  const item = Lista.adicionar({ nome: 'Tomate', categoria: '', quantidade: 1, unidade: '' });
  Lista.atualizar(item.id, { quantidade: 0 });
  assert.equal(Lista.todos().length, 1);
});

test('CA-LST-11 remover tira o item da lista', () => {
  const { Lista } = app();
  const a = Lista.adicionar({ nome: 'Tomate', categoria: '', quantidade: 1, unidade: '' });
  Lista.adicionar({ nome: 'Cebola', categoria: '', quantidade: 1, unidade: '' });
  Lista.remover(a.id);
  assert.deepEqual(simples(Lista.todos()).map((i) => i.nome), ['Cebola']);
});

test('CA-LST-12 lista persiste ao reabrir o app', () => {
  const armazenamento = criarArmazenamento();
  carregar({ armazenamento, semente: { lista: [] } }).Lista.adicionar({ nome: 'Tomate', categoria: '', quantidade: 2, unidade: '' });
  const reaberto = carregar({ armazenamento });
  assert.deepEqual(simples(reaberto.Lista.todos()).map((i) => [i.nome, i.quantidade]), [['Tomate', 2]]);
});
