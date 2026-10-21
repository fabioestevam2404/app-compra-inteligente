// Conferência por nota fiscal: OCR no navegador (Tesseract.js), interpretação, associação e registro.
const Conferencia = (() => {
  const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const PALAVRAS_IGNORADAS = new Set(['com', 'sem', 'para', 'tipo', 'und', 'unid', 'cada']);
  const LINHA_NAO_ITEM =
    /\b(subtotal|sub total|troco|desconto|acrescimo|dinheiro|cartao|credito|debito|pix|tributos?|impostos?|lei 12741|cpf|cnpj|qtd|quantidade total|forma de pagamento|valor recebido)\b/;
  const LINHA_TOTAL = /\b(valor total|total a pagar|valor a pagar|valor pago|total)\b/;

  let estado = null; // { mercado, data, total, linhas: [{ id, descricao, valor, itemId }] }
  let carregandoTesseract = null;
  let urlPreview = null;

  // ---- OCR ----

  function carregarTesseract() {
    if (window.Tesseract) return Promise.resolve();
    carregandoTesseract ||= new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = TESSERACT_URL;
      s.onload = resolve;
      s.onerror = () => {
        carregandoTesseract = null;
        reject(new Error('Não foi possível carregar o mecanismo de OCR. Verifique a conexão.'));
      };
      document.head.appendChild(s);
    });
    return carregandoTesseract;
  }

  async function reconhecer(arquivo, aoProgredir) {
    await carregarTesseract();
    const worker = await Tesseract.createWorker('por', 1, {
      logger: (m) => m.status === 'recognizing text' && aoProgredir(m.progress),
    });
    try {
      const { data } = await worker.recognize(arquivo);
      return data.text;
    } finally {
      await worker.terminate();
    }
  }

  // ---- Interpretação do texto (funções puras) ----

  function interpretarNota(texto) {
    const linhas = String(texto).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const precoFinal = /(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})\s*[A-Z]?\s*$/i;
    let data = '';
    let total = null;
    const itens = [];

    const mercado = linhas.find((l) => (l.match(/[a-zà-ú]/gi) || []).length >= 3 && !/cnpj|cpf|\d{2}\.\d{3}\.\d{3}/i.test(l)) || '';

    for (const linha of linhas) {
      if (!data) {
        const d = linha.match(/\b(\d{2})[/.-](\d{2})[/.-](\d{4}|\d{2})\b/);
        if (d && Number(d[1]) <= 31 && Number(d[2]) <= 12) {
          const ano = d[3].length === 2 ? '20' + d[3] : d[3];
          data = `${ano}-${d[2]}-${d[1]}`;
        }
      }

      const p = linha.match(precoFinal);
      if (!p) continue;
      const valor = Util.parseValor(p[1]);
      if (!Number.isFinite(valor)) continue;
      const norm = Util.normalizar(linha);

      if (LINHA_TOTAL.test(norm) && !LINHA_NAO_ITEM.test(norm)) {
        total = valor; // mantém o último "total" encontrado
        continue;
      }
      if (LINHA_NAO_ITEM.test(norm)) continue;

      const descricao = linha
        .slice(0, p.index)
        .replace(/^\d{1,3}\s+/, '') // número do item
        .replace(/^\d{8,14}\s+/, '') // código de barras
        .replace(/\s+\d+(?:[.,]\d+)?\s*(?:un|und|kg|g|l|ml|pc|pct|cx)?\s*[x×*]\s*\d.*$/i, '') // "1 UN X 27,90"
        .replace(/\s+\d+(?:[.,]\d+)?\s*$/, '')
        .trim();
      if ((descricao.match(/[a-zà-ú]/gi) || []).length < 2) continue;
      itens.push({ descricao, valor });
    }

    if (total == null && itens.length) total = Util.arredondar(itens.reduce((s, i) => s + i.valor, 0));
    return { mercado, data, total, itens };
  }

  function tokens(texto) {
    return Util.normalizar(texto)
      .split(' ')
      .filter((t) => t.length >= 3 && !/^\d/.test(t) && !PALAVRAS_IGNORADAS.has(t));
  }

  // Notas costumam abreviar ("FEIJ CARIOCA"), então aceitamos prefixos com ao menos 3 letras.
  function tokenCasa(a, b) {
    if (a === b) return true;
    return Math.min(a.length, b.length) >= 3 && (a.startsWith(b) || b.startsWith(a));
  }

  // Associa a descrição ao item da lista mais parecido. O primeiro termo do item
  // (normalmente o produto: "arroz", "feijão") precisa aparecer na descrição.
  function associar(descricao, itens) {
    const td = tokens(descricao);
    let melhor = null;
    let melhorNota = 0;
    for (const item of itens) {
      const ti = tokens(item.nome);
      if (!ti.length || !td.some((t) => tokenCasa(ti[0], t))) continue;
      const nota = ti.filter((a) => td.some((b) => tokenCasa(a, b))).length / ti.length;
      if (nota > melhorNota) {
        melhorNota = nota;
        melhor = item;
      }
    }
    return melhorNota >= 0.5 ? melhor.id : null;
  }

  // Só itens com quantidade > 0 são conferidos. Linha sem item, ou ligada a um item
  // que não está mais entre os conferíveis (ex.: removido da lista), conta como extra.
  function resultado(linhas, itens) {
    const conferiveis = itens.filter((i) => i.quantidade > 0);
    const ids = new Set(conferiveis.map((i) => i.id));
    const associados = new Set(linhas.map((l) => l.itemId).filter((id) => ids.has(id)));
    return {
      identificados: conferiveis.filter((i) => associados.has(i.id)).map((i) => i.nome),
      faltantes: conferiveis.filter((i) => !associados.has(i.id)).map((i) => i.nome),
      extras: linhas
        .filter((l) => !ids.has(l.itemId) && l.descricao.trim())
        .map((l) => ({ descricao: l.descricao.trim(), valor: l.valor || 0 })),
    };
  }

  // Devolve o primeiro problema na ordem do formulário, ou null se estiver tudo certo.
  function validarRegistro({ mercado, data, total }) {
    if (!String(mercado ?? '').trim()) return { campo: 'conf-mercado', mensagem: 'Informe o mercado.' };
    if (!data) return { campo: 'conf-data', mensagem: 'Informe a data da compra.' };
    const valor = Util.parseValor(total);
    if (!Number.isFinite(valor) || valor < 0) return { campo: 'conf-total', mensagem: 'Informe o total pago (ex.: 154,90).' };
    return null;
  }

  // ---- Interface ----

  function $(id) {
    return document.getElementById(id);
  }

  function status(texto, erro = false) {
    $('conf-status').textContent = texto;
    $('conf-status').classList.toggle('erro', erro);
  }

  function itensDaLista() {
    return Lista.todos().filter((i) => i.quantidade > 0);
  }

  function abrirRevisao(dados) {
    const itens = itensDaLista();
    estado = {
      mercado: dados.mercado || '',
      data: dados.data || Util.hojeISO(),
      total: dados.total,
      linhas: dados.itens.map((l) => ({ id: Util.uid(), descricao: l.descricao, valor: l.valor, itemId: associar(l.descricao, itens) })),
    };
    $('conf-mercado').value = estado.mercado;
    $('conf-data').value = estado.data;
    $('conf-total').value = estado.total != null ? Util.decimal(estado.total) : '';
    $('conf-revisao').hidden = false;
    renderLinhas();
    $('conf-mercado').focus();
  }

  function renderLinhas() {
    const itens = itensDaLista();
    const opcoes = (selecionado) =>
      `<option value="">Extra (fora da lista)</option>` +
      itens.map((i) => `<option value="${Util.esc(i.id)}"${i.id === selecionado ? ' selected' : ''}>${Util.esc(i.nome)}</option>`).join('');

    $('conf-linhas').innerHTML = estado.linhas.length
      ? estado.linhas
          .map(
            (l) => `
          <tr data-linha="${Util.esc(l.id)}">
            <td><input class="linha-descricao" value="${Util.esc(l.descricao)}" aria-label="Descrição"></td>
            <td><input class="linha-valor num" inputmode="decimal" value="${l.valor != null ? Util.decimal(l.valor) : ''}" aria-label="Valor"></td>
            <td><select class="linha-item" aria-label="Item da lista">${opcoes(l.itemId)}</select></td>
            <td><button type="button" class="btn-icone perigo" data-remover-linha aria-label="Remover linha">×</button></td>
          </tr>`
          )
          .join('')
      : '<tr><td colspan="4" class="nota">Nenhuma linha reconhecida. Adicione as linhas manualmente.</td></tr>';
    renderResumo();
  }

  function renderResumo() {
    const r = resultado(estado.linhas, itensDaLista());
    const somaLinhas = estado.linhas.reduce((s, l) => s + (l.valor || 0), 0);
    const bloco = (titulo, classe, nomes) =>
      `<div class="bloco ${classe}"><h4>${titulo} (${nomes.length})</h4><ul>${
        nomes.length ? nomes.map((n) => `<li>${Util.esc(n)}</li>`).join('') : '<li class="nota">Nenhum</li>'
      }</ul></div>`;
    $('conf-resumo').innerHTML = `
      <p class="nota">Soma das linhas: ${Util.brl(somaLinhas)}</p>
      <div class="grade-3">
        ${bloco('Identificados', 'ok', r.identificados)}
        ${bloco('Ficaram de fora', 'alerta', r.faltantes)}
        ${bloco('Extras', '', r.extras.map((e) => `${e.descricao} — ${Util.brl(e.valor)}`))}
      </div>`;
  }

  function limpar() {
    estado = null;
    $('conf-revisao').hidden = true;
    $('conf-preview').hidden = true;
    $('conf-preview').removeAttribute('src');
    $('conf-progresso').hidden = true;
    if (urlPreview) URL.revokeObjectURL(urlPreview);
    urlPreview = null;
  }

  async function processarArquivo(arquivo) {
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      status('Selecione um arquivo de imagem.', true);
      return;
    }
    limpar();
    urlPreview = URL.createObjectURL(arquivo);
    $('conf-preview').src = urlPreview;
    $('conf-preview').hidden = false;
    const barra = $('conf-progresso');
    barra.value = 0;
    barra.hidden = false;
    status('Carregando o OCR… na primeira vez o download pode levar alguns segundos.');
    try {
      const texto = await reconhecer(arquivo, (p) => {
        barra.value = p;
        status(`Lendo a nota… ${Math.round(p * 100)}%`);
      });
      const dados = interpretarNota(texto);
      status(
        dados.itens.length
          ? `${dados.itens.length} linha(s) reconhecida(s). Revise antes de salvar.`
          : 'Não reconhecemos linhas de produtos. Você pode preencher manualmente.',
        !dados.itens.length
      );
      abrirRevisao(dados);
    } catch (erro) {
      console.error(erro);
      status(erro.message || 'Falha ao ler a imagem.', true);
    } finally {
      barra.hidden = true;
    }
  }

  function salvar() {
    const campos = { mercado: $('conf-mercado').value.trim(), data: $('conf-data').value, total: $('conf-total').value };
    const problema = validarRegistro(campos);
    if (problema) {
      status(problema.mensagem, true);
      $(problema.campo).focus();
      return;
    }
    Historico.adicionar({
      mercado: campos.mercado,
      data: campos.data,
      total: Util.arredondar(Util.parseValor(campos.total)),
      conferencia: resultado(estado.linhas, itensDaLista()),
    });
    limpar();
    status('Compra salva no histórico.');
    document.dispatchEvent(new CustomEvent('abrir-aba', { detail: 'historico' }));
  }

  function iniciar() {
    ['conf-camera', 'conf-arquivo'].forEach((id) =>
      $(id).addEventListener('change', (e) => {
        processarArquivo(e.target.files[0]);
        e.target.value = '';
      })
    );

    $('conf-manual').addEventListener('click', () => {
      limpar();
      status('Preencha os dados da compra.');
      abrirRevisao({ mercado: '', data: Util.hojeISO(), total: null, itens: [] });
    });

    $('conf-add-linha').addEventListener('click', () => {
      estado.linhas.push({ id: Util.uid(), descricao: '', valor: null, itemId: null });
      renderLinhas();
      $('conf-linhas').querySelector('tr:last-child .linha-descricao')?.focus();
    });

    const tabela = $('conf-linhas');
    tabela.addEventListener('input', (e) => {
      const linha = estado.linhas.find((l) => l.id === e.target.closest('tr')?.dataset.linha);
      if (!linha) return;
      if (e.target.classList.contains('linha-descricao')) linha.descricao = e.target.value;
      if (e.target.classList.contains('linha-valor')) {
        const v = Util.parseValor(e.target.value);
        linha.valor = Number.isFinite(v) ? v : null;
      }
      renderResumo();
    });
    tabela.addEventListener('change', (e) => {
      if (!e.target.classList.contains('linha-item')) return;
      const linha = estado.linhas.find((l) => l.id === e.target.closest('tr').dataset.linha);
      linha.itemId = e.target.value || null;
      renderResumo();
    });
    tabela.addEventListener('click', (e) => {
      if (!e.target.closest('[data-remover-linha]')) return;
      const id = e.target.closest('tr').dataset.linha;
      estado.linhas = estado.linhas.filter((l) => l.id !== id);
      renderLinhas();
    });

    $('conf-salvar').addEventListener('click', salvar);
    $('conf-descartar').addEventListener('click', () => {
      limpar();
      status('');
    });

    // Desfaz associações a itens que deixaram de ser conferíveis, para o seletor
    // da linha mostrar "Extra", coerente com o resumo (CA-CNF-14).
    Lista.aoMudar(() => {
      if (!estado) return;
      const ids = new Set(itensDaLista().map((i) => i.id));
      for (const l of estado.linhas) if (l.itemId && !ids.has(l.itemId)) l.itemId = null;
      renderLinhas();
    });
  }

  return { iniciar, interpretarNota, associar, resultado, validarRegistro };
})();
