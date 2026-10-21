const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar, criarArmazenamento, simples } = require('./helpers/ambiente');

const ORIGEM = { lat: -23.5667, lon: -46.693 };
// Aproximadamente 0,009° de latitude ≈ 1 km.
const el = (id, km, tags) => ({ type: 'node', id, lat: ORIGEM.lat + km * 0.009, lon: ORIGEM.lon, tags });

test('CA-LOC-02 termo com menos de 3 caracteres é inválido', () => {
  const { Localizador } = carregar();
  assert.equal(Localizador.termoValido('ab'), false);
  assert.equal(Localizador.termoValido('  a  '), false);
  assert.equal(Localizador.termoValido('Sé '), false);
  assert.equal(Localizador.termoValido('Moema'), true);
});

test('CA-LOC-03 só dígitos, espaços, ponto e hífen com 8 dígitos é CEP', () => {
  const { Localizador } = carregar();
  assert.equal(Localizador.ehCep('01310-100'), true);
  assert.equal(Localizador.ehCep('01310100'), true);
  assert.equal(Localizador.ehCep('01.310-100'), true);
  assert.equal(Localizador.ehCep('0131010'), false);
  assert.equal(Localizador.ehCep('Rua 01310-100'), false);
});

test('CA-LOC-01 no máximo 4 resultados, todos dentro do raio', () => {
  const { Localizador } = carregar();
  const elementos = [1, 2, 3, 4, 5, 6].map((n) => el(n, n * 0.4, { shop: 'supermarket', name: `M${n}` }));
  elementos.push(el(99, 3, { shop: 'supermarket', name: 'Longe' }));
  const r = simples(Localizador.selecionarResultados(elementos, ORIGEM.lat, ORIGEM.lon, 2));
  assert.equal(r.length, 4);
  assert.ok(r.every((e) => e.distanciaKm <= 2));
});

test('CA-LOC-04 distância em m abaixo de 1 km e em km acima', () => {
  const { Localizador } = carregar();
  assert.equal(Localizador.distanciaTexto(0.35), '350 m');
  assert.equal(Localizador.distanciaTexto(1.26), '1,3 km');
});

test('CA-LOC-04 resultado traz tipo, endereço, horário e coordenadas; sem nome usa o tipo', () => {
  const { Localizador } = carregar();
  const [e] = simples(
    Localizador.selecionarResultados(
      [el(1, 0.5, { shop: 'greengrocer', 'addr:street': 'Rua A', 'addr:housenumber': '10', opening_hours: 'Mo-Sa 08:00-20:00' })],
      ORIGEM.lat,
      ORIGEM.lon,
      1
    )
  );
  assert.equal(e.nome, '');
  assert.equal(e.tipo, 'Hortifrúti');
  assert.equal(e.endereco, 'Rua A, 10');
  assert.equal(e.horario, 'Mo-Sa 08:00-20:00');
  assert.ok(Number.isFinite(e.lat) && Number.isFinite(e.lon));
});

test('CA-LOC-05 prioriza com nome, depois supermercado/atacado; exibe por distância', () => {
  const { Localizador } = carregar();
  const elementos = [
    el(1, 0.1, { shop: 'supermarket' }), // sem nome, mais perto de todos
    el(2, 0.2, { shop: 'convenience', name: 'Conveniência' }),
    el(3, 0.3, { shop: 'bakery', name: 'Padaria' }),
    el(4, 0.9, { shop: 'supermarket', name: 'Super' }),
    el(5, 1.0, { shop: 'wholesale', name: 'Atacado' }),
    el(6, 0.5, { shop: 'greengrocer', name: 'Hortifruti' }),
  ];
  const r = simples(Localizador.selecionarResultados(elementos, ORIGEM.lat, ORIGEM.lon, 5));
  // Com nome: Conveniência, Padaria, Hortifruti, Super, Atacado. Super e Atacado têm prioridade;
  // as 2 vagas restantes vão para os mais próximos (Conveniência 0,2 km e Padaria 0,3 km).
  assert.deepEqual(r.map((e) => e.nome), ['Conveniência', 'Padaria', 'Super', 'Atacado']);
});

test('CA-LOC-10 pesquisa repetida em até 24 h usa o cache; depois disso consulta de novo', async () => {
  let chamadas = 0;
  const fetch = async () => {
    chamadas++;
    return { ok: true, json: async () => ({ elements: [el(1, 0.5, { shop: 'supermarket', name: 'Super' })] }) };
  };
  const armazenamento = criarArmazenamento();
  const { Localizador } = carregar({ armazenamento, fetch });

  await Localizador.buscarEstabelecimentos(ORIGEM.lat, ORIGEM.lon, 2);
  const segunda = simples(await Localizador.buscarEstabelecimentos(ORIGEM.lat, ORIGEM.lon, 2));
  assert.equal(chamadas, 1);
  assert.equal(segunda[0].nome, 'Super');

  const chave = 'compracerta:cache-localizador';
  const cache = JSON.parse(armazenamento.getItem(chave));
  for (const k of Object.keys(cache)) cache[k].em -= 25 * 60 * 60 * 1000;
  armazenamento.setItem(chave, JSON.stringify(cache));

  await Localizador.buscarEstabelecimentos(ORIGEM.lat, ORIGEM.lon, 2);
  assert.equal(chamadas, 2);
});

const PRINCIPAL = 'overpass-api.de';
const resposta = (elements) => ({ ok: true, json: async () => ({ elements }) });
const UM_MERCADO = [el(1, 0.5, { shop: 'supermarket', name: 'Super' })];

test('CA-LOC-13 principal responde com erro: usa o alternativo e avisa a troca', async () => {
  const urls = [];
  const fetch = async (url) => {
    urls.push(url);
    return url.includes(PRINCIPAL) ? { ok: false, status: 504 } : resposta(UM_MERCADO);
  };
  const { Localizador } = carregar({ fetch });
  let trocas = 0;
  const r = simples(await Localizador.buscarEstabelecimentos(ORIGEM.lat, ORIGEM.lon, 2, () => trocas++));
  assert.equal(urls.length, 2);
  assert.ok(urls[0].includes(PRINCIPAL));
  assert.ok(!urls[1].includes(PRINCIPAL));
  assert.equal(trocas, 1);
  assert.equal(r[0].nome, 'Super');
});

test('CA-LOC-13 principal sem resposta em 20 s: cancela e usa o alternativo', async () => {
  const timers = [];
  const setTimeoutFalso = (fn, ms) => timers.push({ fn, ms });
  const fetch = (url, { signal }) => {
    if (!url.includes(PRINCIPAL)) return Promise.resolve(resposta(UM_MERCADO));
    return new Promise((_, rejeitar) =>
      signal.addEventListener('abort', () => rejeitar(Object.assign(new Error('aborted'), { name: 'AbortError' })))
    );
  };
  const { Localizador } = carregar({ fetch, setTimeout: setTimeoutFalso });
  const busca = Localizador.buscarEstabelecimentos(ORIGEM.lat, ORIGEM.lon, 2, () => {});
  await new Promise((r) => setImmediate(r));
  assert.equal(timers[0].ms, 20000);
  timers[0].fn(); // esgota o tempo do principal
  const r = simples(await busca);
  assert.equal(r[0].nome, 'Super');
});

test('CA-LOC-13 todos os servidores falham: a busca falha (mensagem de CA-LOC-09)', async () => {
  const { Localizador } = carregar({ fetch: async () => ({ ok: false, status: 504 }) });
  await assert.rejects(Localizador.buscarEstabelecimentos(ORIGEM.lat, ORIGEM.lon, 2, () => {}), /504/);
});

test('CA-LOC-13 principal funcionando: não consulta o alternativo', async () => {
  const urls = [];
  const { Localizador } = carregar({ fetch: async (url) => (urls.push(url), resposta(UM_MERCADO)) });
  let trocas = 0;
  await Localizador.buscarEstabelecimentos(ORIGEM.lat, ORIGEM.lon, 1, () => trocas++);
  assert.equal(urls.length, 1);
  assert.equal(trocas, 0);
});

test('CA-LOC-14 raio padrão de 2 km; raio salvo fora de 1 e 2 km volta para 2', () => {
  const { Localizador } = carregar();
  assert.equal(Localizador.raioInicial(undefined), 2);
  assert.equal(Localizador.raioInicial(1), 1);
  assert.equal(Localizador.raioInicial('1'), 1);
  assert.equal(Localizador.raioInicial(2), 2);
  assert.equal(Localizador.raioInicial(5), 2);
  assert.equal(Localizador.raioInicial(10), 2);
});

test('CA-LOC-10 geocodificação repetida usa o cache', async () => {
  let chamadas = 0;
  const fetch = async () => {
    chamadas++;
    return { ok: true, json: async () => [{ lat: '-23.5', lon: '-46.6', display_name: 'Pinheiros' }] };
  };
  const { Localizador } = carregar({ fetch });
  await Localizador.geocodificar('Pinheiros, São Paulo');
  await Localizador.geocodificar('pinheiros sao paulo');
  assert.equal(chamadas, 1);
});
