const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, criarArmazenamento, simples } = require('./helpers/ambiente');

const registro = (mercado, data, total, salvoEm) => ({ id: mercado, mercado, data, total, salvoEm });

test('CA-HST-01 mais recente primeiro; no mesmo dia, o salvo por último primeiro', () => {
  const { Historico } = carregar();
  const ordem = simples(
    Historico.ordenar([
      registro('A', '2026-10-01', 10, '2026-10-01T10:00:00Z'),
      registro('B', '2026-10-20', 10, '2026-10-20T09:00:00Z'),
      registro('C', '2026-10-20', 10, '2026-10-20T18:00:00Z'),
      registro('D', '2026-09-15', 10, '2026-10-21T08:00:00Z'),
    ])
  ).map((r) => r.mercado);
  assert.deepEqual(ordem, ['C', 'B', 'A', 'D']);
});

test('CA-HST-02 quantidade de compras, total pago e média', () => {
  const { Historico } = carregar();
  const r = simples(Historico.resumo([registro('A', '2026-10-01', 100), registro('B', '2026-10-02', 50.5)]));
  assert.deepEqual(r, { quantidade: 2, total: 150.5, media: 75.25 });
  assert.deepEqual(simples(Historico.resumo([])), { quantidade: 0, total: 0, media: 0 });
});

test('CA-HST-04 excluir remove o registro e os totais são recalculados', () => {
  const { Historico } = carregar();
  Historico.adicionar({ mercado: 'A', data: '2026-10-01', total: 100 });
  Historico.adicionar({ mercado: 'B', data: '2026-10-02', total: 40 });
  const [a] = simples(Historico.todos());
  Historico.remover(a.id);
  assert.deepEqual(simples(Historico.resumo(Historico.todos())), { quantidade: 1, total: 40, media: 40 });
});

test('CA-HST-05 histórico persiste ao reabrir o app', () => {
  const armazenamento = criarArmazenamento();
  carregar({ armazenamento }).Historico.adicionar({ mercado: 'A', data: '2026-10-01', total: 100 });
  const reaberto = carregar({ armazenamento });
  assert.deepEqual(simples(reaberto.Historico.todos()).map((r) => [r.mercado, r.total]), [['A', 100]]);
});
