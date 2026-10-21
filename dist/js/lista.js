// Lista de compras: estado, persistência e renderização.
const Lista = (() => {
  const CHAVE = 'lista';
  const PASSO = { kg: 0.5, g: 100, ml: 100 };
  let itens = Store.get(CHAVE, []);
  const ouvintes = [];

  function salvar() {
    Store.set(CHAVE, itens);
    ouvintes.forEach((f) => f(todos()));
  }

  function todos() {
    return itens.map((i) => ({ ...i }));
  }

  function aoMudar(fn) {
    ouvintes.push(fn);
  }

  function adicionar({ nome, categoria, quantidade, unidade }) {
    nome = nome.trim();
    if (!nome || !(quantidade > 0)) return null;

    const doCatalogo = Dados.buscarCatalogo(nome);
    const un = unidade || doCatalogo?.unidade || 'un';

    // Soma só com mesmo nome e mesma unidade; unidade diferente vira outro item, sem conversão.
    const existente = itens.find((i) => Util.normalizar(i.nome) === Util.normalizar(nome) && i.unidade === un);
    if (existente) {
      existente.quantidade = Util.arredondar(existente.quantidade + quantidade, 3);
      salvar();
      return existente;
    }

    const cat = categoria || doCatalogo?.categoria || 'Outros';
    const item = {
      id: Util.uid(),
      nome: doCatalogo?.nome || nome,
      categoria: cat,
      quantidade: Util.arredondar(quantidade, 3),
      unidade: un,
      precoRef: doCatalogo ? doCatalogo.preco : Dados.precoPadrao(cat),
    };
    itens.push(item);
    salvar();
    return item;
  }

  function atualizar(id, campos) {
    const item = itens.find((i) => i.id === id);
    if (!item) return;
    Object.assign(item, campos);
    salvar();
  }

  function remover(id) {
    itens = itens.filter((i) => i.id !== id);
    salvar();
  }

  // Agrupa na ordem fixa das categorias; categoria desconhecida cai em "Outros".
  function agrupar(lista) {
    const grupos = {};
    for (const i of lista) {
      const cat = Dados.CATEGORIAS.includes(i.categoria) ? i.categoria : 'Outros';
      (grupos[cat] ||= []).push(i);
    }
    return Dados.CATEGORIAS.filter((c) => grupos[c]).map((c) => [c, grupos[c]]);
  }

  function proximaQuantidade(item, acao) {
    const passo = PASSO[item.unidade] || 1;
    const nova = acao === 'mais' ? item.quantidade + passo : Math.max(0, item.quantidade - passo);
    return Util.arredondar(nova, 3);
  }

  function normalizarQuantidade(valor) {
    const q = Number(valor);
    return Number.isFinite(q) && q >= 0 ? Util.arredondar(q, 3) : 0;
  }

  // ---- Interface ----

  function linhaItem(i) {
    const nome = Util.esc(i.nome);
    const opcoes = Dados.UNIDADES.map(
      (u) => `<option value="${u}"${u === i.unidade ? ' selected' : ''}>${u}</option>`
    ).join('');
    return `
      <li class="item" data-id="${Util.esc(i.id)}">
        <span class="item-nome">${nome}</span>
        <div class="item-controles">
          <button type="button" class="btn-icone" data-acao="menos" aria-label="Diminuir ${nome}">−</button>
          <input type="number" class="item-qtd" min="0" step="any" value="${i.quantidade}" aria-label="Quantidade de ${nome}">
          <button type="button" class="btn-icone" data-acao="mais" aria-label="Aumentar ${nome}">+</button>
          <select class="item-unidade" aria-label="Unidade de ${nome}">${opcoes}</select>
          <button type="button" class="btn-icone perigo" data-acao="remover" aria-label="Remover ${nome}">×</button>
        </div>
      </li>`;
  }

  function render() {
    const el = document.getElementById('lista-itens');
    if (!itens.length) {
      el.innerHTML = '<p class="vazio">Sua lista está vazia. Adicione o primeiro item acima.</p>';
      return;
    }
    el.innerHTML = agrupar(itens)
      .map(
        ([c, grupo]) => `
        <section class="cartao grupo">
          <h3>${Util.esc(c)} <span class="contagem">${grupo.length}</span></h3>
          <ul class="itens">${grupo.map(linhaItem).join('')}</ul>
        </section>`
      )
      .join('');
  }

  function iniciar() {
    const selCategoria = document.getElementById('item-categoria');
    const selUnidade = document.getElementById('item-unidade');
    selCategoria.insertAdjacentHTML('beforeend', Dados.CATEGORIAS.map((c) => `<option>${Util.esc(c)}</option>`).join(''));
    selUnidade.insertAdjacentHTML('beforeend', Dados.UNIDADES.map((u) => `<option>${u}</option>`).join(''));
    document.getElementById('catalogo-produtos').innerHTML = Dados.CATALOGO.map(
      (p) => `<option value="${Util.esc(p.nome)}"></option>`
    ).join('');

    const form = document.getElementById('form-item');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = adicionar({
        nome: form.nome.value,
        categoria: form.categoria.value,
        quantidade: Number(form.quantidade.value),
        unidade: form.unidade.value,
      });
      if (ok) {
        form.reset();
        form.nome.focus();
      }
    });

    const lista = document.getElementById('lista-itens');
    lista.addEventListener('click', (e) => {
      const botao = e.target.closest('[data-acao]');
      if (!botao) return;
      const id = botao.closest('.item').dataset.id;
      const item = itens.find((i) => i.id === id);
      if (!item) return;
      const acao = botao.dataset.acao;
      if (acao === 'remover') {
        remover(id);
        return;
      }
      atualizar(id, { quantidade: proximaQuantidade(item, acao) });
      lista.querySelector(`[data-id="${CSS.escape(id)}"] [data-acao="${acao}"]`)?.focus();
    });

    lista.addEventListener('change', (e) => {
      const li = e.target.closest('.item');
      if (!li) return;
      if (e.target.classList.contains('item-qtd')) {
        atualizar(li.dataset.id, { quantidade: normalizarQuantidade(e.target.value) });
      } else if (e.target.classList.contains('item-unidade')) {
        atualizar(li.dataset.id, { unidade: e.target.value });
      }
    });

    aoMudar(render);
    render();
  }

  return { iniciar, todos, aoMudar, adicionar, atualizar, remover, agrupar, proximaQuantidade, normalizarQuantidade };
})();
