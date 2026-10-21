// Carrega os scripts de produção (dist/js) num contexto isolado, como o navegador faria,
// com localStorage e fetch falsos. Não há DOM: só as regras exportadas são testadas.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const PASTA_JS = path.join(__dirname, '..', '..', 'dist', 'js');
const GLOBAIS = {
  util: 'Util',
  storage: 'Store',
  data: 'Dados',
  lista: 'Lista',
  dashboard: 'Dashboard',
  localizador: 'Localizador',
  historico: 'Historico',
  conferencia: 'Conferencia',
};
const TODOS = Object.keys(GLOBAIS);

function criarArmazenamento(inicial = {}) {
  const dados = { ...inicial };
  return {
    dados,
    getItem: (k) => (k in dados ? dados[k] : null),
    setItem: (k, v) => {
      dados[k] = String(v);
    },
    removeItem: (k) => {
      delete dados[k];
    },
  };
}

// `semente` grava valores iniciais já com o prefixo do app: { lista: [] } -> "compracerta:lista".
function carregar({ modulos = TODOS, armazenamento, semente = {}, fetch } = {}) {
  const localStorage = armazenamento || criarArmazenamento();
  for (const [chave, valor] of Object.entries(semente)) localStorage.setItem('compracerta:' + chave, JSON.stringify(valor));

  const ctx = vm.createContext({ console, localStorage, fetch, URLSearchParams });
  for (const m of modulos) {
    const codigo = fs.readFileSync(path.join(PASTA_JS, `${m}.js`), 'utf8');
    vm.runInContext(`${codigo}\n;globalThis.${GLOBAIS[m]} = ${GLOBAIS[m]};`, ctx, { filename: `${m}.js` });
  }
  ctx.localStorage = localStorage;
  return ctx;
}

// Objetos criados no contexto vm têm protótipos de outro "realm"; normaliza para comparar.
const simples = (valor) => JSON.parse(JSON.stringify(valor));

module.exports = { carregar, criarArmazenamento, simples };
