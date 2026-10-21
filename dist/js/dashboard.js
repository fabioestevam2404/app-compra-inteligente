// Dashboard: gasto por categoria e comparação demonstrativa da cesta por mercado.
const Dashboard = (() => {
  // Função pura para facilitar testes: recebe os itens e devolve os indicadores.
  function calcular(itens) {
    const ativos = itens.filter((i) => i.quantidade > 0);
    const somaCategoria = {};
    let totalReferencia = 0;
    for (const i of ativos) {
      const valor = i.quantidade * i.precoRef;
      somaCategoria[i.categoria] = (somaCategoria[i.categoria] || 0) + valor;
      totalReferencia += valor;
    }

    const categorias = Object.entries(somaCategoria)
      .map(([nome, total]) => ({ nome, total, participacao: totalReferencia ? total / totalReferencia : 0 }))
      .sort((a, b) => b.total - a.total);

    const mercados = Dados.MERCADOS_DEMO.map((m) => ({
      id: m.id,
      nome: m.nome,
      total: ativos.reduce((s, i) => s + i.quantidade * Dados.precoDemo(i, m), 0),
    })).sort((a, b) => a.total - b.total);

    const menor = mercados[0]?.total || 0;
    for (const m of mercados) m.diferenca = menor > 0 ? (m.total - menor) / menor : 0;

    return { quantidadeItens: ativos.length, totalReferencia, categorias, mercados };
  }

  function render(itens) {
    const r = calcular(itens);
    const resumo = document.getElementById('dash-resumo');
    const cats = document.getElementById('dash-categorias');
    const merc = document.getElementById('dash-mercados');

    if (!r.quantidadeItens) {
      resumo.innerHTML = '';
      cats.innerHTML = merc.innerHTML = '<p class="vazio">Adicione itens à lista para ver os indicadores.</p>';
      return;
    }

    const topo = r.categorias[0];
    const melhor = r.mercados[0];
    const pior = r.mercados[r.mercados.length - 1];
    resumo.innerHTML = `
      <div class="card"><span class="card-rotulo">Itens na lista</span><strong>${r.quantidadeItens}</strong></div>
      <div class="card"><span class="card-rotulo">Total de referência</span><strong>${Util.brl(r.totalReferencia)}</strong></div>
      <div class="card"><span class="card-rotulo">Categoria com maior gasto</span><strong>${Util.esc(topo.nome)}</strong><small>${Util.pct(topo.participacao)} do total</small></div>
      <div class="card"><span class="card-rotulo">Menor cesta (demo)</span><strong>${Util.esc(melhor.nome)}</strong><small>Economia de ${Util.brl(pior.total - melhor.total)} vs. a mais cara</small></div>`;

    cats.innerHTML = `<ul class="barras">${r.categorias
      .map(
        (c) => `
        <li>
          <div class="barra-rotulo"><span>${Util.esc(c.nome)}</span><span>${Util.brl(c.total)} · ${Util.pct(c.participacao)}</span></div>
          <div class="barra" aria-hidden="true"><span style="width:${(c.participacao * 100).toFixed(1)}%"></span></div>
        </li>`
      )
      .join('')}</ul>`;

    merc.innerHTML = `
      <table class="tabela">
        <thead><tr><th>Mercado</th><th class="num">Total</th><th class="num">Diferença</th></tr></thead>
        <tbody>${r.mercados
          .map(
            (m, idx) => `
            <tr${idx === 0 ? ' class="destaque"' : ''}>
              <td>${Util.esc(m.nome)}</td>
              <td class="num">${Util.brl(m.total)}</td>
              <td class="num">${idx === 0 ? 'Menor cesta' : '+' + Util.pct(m.diferenca)}</td>
            </tr>`
          )
          .join('')}</tbody>
      </table>`;
  }

  function iniciar() {
    Lista.aoMudar(render);
    render(Lista.todos());
  }

  return { iniciar, calcular };
})();
