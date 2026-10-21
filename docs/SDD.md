# SDD — Compra Certa (Mercado Inteligente)

> Software Design Document. Versão 0.1 — 21/10/2026. Autor: Fabio Estevam.

## 1. Visão de domínio

Quem faz compras de mercado costuma planejar uma lista, escolher onde comprar e, na saída, não tem uma forma simples de conferir se o que pagou corresponde ao que planejou. O **Compra Certa** junta essas três etapas em um app web que roda inteiro no navegador:

1. **Planejar**: montar a lista de itens por categoria, com quantidade e unidade.
2. **Escolher**: encontrar estabelecimentos próximos e comparar o custo estimado da cesta.
3. **Conferir**: fotografar a nota fiscal, reconhecer os itens com OCR, confrontar com a lista e registrar o valor pago.

### Glossário

| Termo | Significado |
|---|---|
| Item | Produto da lista, com nome, categoria, quantidade, unidade e preço de referência. |
| Cesta | Conjunto dos itens da lista com quantidade maior que zero. |
| Preço de referência (`precoRef`) | Preço unitário de demonstração vindo do catálogo ou do padrão da categoria. |
| Mercado demo | Mercado fictício usado no comparador. Não corresponde a um estabelecimento real. |
| Estabelecimento | Comércio real, vindo do OpenStreetMap, exibido pelo localizador. |
| Linha da nota | Descrição e valor reconhecidos em uma linha da nota fiscal. |
| Conferência | Resultado da associação entre linhas da nota e itens: identificados, faltantes e extras. |

## 2. Escopo e premissas

- Protótipo sem backend, sem conta de usuário e sem sincronização.
- **Os preços são ilustrativos.** O app não consulta preços, ofertas, estoque ou disponibilidade reais.
- O localizador mostra estabelecimentos reais, mas não os liga ao comparador de preços.
- Público: pessoas que usam o celular dentro e fora do mercado. O app é mobile-first e responsivo.

## 3. Requisitos funcionais

| ID | Requisito |
|---|---|
| RF01 | Exibir a lista agrupada por categoria, na ordem fixa das categorias. |
| RF02 | Incluir um produto com nome, categoria e unidade (estas duas podem ser "Automática") e quantidade. |
| RF03 | Ajustar a quantidade (botões −/+ ou digitação) e a unidade, e remover itens. |
| RF04 | Mostrar no dashboard: nº de itens, total de referência, categoria com maior gasto e menor cesta. |
| RF05 | Mostrar a participação percentual de cada categoria no total cotado. |
| RF06 | Mostrar o total da cesta por mercado demo, ordenado, com diferença % em relação à menor cesta. |
| RF07 | Pesquisar estabelecimentos por cidade, bairro ou CEP, em raio de 1, 2, 5 ou 10 km. |
| RF08 | Pesquisar a partir da localização do dispositivo, solicitada só após ação do usuário. |
| RF09 | Exibir até 4 estabelecimentos com nome, tipo, distância aproximada, endereço, horário (se houver) e link para o mapa. |
| RF10 | Receber a imagem da nota pela câmera ou por seleção de arquivo e executar OCR em português no navegador. |
| RF11 | Extrair mercado, data, total e linhas de itens do texto reconhecido. |
| RF12 | Associar automaticamente cada linha a um item da lista, permitindo correção manual. |
| RF13 | Permitir editar, incluir e remover linhas, e preencher a conferência manualmente sem foto. |
| RF14 | Exibir itens identificados, itens que ficaram de fora e extras. |
| RF15 | Salvar no histórico: mercado, data, total pago e resultado da conferência. |
| RF16 | Exibir o histórico (mais recente primeiro) com totais e média, e permitir excluir registros. |

## 4. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | Sem etapa de build: HTML, CSS e JavaScript puros, servidos estaticamente a partir de `dist/`. |
| RNF02 | Persistência em `localStorage` com prefixo `compracerta:`. Se indisponível, cai para memória da sessão. |
| RNF03 | A foto da nota não é armazenada nem enviada a servidores. Só o mecanismo e os dados de idioma do OCR vêm de CDN. |
| RNF04 | Geolocalização exige contexto seguro (HTTPS ou `localhost`). |
| RNF05 | Respeito às políticas de uso do Nominatim/Overpass: busca só por ação do usuário e cache de 24 h. |
| RNF06 | Acessibilidade: abas com `role="tab"` e navegação por setas, rótulos em todos os controles, mensagens em `aria-live`. |
| RNF07 | Tema claro e escuro automáticos (`prefers-color-scheme`); layout utilizável a partir de 320 px. |

## 5. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Incluir um produto cujo nome normalizado (sem acento, minúsculas) já existe soma a quantidade ao item existente. |
| RN02 | Produto encontrado no catálogo herda nome canônico, categoria, unidade e preço. Senão, usa a categoria escolhida (ou "Outros"), a unidade escolhida (ou "un") e o preço padrão da categoria. |
| RN03 | Passo dos botões −/+: 0,5 para kg, 100 para g e ml, 1 para as demais. A quantidade mínima é 0. |
| RN04 | Itens com quantidade 0 ficam na lista, mas não entram no dashboard nem na conferência. |
| RN05 | Total de referência = Σ (quantidade × `precoRef`). A participação da categoria é o seu total dividido pelo total de referência. |
| RN06 | Preço demo de um item em um mercado = `precoRef` × fator do mercado × (1 + variação), com variação determinística em ±8% derivada de hash(nome + mercado). |
| RN07 | Diferença % de um mercado = (total − menor total) ÷ menor total. |
| RN08 | O raio do localizador é limitado a 10 km. São exibidos no máximo 4 estabelecimentos: primeiro os que têm nome, depois supermercados e atacados, depois por distância. A lista final fica ordenada por distância. |
| RN09 | Uma entrada só com dígitos, que somem 8, é tratada como CEP. |
| RN10 | Na nota, uma linha só vira item se terminar em valor monetário e não for total, subtotal, desconto, pagamento, troco ou tributos. O "total" é o último encontrado. Sem total, usa-se a soma das linhas. |
| RN11 | A associação exige que o primeiro termo significativo do item (≥ 3 letras, sem números) apareça na descrição, aceitando abreviação por prefixo. A nota é a fração de termos do item encontrados e precisa ser ≥ 0,5. |
| RN12 | Para salvar a conferência, a data e um total ≥ 0 são obrigatórios. O nome do mercado é opcional. |

## 6. Arquitetura

```
dist/
├── index.html          # Estrutura das 5 abas
├── css/styles.css      # Tokens de tema, layout responsivo
└── js/
    ├── util.js         # Formatação pt-BR, normalização, escape, hash
    ├── storage.js      # Store: localStorage com fallback em memória
    ├── data.js         # Dados: categorias, catálogo, mercados demo, precoDemo()
    ├── lista.js        # Lista: estado da lista + UI + eventos aoMudar()
    ├── dashboard.js    # Dashboard: calcular() puro + render
    ├── localizador.js  # Localizador: Nominatim + Overpass + cache
    ├── historico.js    # Historico: registros salvos
    ├── conferencia.js  # Conferencia: OCR, interpretarNota(), associar(), resultado()
    └── app.js          # Inicialização e navegação por abas
```

- **Módulos:** cada arquivo expõe um objeto global (padrão IIFE) e é carregado por `<script>` clássico, em ordem. ES Modules ficaram de fora porque o `python -m http.server` no Windows pode servir `.js` com MIME incorreto.
- **Fluxo de dados:** `Lista` é a fonte de verdade da lista. `Dashboard` e `Conferencia` se inscrevem em `Lista.aoMudar()` para renderizar de novo. `Conferencia` grava no `Historico`. A troca de aba usa o evento `abrir-aba`.
- **Funções puras testáveis:** `Dashboard.calcular`, `Conferencia.interpretarNota`, `Conferencia.associar`, `Conferencia.resultado`, `Localizador.distanciaKm`, `Dados.precoDemo`.

### Chaves de armazenamento (`compracerta:*`)

| Chave | Conteúdo |
|---|---|
| `lista` | `[{ id, nome, categoria, quantidade, unidade, precoRef }]` |
| `historico` | `[{ id, salvoEm, mercado, data, total, conferencia: { identificados[], faltantes[], extras[{descricao, valor}] } }]` |
| `preferencias` | `{ termoBusca, raioBusca }` |
| `cache-localizador` | `{ [chave]: { em, valor } }`, com no máximo 30 entradas e TTL de 24 h |
| `aba` | Última aba aberta |

### Integrações externas

| Serviço | Uso | Dados enviados |
|---|---|---|
| Nominatim (`nominatim.openstreetmap.org/search`) | Geocodificar cidade, bairro ou CEP | Termo digitado |
| Overpass (`overpass-api.de/api/interpreter`) | Estabelecimentos `shop=supermarket\|wholesale\|convenience\|greengrocer\|butcher\|bakery` no raio | Coordenadas e raio |
| jsDelivr (`tesseract.js@5.1.1`) + tessdata | Mecanismo e modelo `por` do OCR | Nenhum dado do usuário |

## 7. Decisões (ADRs resumidas)

| # | Decisão | Motivo | Consequência |
|---|---|---|---|
| D1 | App estático sem backend | Protótipo sem custo de hospedagem e com privacidade por padrão | Sem sincronização; dados presos ao navegador |
| D2 | `localStorage` em vez de IndexedDB | Volume pequeno e API simples | Limite de cerca de 5 MB; não guarda imagens (e não precisa) |
| D3 | OCR no cliente (Tesseract.js) | A foto não sai do aparelho | Primeiro uso baixa cerca de 10 MB; precisão limitada em fotos ruins |
| D4 | OpenStreetMap para localização | Gratuito e aberto, sem chave de API | Cobertura desigual; limites de uso exigem cache e busca só sob demanda |
| D5 | Preços demonstrativos determinísticos | Não há fonte de preços reais disponível | O comparador deve deixar claro que é ilustrativo |
| D6 | Scripts clássicos + objetos globais | Funciona em qualquer servidor estático sem configurar MIME | Ordem de carregamento importa; sem tree-shaking |

## 8. Riscos e limitações

- O OCR erra em fotos tortas, amassadas ou com pouca luz. A revisão manual é obrigatória por design.
- Layouts de nota variam entre emissores, então as heurísticas de RN10 podem falhar. Há o preenchimento manual como alternativa.
- Instabilidade ou limite de requisições do Overpass e do Nominatim levam a uma mensagem de erro e a novas tentativas manuais.
- Limpar os dados do navegador apaga lista e histórico (não há exportação ainda).
