# Plano técnico — Spec 001 (Compra Certa v0.1)

| Campo | Valor |
|---|---|
| Spec | [spec.md](spec.md) (aprovada em 21/10/2026) |
| Status | Aprovado junto com a spec |

> Este documento descreve **como** a spec é atendida. Requisitos e regras ficam **só** na spec, e aqui eles são citados pelo ID do critério de aceite (`CA-*`).

## 1. Stack e restrições

| Decisão | Motivo | Princípio |
|---|---|---|
| HTML, CSS e JavaScript puros, servidos de `dist/` | Sem build e sem backend; qualquer servidor estático serve | P5 |
| `<script>` clássicos, cada módulo como objeto global (IIFE) | O `python -m http.server` no Windows pode servir `.js` com MIME errado, o que quebra ES Modules | P5 |
| `localStorage` com prefixo `compracerta:` e fallback em memória | Dados pequenos e só no aparelho (CA-GER-05) | P2 |
| OCR com Tesseract.js 5.1.1 (jsDelivr), carregado sob demanda | A imagem não sai do aparelho (CA-CNF-03) | P2 |
| OpenStreetMap: Nominatim para geocodificar e Overpass para estabelecimentos | Gratuito, sem chave de API (US-LOC) | P5 |
| Preço de demonstração determinístico: `precoRef × fator × (1 ± 8%)`, com a variação vinda de um hash FNV-1a | Valores estáveis entre visitas (CA-DSH-06) sem fonte de preços reais | P1 |
| Testes com `node:test`, carregando os scripts num contexto `vm` | Testa o código de produção sem dependências nem build | P5 |

## 2. Estrutura

```
dist/
├── index.html          # 5 abas (role=tablist) + rodapé
├── css/styles.css      # tokens claro/escuro, layout mobile-first
└── js/                 # ordem de carregamento = ordem abaixo
    ├── util.js         # Util: formatação pt-BR, normalizar(), esc(), hash(), parseValor()
    ├── storage.js      # Store: get/set com fallback em memória
    ├── data.js         # Dados: categorias, unidades, catálogo, mercados demo, precoDemo()
    ├── lista.js        # Lista: estado + regras da lista + UI
    ├── dashboard.js    # Dashboard: calcular() + UI
    ├── localizador.js  # Localizador: geocodificação, Overpass, cache, UI
    ├── historico.js    # Historico: registros + UI
    ├── conferencia.js  # Conferencia: OCR, interpretação, associação, validação, UI
    └── app.js          # inicialização e navegação por abas
tests/
├── helpers/ambiente.js # carrega dist/js/*.js num contexto vm com localStorage/fetch falsos
├── *.test.js           # testes automatizados (nome do teste começa pelo ID do CA)
└── manual.md           # roteiro para os CAs que não dá para automatizar
```

## 3. Funções que materializam os critérios

Cada módulo separa **regra** (função pura, exportada e testada) de **interface** (DOM).

| Módulo | Função exportada | Critérios |
|---|---|---|
| `Lista` | `adicionar`, `atualizar`, `remover`, `todos` | CA-LST-01, 03–07, 11, 12 |
| `Lista` | `agrupar(itens)` | CA-LST-02 |
| `Lista` | `proximaQuantidade(item, acao)` | CA-LST-08 |
| `Lista` | `normalizarQuantidade(valor)` | CA-LST-09 |
| `Dashboard` | `calcular(itens)` | CA-LST-10, CA-DSH-02–07 |
| `Localizador` | `termoValido`, `ehCep` | CA-LOC-02, 03 |
| `Localizador` | `selecionarResultados(elementos, lat, lon, raioKm)` | CA-LOC-01, 05 |
| `Localizador` | `distanciaTexto(km)` | CA-LOC-04 |
| `Localizador` | `geocodificar`, `buscarEstabelecimentos` (com cache de 24 h) | CA-LOC-10 |
| `Localizador` | `buscarEstabelecimentos(…, aoTrocarServidor)` → `consultarOverpass`: servidores em ordem, `AbortController` com 20 s por servidor | CA-LOC-13 |
| `Localizador` | `raioInicial(salvo)`: aceita 1 ou 2 km, senão 2 km | CA-LOC-01, 14 |
| `Conferencia` | `interpretarNota(texto)` | CA-CNF-04–06 |
| `Conferencia` | `associar(descricao, itens)` | CA-CNF-07 |
| `Conferencia` | `resultado(linhas, itens)` | CA-LST-10, CA-CNF-09, 14, 15 |
| `Conferencia` | `validarRegistro({ mercado, data, total })` | CA-CNF-11 |
| `Historico` | `adicionar`, `remover`, `todos`, `ordenar`, `resumo` | CA-HST-01, 02, 05 |
| `Store` | `get`, `set`, `disponivel` | CA-GER-05 |

### Fluxo de dados
- `Lista` e `Historico` mantêm a fonte de verdade e avisam quem estiver inscrito via `aoMudar(fn)`. A interface se inscreve em `iniciar()`, então as regras rodam sem DOM.
- `Dashboard` e `Conferencia` se inscrevem em `Lista.aoMudar`. Quando a lista muda durante a revisão, associações a itens que deixaram de ser conferíveis são desfeitas (CA-CNF-14).
- `Conferencia` grava em `Historico` e dispara `abrir-aba` para o `app.js` mostrar o histórico (CA-CNF-12).

## 4. Armazenamento (`compracerta:*`)

| Chave | Formato |
|---|---|
| `lista` | `[{ id, nome, categoria, quantidade, unidade, precoRef }]` |
| `historico` | `[{ id, salvoEm, mercado, data, total, conferencia: { identificados[], faltantes[], extras[{ descricao, valor }] } }]` |
| `preferencias` | `{ termoBusca, raioBusca }` |
| `cache-localizador` | `{ [chave]: { em, valor } }`, com até 30 entradas e TTL de 24 h |
| `aba` | última aba aberta |

## 5. Integrações externas

| Serviço | Uso | Dados enviados |
|---|---|---|
| `nominatim.openstreetmap.org/search` | geocodificar o termo (`countrycodes=br`) | termo digitado |
| `overpass-api.de/api/interpreter` (principal) | `shop=supermarket\|wholesale\|convenience\|greengrocer\|butcher\|bakery` no raio | coordenadas e raio |
| `maps.mail.ru/osm/tools/overpass/api/interpreter` (alternativo, CA-LOC-13) | mesma consulta, usada só se o principal falhar ou passar de 20 s | coordenadas e raio |

Os dois servidores respondem com `Access-Control-Allow-Origin: *`, verificado em 21/10/2026. A consulta usa `application/x-www-form-urlencoded`, que dispensa pré-verificação CORS.
| `cdn.jsdelivr.net/npm/tesseract.js@5.1.1` + tessdata | mecanismo e modelo `por` do OCR | nenhum dado do usuário |

## 6. Estratégia de verificação

- **Automatizada:** `npm test` (ou `node --test tests/`). Todo teste começa pelo ID do critério (ex.: `CA-LST-06 …`), e a matriz em [tasks.md](tasks.md) liga cada CA ao seu teste.
- **Manual:** [../../tests/manual.md](../../tests/manual.md), para câmera, geolocalização, layout, acessibilidade e textos fixos da interface.
- **CI:** o workflow do GitHub Pages roda os testes antes de publicar. Se um teste falhar, nada é publicado.

## 7. Riscos técnicos

| Risco | Mitigação |
|---|---|
| OCR impreciso em fotos ruins | Revisão obrigatória e edição completa (CA-CNF-08); preenchimento manual (CA-CNF-10) |
| Layouts de nota variados | Heurísticas isoladas em `interpretarNota`, cobertas por testes com notas de exemplo |
| Instabilidade ou limite do Overpass/Nominatim | Raio máximo de 2 km (consultas leves), servidor alternativo automático (CA-LOC-13), cache de 24 h, busca só por ação do usuário, mensagem de erro com nova tentativa (CA-LOC-09). O Nominatim ainda não tem alternativo. |
| Perda de dados ao limpar o navegador | Aceito na v0.1; exportação está no backlog |
