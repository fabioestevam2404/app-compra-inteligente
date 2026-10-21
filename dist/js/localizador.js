// Localizador regional via OpenStreetMap (Nominatim para geocodificação, Overpass para estabelecimentos).
const Localizador = (() => {
  const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
  const OVERPASS = 'https://overpass-api.de/api/interpreter';
  const MAX_RESULTADOS = 4;
  const RAIO_MAX_KM = 10;
  const TTL_CACHE = 24 * 60 * 60 * 1000;
  const MAX_CACHE = 30;
  const TIPOS = {
    supermarket: 'Supermercado',
    wholesale: 'Atacado',
    convenience: 'Mercado de bairro',
    greengrocer: 'Hortifrúti',
    butcher: 'Açougue',
    bakery: 'Padaria',
  };

  let buscando = false;

  // ---- Cache local ----

  function lerCache(chave) {
    const cache = Store.get('cache-localizador', {});
    const entrada = cache[chave];
    return entrada && Date.now() - entrada.em < TTL_CACHE ? entrada.valor : null;
  }

  function gravarCache(chave, valor) {
    const cache = Store.get('cache-localizador', {});
    cache[chave] = { em: Date.now(), valor };
    const chaves = Object.keys(cache).sort((a, b) => cache[b].em - cache[a].em);
    chaves.slice(MAX_CACHE).forEach((k) => delete cache[k]);
    Store.set('cache-localizador', cache);
  }

  // ---- Consultas ----

  function distanciaKm(lat1, lon1, lat2, lon2) {
    const rad = (g) => (g * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function termoValido(termo) {
    return String(termo ?? '').trim().length >= 3;
  }

  // Só dígitos, espaços, ponto e hífen, somando 8 dígitos.
  function ehCep(termo) {
    const t = String(termo ?? '').trim();
    return /^[\d\s.-]+$/.test(t) && /^\d{8}$/.test(t.replace(/\D/g, ''));
  }

  async function geocodificar(termo) {
    const chave = 'geo:' + Util.normalizar(termo);
    const emCache = lerCache(chave);
    if (emCache) return emCache;

    const digitos = termo.replace(/\D/g, '');
    const q = ehCep(termo) ? `${digitos.slice(0, 5)}-${digitos.slice(5)}, Brasil` : termo;
    const params = new URLSearchParams({ q, format: 'jsonv2', limit: '1', countrycodes: 'br', 'accept-language': 'pt-BR' });
    const resp = await fetch(`${NOMINATIM}?${params}`);
    if (!resp.ok) throw new Error(`Serviço de geocodificação respondeu ${resp.status}.`);
    const dados = await resp.json();
    if (!dados.length) return null;
    const geo = { lat: Number(dados[0].lat), lon: Number(dados[0].lon), rotulo: dados[0].display_name };
    gravarCache(chave, geo);
    return geo;
  }

  function montarEndereco(t) {
    const rua = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', ');
    return [rua, t['addr:suburb'], t['addr:city']].filter(Boolean).join(' · ');
  }

  async function buscarEstabelecimentos(lat, lon, raioKm) {
    const chave = `est:${lat.toFixed(3)},${lon.toFixed(3)},${raioKm}`;
    const emCache = lerCache(chave);
    if (emCache) return emCache;

    const consulta =
      `[out:json][timeout:25];` +
      `nwr["shop"~"^(${Object.keys(TIPOS).join('|')})$"](around:${raioKm * 1000},${lat},${lon});` +
      `out center tags;`;
    const resp = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(consulta),
    });
    if (!resp.ok) throw new Error(`Serviço de mapas respondeu ${resp.status}.`);
    const { elements = [] } = await resp.json();
    const resultados = selecionarResultados(elements, lat, lon, raioKm);
    gravarCache(chave, resultados);
    return resultados;
  }

  function selecionarResultados(elements, lat, lon, raioKm) {
    const prioridade = Object.keys(TIPOS);
    return elements
      .map((el) => {
        const la = el.lat ?? el.center?.lat;
        const lo = el.lon ?? el.center?.lon;
        if (la == null || lo == null) return null;
        const t = el.tags || {};
        return {
          id: `${el.type}/${el.id}`,
          nome: t.name || t.brand || '',
          tipo: TIPOS[t.shop] || 'Estabelecimento',
          ordemTipo: prioridade.indexOf(t.shop),
          endereco: montarEndereco(t),
          horario: t.opening_hours || '',
          lat: la,
          lon: lo,
          distanciaKm: distanciaKm(lat, lon, la, lo),
        };
      })
      .filter((e) => e && e.distanciaKm <= raioKm)
      // Estabelecimentos com nome primeiro, depois supermercados/atacados, depois distância.
      .sort((a, b) => !a.nome - !b.nome || (a.ordemTipo > 1) - (b.ordemTipo > 1) || a.distanciaKm - b.distanciaKm)
      .slice(0, MAX_RESULTADOS)
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }

  // ---- Interface ----

  function status(texto, erro = false) {
    const el = document.getElementById('busca-status');
    el.textContent = texto;
    el.classList.toggle('erro', erro);
  }

  function distanciaTexto(km) {
    return km < 1 ? `${Math.round(km * 1000)} m` : `${Util.num(Util.arredondar(km, 1))} km`;
  }

  function renderResultados(resultados) {
    document.getElementById('busca-resultados').innerHTML = resultados
      .map((e) => {
        const mapa = `https://www.openstreetmap.org/?mlat=${e.lat}&mlon=${e.lon}#map=18/${e.lat}/${e.lon}`;
        return `
          <li class="cartao resultado">
            <h3>${Util.esc(e.nome || e.tipo)}</h3>
            <p class="meta">${Util.esc(e.tipo)} · aprox. ${distanciaTexto(e.distanciaKm)}</p>
            ${e.endereco ? `<p>${Util.esc(e.endereco)}</p>` : '<p class="nota">Endereço não informado no mapa.</p>'}
            ${e.horario ? `<p class="nota">Horário no mapa: ${Util.esc(e.horario)}</p>` : ''}
            <a href="${mapa}" target="_blank" rel="noopener">Ver no mapa</a>
          </li>`;
      })
      .join('');
  }

  async function pesquisarCoordenadas(lat, lon, raioKm, rotulo) {
    status(`Buscando estabelecimentos perto de ${rotulo}…`);
    const resultados = await buscarEstabelecimentos(lat, lon, raioKm);
    renderResultados(resultados);
    status(
      resultados.length
        ? `${resultados.length} estabelecimento(s) em até ${raioKm} km de ${rotulo}.`
        : `Nenhum estabelecimento mapeado em até ${raioKm} km. Tente aumentar o raio.`
    );
  }

  async function executar(tarefa) {
    if (buscando) return;
    buscando = true;
    document.querySelectorAll('#form-busca button').forEach((b) => (b.disabled = true));
    try {
      await tarefa();
    } catch (erro) {
      console.error(erro);
      status(`Não foi possível concluir a pesquisa. ${erro.message || ''} Tente novamente em instantes.`, true);
    } finally {
      buscando = false;
      document.querySelectorAll('#form-busca button').forEach((b) => (b.disabled = false));
    }
  }

  function raioSelecionado() {
    return Math.min(RAIO_MAX_KM, Math.max(1, Number(document.getElementById('busca-raio').value) || 5));
  }

  function iniciar() {
    const form = document.getElementById('form-busca');
    const prefs = Store.get('preferencias', {});
    if (prefs.termoBusca) form.termo.value = prefs.termoBusca;
    if (prefs.raioBusca) form.raio.value = String(prefs.raioBusca);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const termo = form.termo.value.trim();
      if (!termoValido(termo)) {
        status('Informe uma cidade, bairro ou CEP.', true);
        return;
      }
      const raio = raioSelecionado();
      Store.set('preferencias', { ...Store.get('preferencias', {}), termoBusca: termo, raioBusca: raio });
      executar(async () => {
        status('Localizando a região…');
        const geo = await geocodificar(termo);
        if (!geo) {
          renderResultados([]);
          status('Não encontramos essa região. Confira a grafia ou informe cidade e estado.', true);
          return;
        }
        await pesquisarCoordenadas(geo.lat, geo.lon, raio, termo);
      });
    });

    document.getElementById('busca-gps').addEventListener('click', () => {
      if (!('geolocation' in navigator)) {
        status('Este navegador não oferece localização do dispositivo.', true);
        return;
      }
      if (!window.isSecureContext) {
        status('A localização do dispositivo exige HTTPS ou localhost.', true);
        return;
      }
      const raio = raioSelecionado();
      status('Aguardando permissão de localização…');
      navigator.geolocation.getCurrentPosition(
        (pos) => executar(() => pesquisarCoordenadas(pos.coords.latitude, pos.coords.longitude, raio, 'sua localização')),
        (erro) => {
          const msg = {
            1: 'Permissão de localização negada. Você pode pesquisar por cidade, bairro ou CEP.',
            2: 'Não foi possível obter sua localização.',
            3: 'A localização demorou demais para responder.',
          };
          status(msg[erro.code] || 'Falha ao obter a localização.', true);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  return {
    iniciar,
    distanciaKm,
    distanciaTexto,
    termoValido,
    ehCep,
    selecionarResultados,
    geocodificar,
    buscarEstabelecimentos,
  };
})();
