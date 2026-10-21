// Persistência local. Se o localStorage estiver indisponível (modo privado, bloqueio),
// os dados ficam apenas em memória durante a sessão.
const Store = (() => {
  const PREFIXO = 'compracerta:';
  const memoria = new Map();
  let disponivel = true;

  try {
    const teste = PREFIXO + '__teste';
    localStorage.setItem(teste, '1');
    localStorage.removeItem(teste);
  } catch {
    disponivel = false;
  }

  function get(chave, padrao) {
    try {
      const bruto = disponivel ? localStorage.getItem(PREFIXO + chave) : memoria.get(chave);
      return bruto == null ? padrao : JSON.parse(bruto);
    } catch {
      return padrao;
    }
  }

  function set(chave, valor) {
    const bruto = JSON.stringify(valor);
    try {
      if (disponivel) localStorage.setItem(PREFIXO + chave, bruto);
      else memoria.set(chave, bruto);
      return true;
    } catch {
      memoria.set(chave, bruto);
      return false;
    }
  }

  return { get, set, disponivel: () => disponivel };
})();
