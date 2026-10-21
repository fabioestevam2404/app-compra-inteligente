// Ponto de entrada: inicializa os módulos e controla a navegação por abas.
document.addEventListener('DOMContentLoaded', () => {
  Lista.iniciar();
  Dashboard.iniciar();
  Localizador.iniciar();
  Historico.iniciar();
  Conferencia.iniciar();

  const botoes = [...document.querySelectorAll('[data-aba]')];
  const nomes = botoes.map((b) => b.dataset.aba);

  function abrir(nome, focar = false) {
    if (!nomes.includes(nome)) nome = 'lista';
    for (const b of botoes) {
      const ativo = b.dataset.aba === nome;
      b.setAttribute('aria-selected', String(ativo));
      b.tabIndex = ativo ? 0 : -1;
      if (ativo && focar) b.focus();
    }
    document.querySelectorAll('.aba').forEach((s) => (s.hidden = s.id !== `aba-${nome}`));
    Store.set('aba', nome);
  }

  botoes.forEach((b) => b.addEventListener('click', () => abrir(b.dataset.aba)));

  // Navegação por teclado entre abas (setas, Home, End).
  document.querySelector('.abas').addEventListener('keydown', (e) => {
    const atual = nomes.indexOf(document.activeElement?.dataset.aba);
    if (atual < 0) return;
    const destino = { ArrowRight: atual + 1, ArrowLeft: atual - 1, Home: 0, End: nomes.length - 1 }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    abrir(nomes[(destino + nomes.length) % nomes.length], true);
  });

  document.addEventListener('abrir-aba', (e) => abrir(e.detail));
  abrir(Store.get('aba', 'lista'));
});
