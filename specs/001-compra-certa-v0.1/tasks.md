# Tarefas — Spec 001 (Compra Certa v0.1)

Spec: [spec.md](spec.md) · Plano: [plan.md](plan.md)

Legenda: ✅ concluída · ⏳ pendente

## Fase 0 — Implementação inicial (antes da spec, retroativa)

| ID | Tarefa | CAs | Status |
|---|---|---|---|
| T001 | Estrutura estática: `index.html`, abas, CSS com tema claro e escuro | CA-GER-01–04, 06, 07 | ✅ |
| T002 | `Util` e `Store` com fallback em memória | CA-GER-05 | ✅ |
| T003 | Catálogo, mercados demo e `precoDemo` determinístico | CA-LST-03, 04, CA-DSH-06 | ✅ |
| T004 | Lista: incluir, ajustar, remover, persistir | CA-LST-02–13 | ✅ |
| T005 | Dashboard: `calcular` + interface | CA-DSH-01–08 | ✅ |
| T006 | Localizador: Nominatim, Overpass, cache, geolocalização | CA-LOC-01–12 | ✅ |
| T007 | Conferência: OCR, interpretação, associação, revisão | CA-CNF-01–10, 12, 13 | ✅ |
| T008 | Histórico: registros, resumo, exclusão | CA-HST-01–06 | ✅ |

## Fase 1 — Alinhamento com a spec aprovada (21/10/2026)

| ID | Tarefa | CAs | Status |
|---|---|---|---|
| T101 | Separar regras da interface e exportá-las (`agrupar`, `proximaQuantidade`, `normalizarQuantidade`, `selecionarResultados`, `termoValido`, `ehCep`, `distanciaTexto`, `validarRegistro`, `ordenar`, `resumo`); `Historico` com `aoMudar`, sem depender do DOM | — (pré-requisito de teste) | ✅ |
| T102 | Ambiente de teste (`tests/helpers/ambiente.js`, `node:test` + `vm`) e `npm test` | — | ✅ |
| T103 | Testes automatizados, nomeados pelo ID do CA (48 testes) | ver matriz | ✅ |
| T104 | **DEF-01**: somar só com mesmo nome e mesma unidade | CA-LST-06 | ✅ |
| T105 | **DEF-02**: linha ligada a item não conferível vira extra (regra + seletor da revisão) | CA-CNF-14 | ✅ |
| T106 | **DIV-01**: lista começa vazia; remover a lista de exemplo do `data.js` | CA-LST-01 | ✅ |
| T107 | **DIV-02**: mercado obrigatório para salvar | CA-CNF-11 | ✅ |
| T108 | Mover o filtro "quantidade > 0" da interface para a regra `resultado` | CA-LST-10 | ✅ |
| T109 | Roteiro de teste manual | ver matriz | ✅ |
| T110 | CI: rodar `npm test` antes de publicar no GitHub Pages | — | ✅ |
| T111 | Executar o roteiro manual em celular e desktop e registrar o resultado | CAs manuais | ⏳ |

## Fase 2 — Revisão 1 da spec (21/10/2026)

| ID | Tarefa | CAs | Status |
|---|---|---|---|
| T201 | Testes de servidor alternativo, tempo-limite e raio padrão (falharam antes da implementação: 3 de 5) | CA-LOC-13, 14 | ✅ |
| T202 | `consultarOverpass`: lista de servidores, `AbortController` com 20 s, aviso "Tentando outro servidor…" | CA-LOC-13 | ✅ |
| T203 | Raio só de 1 e 2 km, padrão 2 km, preferência antiga (5 ou 10 km) volta para 2 | CA-LOC-01, 14 | ✅ |
| T204 | Verificar CORS dos dois servidores Overpass | CA-LOC-13 | ✅ |

## Matriz de rastreabilidade

**A** = teste automatizado (`tests/*.test.js`, teste com o mesmo ID) · **M** = [roteiro manual](../../tests/manual.md)

| CA | Verificação | | CA | Verificação |
|---|---|---|---|---|
| CA-LST-01 | A + M | | CA-CNF-01 | M |
| CA-LST-02 | A | | CA-CNF-02 | M |
| CA-LST-03 | A | | CA-CNF-03 | M |
| CA-LST-04 | A | | CA-CNF-04 | A |
| CA-LST-05 | A | | CA-CNF-05 | A |
| CA-LST-06 | A | | CA-CNF-06 | A |
| CA-LST-07 | A | | CA-CNF-07 | A |
| CA-LST-08 | A | | CA-CNF-08 | M |
| CA-LST-09 | A | | CA-CNF-09 | A + M |
| CA-LST-10 | A | | CA-CNF-10 | M |
| CA-LST-11 | A | | CA-CNF-11 | A + M |
| CA-LST-12 | A | | CA-CNF-12 | M |
| CA-LST-13 | M | | CA-CNF-13 | M |
| CA-DSH-01 | M | | CA-CNF-14 | A + M |
| CA-DSH-02 | A | | CA-CNF-15 | A |
| CA-DSH-03 | A | | CA-HST-01 | A |
| CA-DSH-04 | A | | CA-HST-02 | A |
| CA-DSH-05 | A | | CA-HST-03 | M |
| CA-DSH-06 | A | | CA-HST-04 | A + M |
| CA-DSH-07 | A + M | | CA-HST-05 | A |
| CA-DSH-08 | M | | CA-HST-06 | M |
| CA-LOC-01 | A + M | | CA-GER-01 | M |
| CA-LOC-02 | A + M | | CA-GER-02 | M |
| CA-LOC-03 | A | | CA-GER-03 | M |
| CA-LOC-04 | A + M | | CA-GER-04 | M |
| CA-LOC-05 | A | | CA-GER-05 | A + M |
| CA-LOC-06 | M | | CA-GER-06 | M |
| CA-LOC-07 | M | | CA-GER-07 | M |
| CA-LOC-08 | M | | | |
| CA-LOC-09 | M | | | |
| CA-LOC-10 | A | | | |
| CA-LOC-11 | M | | | |
| CA-LOC-12 | M | | | |
| CA-LOC-13 | A | | | |
| CA-LOC-14 | A + M | | | |

**Cobertura:** 63 critérios. 39 com teste automatizado e 24 só com verificação manual. Todos têm pelo menos uma forma de verificação.
