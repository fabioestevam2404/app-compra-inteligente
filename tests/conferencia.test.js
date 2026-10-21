const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, simples } = require('./helpers/ambiente');

const NOTA = `SUPERMERCADO EXEMPLO LTDA
CNPJ 12.345.678/0001-90
21/10/2026 18:42:10
001 7891234567890 ARROZ TIPO 1 5KG 1 UN X 27,90 27,90
002 7890000000001 FEIJ CARIOCA 1KG 2 UN X 8,49 16,98
003 LEITE INTEGRAL 1L 6 UN X 5,29 31,74
004 CHOCOLATE BARRA 1 UN X 6,99 6,99
SUBTOTAL 83,61
DESCONTO 1,00
TOTAL R$ 82,61
CARTAO DEBITO 82,61
Tributos aprox Lei 12741 15,20`;

const item = (id, nome, quantidade = 1) => ({ id, nome, quantidade });
const LISTA = [
  item('arroz', 'Arroz branco 5 kg'),
  item('feijao', 'Feijão carioca 1 kg', 2),
  item('leite', 'Leite integral 1 L', 6),
  item('cafe', 'Café torrado 500 g'),
];

const { Conferencia } = carregar();
const interpretar = (texto) => simples(Conferencia.interpretarNota(texto));

test('CA-CNF-04 propõe mercado, data e total (último "total", ignorando subtotal)', () => {
  const d = interpretar(NOTA);
  assert.equal(d.mercado, 'SUPERMERCADO EXEMPLO LTDA');
  assert.equal(d.data, '2026-10-21');
  assert.equal(d.total, 82.61);
});

test('CA-CNF-04 mercado ignora linha de CNPJ; data com ano de 2 dígitos', () => {
  const d = interpretar('CNPJ 12.345.678/0001-90\nMercado Bom Preço\nEmissão 05/03/26\nPAO FRANCES 4,50');
  assert.equal(d.mercado, 'Mercado Bom Preço');
  assert.equal(d.data, '2026-03-05');
});

test('CA-CNF-05 extrai linhas de item, sem número, código de barras e "QTD UN X VALOR"', () => {
  const d = interpretar(NOTA);
  assert.deepEqual(d.itens, [
    { descricao: 'ARROZ TIPO 1 5KG', valor: 27.9 },
    { descricao: 'FEIJ CARIOCA 1KG', valor: 16.98 },
    { descricao: 'LEITE INTEGRAL 1L', valor: 31.74 },
    { descricao: 'CHOCOLATE BARRA', valor: 6.99 },
  ]);
});

test('CA-CNF-05 ignora subtotal, desconto, pagamento, troco e tributos', () => {
  const d = interpretar('ARROZ 10,00\nSUBTOTAL 10,00\nDESCONTO 1,00\nACRESCIMO 0,50\nDINHEIRO 20,00\nTROCO 10,50\nPIX 9,50\nTRIBUTOS 1,20');
  assert.deepEqual(d.itens.map((i) => i.descricao), ['ARROZ']);
});

test('CA-CNF-06 sem total na nota, o total proposto é a soma das linhas', () => {
  const d = interpretar('ARROZ 10,00\nFEIJAO 8,49\nLEITE 1.234,50');
  assert.equal(d.total, 1252.99);
});

test('CA-CNF-07 associa por produto principal, aceitando abreviações', () => {
  assert.equal(Conferencia.associar('ARROZ TIPO 1 5KG', LISTA), 'arroz');
  assert.equal(Conferencia.associar('FEIJ CARIOCA 1KG', LISTA), 'feijao');
  assert.equal(Conferencia.associar('LEITE INTEGRAL 1L', LISTA), 'leite');
});

test('CA-CNF-07 sem o produto principal ou com menos da metade das palavras vira extra', () => {
  assert.equal(Conferencia.associar('CHOCOLATE BARRA', LISTA), null);
  assert.equal(Conferencia.associar('CARIOCA PREMIUM', LISTA), null); // falta "feijão"
  assert.equal(Conferencia.associar('CAFE', [item('c', 'Café torrado extra forte')]), null); // 1 de 4 palavras
});

test('CA-CNF-09 resumo com identificados, faltantes e extras', () => {
  const linhas = [
    { descricao: 'ARROZ', valor: 27.9, itemId: 'arroz' },
    { descricao: 'LEITE', valor: 31.74, itemId: 'leite' },
    { descricao: 'CHOCOLATE', valor: 6.99, itemId: null },
    { descricao: '   ', valor: 0, itemId: null },
  ];
  assert.deepEqual(simples(Conferencia.resultado(linhas, LISTA)), {
    identificados: ['Arroz branco 5 kg', 'Leite integral 1 L'],
    faltantes: ['Feijão carioca 1 kg', 'Café torrado 500 g'],
    extras: [{ descricao: 'CHOCOLATE', valor: 6.99 }],
  });
});

test('CA-LST-10 item zerado não entra na conferência', () => {
  const r = simples(Conferencia.resultado([], [...LISTA, item('ovo', 'Ovos brancos', 0)]));
  assert.ok(!r.faltantes.includes('Ovos brancos'));
});

test('CA-CNF-14 linha associada a item removido da lista vira extra (DEF-02)', () => {
  const linhas = [{ descricao: 'ARROZ', valor: 27.9, itemId: 'removido' }];
  const r = simples(Conferencia.resultado(linhas, LISTA));
  assert.deepEqual(r.extras, [{ descricao: 'ARROZ', valor: 27.9 }]);
});

test('CA-CNF-15 conferência verifica só presença, não quantidade', () => {
  // A lista pede 6 leites; uma única linha basta para "identificado".
  const r = simples(Conferencia.resultado([{ descricao: 'LEITE', valor: 5.29, itemId: 'leite' }], LISTA));
  assert.ok(r.identificados.includes('Leite integral 1 L'));
});

test('CA-CNF-11 mercado vazio impede salvar (DIV-02)', () => {
  const p = Conferencia.validarRegistro({ mercado: '  ', data: '2026-10-21', total: '10,00' });
  assert.equal(p?.campo, 'conf-mercado');
});

test('CA-CNF-11 data vazia ou total vazio/inválido/negativo impedem salvar', () => {
  const ok = { mercado: 'Mercado', data: '2026-10-21', total: '154,90' };
  assert.equal(Conferencia.validarRegistro(ok), null);
  assert.equal(Conferencia.validarRegistro({ ...ok, data: '' })?.campo, 'conf-data');
  assert.equal(Conferencia.validarRegistro({ ...ok, total: '' })?.campo, 'conf-total');
  assert.equal(Conferencia.validarRegistro({ ...ok, total: 'abc' })?.campo, 'conf-total');
  assert.equal(Conferencia.validarRegistro({ ...ok, total: '-5' })?.campo, 'conf-total');
});

test('CA-CNF-11 o primeiro campo com problema, na ordem do formulário, recebe o foco', () => {
  assert.equal(Conferencia.validarRegistro({ mercado: '', data: '', total: '' })?.campo, 'conf-mercado');
});
