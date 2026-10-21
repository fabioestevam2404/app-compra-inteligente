// Funções utilitárias compartilhadas (formatação, normalização, escape de HTML).
const Util = (() => {
  const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtPct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
  const fmtNum = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });
  const fmtDec = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Remove acentos e pontuação para comparar textos ("Feijão" == "FEIJAO").
  function normalizar(texto) {
    return String(texto ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function esc(texto) {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(texto ?? '').replace(/[&<>"']/g, (c) => mapa[c]);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // Hash FNV-1a: usado para gerar variações de preço determinísticas na demonstração.
  function hash(texto) {
    let h = 2166136261;
    for (const c of String(texto)) {
      h ^= c.codePointAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function arredondar(valor, casas = 2) {
    const f = 10 ** casas;
    return Math.round(valor * f) / f;
  }

  // Aceita "1.234,56", "1234,56" e "1234.56".
  function parseValor(texto) {
    const s = String(texto ?? '').trim().replace(/\s/g, '').replace(/^r\$/i, '');
    if (!s) return NaN;
    if (s.includes(',')) return Number(s.replace(/\./g, '').replace(',', '.'));
    return Number(s);
  }

  function hojeISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function dataBR(iso) {
    if (!iso) return '';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }

  return {
    brl: (v) => fmtBRL.format(v || 0),
    pct: (v) => fmtPct.format(v || 0),
    num: (v) => fmtNum.format(v || 0),
    decimal: (v) => fmtDec.format(v || 0),
    normalizar,
    esc,
    uid,
    hash,
    arredondar,
    parseValor,
    hojeISO,
    dataBR,
  };
})();
