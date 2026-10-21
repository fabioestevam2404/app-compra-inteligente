// Histórico de compras salvo localmente.
const Historico = (() => {
  const CHAVE = 'historico';
  let registros = Store.get(CHAVE, []);
  const ouvintes = [];

  function salvar() {
    Store.set(CHAVE, registros);
    ouvintes.forEach((f) => f());
  }

  function todos() {
    return registros.map((r) => ({ ...r }));
  }

  function adicionar(registro) {
    registros.push({ id: Util.uid(), salvoEm: new Date().toISOString(), ...registro });
    salvar();
  }

  function remover(id) {
    registros = registros.filter((r) => r.id !== id);
    salvar();
  }

  // Mais recente primeiro pela data da compra; no mesmo dia, o salvo por último primeiro.
  function ordenar(lista) {
    return lista.slice().sort((a, b) => (b.data || '').localeCompare(a.data || '') || b.salvoEm.localeCompare(a.salvoEm));
  }

  function resumo(lista) {
    const total = lista.reduce((s, r) => s + (r.total || 0), 0);
    return { quantidade: lista.length, total, media: lista.length ? total / lista.length : 0 };
  }

  function listaNomes(nomes) {
    return nomes.length ? nomes.map((n) => `<li>${Util.esc(n)}</li>`).join('') : '<li class="nota">Nenhum</li>';
  }

  function render() {
    const elResumo = document.getElementById('hist-resumo');
    const lista = document.getElementById('hist-lista');
    if (!registros.length) {
      elResumo.innerHTML = '';
      lista.innerHTML = '<p class="vazio">Nenhuma compra registrada. Use “Conferir compra” ao sair do mercado.</p>';
      return;
    }

    const r = resumo(registros);
    elResumo.innerHTML = `
      <div class="card"><span class="card-rotulo">Compras registradas</span><strong>${r.quantidade}</strong></div>
      <div class="card"><span class="card-rotulo">Total pago</span><strong>${Util.brl(r.total)}</strong></div>
      <div class="card"><span class="card-rotulo">Média por compra</span><strong>${Util.brl(r.media)}</strong></div>`;

    lista.innerHTML = ordenar(registros)
      .map((r) => {
        const c = r.conferencia || { identificados: [], faltantes: [], extras: [] };
        return `
          <article class="cartao registro">
            <header class="registro-topo">
              <div>
                <h3>${Util.esc(r.mercado || 'Mercado não informado')}</h3>
                <p class="meta">${Util.dataBR(r.data)}</p>
              </div>
              <strong class="registro-total">${Util.brl(r.total)}</strong>
            </header>
            <p class="chips">
              <span class="chip ok">${c.identificados.length} identificado(s)</span>
              <span class="chip alerta">${c.faltantes.length} fora da compra</span>
              <span class="chip">${c.extras.length} extra(s)</span>
            </p>
            <details>
              <summary>Ver conferência</summary>
              <div class="grade-3">
                <div><h4>Identificados</h4><ul>${listaNomes(c.identificados)}</ul></div>
                <div><h4>Ficaram de fora</h4><ul>${listaNomes(c.faltantes)}</ul></div>
                <div><h4>Extras</h4><ul>${listaNomes(c.extras.map((e) => `${e.descricao} — ${Util.brl(e.valor)}`))}</ul></div>
              </div>
            </details>
            <button type="button" class="btn btn-link perigo" data-remover="${Util.esc(r.id)}">Excluir registro</button>
          </article>`;
      })
      .join('');
  }

  function iniciar() {
    document.getElementById('hist-lista').addEventListener('click', (e) => {
      const id = e.target.closest('[data-remover]')?.dataset.remover;
      if (id && confirm('Excluir este registro do histórico?')) remover(id);
    });
    ouvintes.push(render);
    render();
  }

  return { iniciar, adicionar, remover, todos, ordenar, resumo };
})();
