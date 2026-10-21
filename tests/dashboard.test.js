const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, simples } = require('./helpers/ambiente');

const item = (nome, categoria, quantidade, precoRef) => ({ id: nome, nome, categoria, quantidade, unidade: 'un', precoRef });
const ITENS = [
  item('Arroz', 'Mercearia', 3, 10),
  item('Feijão', 'Mercearia', 1, 8),
  item('Leite', 'Laticínios e frios', 6, 5),
  item('Sabonete', 'Higiene', 4, 2),
  item('Zerado', 'Bebidas', 0, 100),
];

const calcular = (itens) => simples(carregar().Dashboard.calcular(itens));

test('CA-DSH-02 nº de itens e total de referência = Σ quantidade × preço', () => {
  const r = calcular(ITENS);
  assert.equal(r.quantidadeItens, 4);
  assert.equal(r.totalReferencia, 3 * 10 + 8 + 6 * 5 + 4 * 2); // 76
});

test('CA-LST-10 item zerado não entra no dashboard', () => {
  const r = calcular(ITENS);
  assert.ok(!r.categorias.some((c) => c.nome === 'Bebidas'));
});

test('CA-DSH-03 categoria com maior gasto e sua participação', () => {
  const [topo] = calcular(ITENS).categorias;
  assert.equal(topo.nome, 'Mercearia');
  assert.ok(Math.abs(topo.participacao - 38 / 76) < 1e-9);
});

test('CA-DSH-04 categorias da maior para a menor, participações somam 100%', () => {
  const { categorias } = calcular(ITENS);
  assert.deepEqual(
    categorias.map((c) => [c.nome, c.total]),
    [
      ['Mercearia', 38],
      ['Laticínios e frios', 30],
      ['Higiene', 8],
    ]
  );
  const soma = categorias.reduce((s, c) => s + c.participacao, 0);
  assert.ok(Math.abs(soma - 1) < 1e-9);
});

test('CA-DSH-05 mercados do menor para o maior com diferença % sobre o menor', () => {
  const { mercados } = calcular(ITENS);
  assert.equal(mercados.length, 4);
  assert.equal(mercados[0].diferenca, 0);
  for (let i = 1; i < mercados.length; i++) {
    assert.ok(mercados[i - 1].total <= mercados[i].total);
    const esperado = (mercados[i].total - mercados[0].total) / mercados[0].total;
    assert.ok(Math.abs(mercados[i].diferenca - esperado) < 1e-9);
  }
});

test('CA-DSH-06 valores de demonstração são estáveis entre visitas', () => {
  assert.deepEqual(calcular(ITENS), calcular(ITENS));
});

test('CA-DSH-07 lista sem itens com quantidade > 0 não gera indicadores', () => {
  const r = calcular([item('Zerado', 'Bebidas', 0, 10)]);
  assert.equal(r.quantidadeItens, 0);
  assert.equal(r.categorias.length, 0);
});
