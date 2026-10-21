# Backlog — Compra Certa

Atualizado em 21/10/2026.

O que já está implementado é definido pela [spec 001](../specs/001-compra-certa-v0.1/spec.md) e acompanhado em [tasks.md](../specs/001-compra-certa-v0.1/tasks.md). Os itens abaixo são **candidatos a novas specs**: nenhum entra no código sem uma spec aprovada ([constituição](../specs/constitution.md)).

## Candidatos a spec

### Prioridade alta
- [ ] **Conferência de quantidade e preço**: comparar o planejado com o comprado, por exemplo "6 leites planejados, 4 na nota" (decisão Q3 da spec 001).
- [ ] **Exportar e importar dados** (JSON) da lista e do histórico, para não perder tudo ao limpar o navegador.
- [ ] **Pré-processamento da imagem** antes do OCR (escala de cinza, contraste, recorte) para melhorar a leitura.

### Prioridade média
- [ ] Ler o **QR Code da NFC-e** como alternativa ao OCR, com dados estruturados da SEFAZ.
- [ ] Marcar itens como "no carrinho" durante a compra.
- [ ] Comparar o total pago com o total de referência planejado.
- [ ] Gráfico de evolução dos gastos no histórico.
- [ ] Editar nome e categoria de um item já incluído.
- [ ] Desfazer a remoção de item ou registro.

### Prioridade baixa / exploratória
- [ ] PWA: manifest e service worker, para uso offline e instalação no celular.
- [ ] Fonte de preços reais (APIs de varejistas, programas estaduais de nota fiscal ou preços coletados do próprio histórico).
- [ ] Ligar os estabelecimentos do localizador ao comparador, quando houver preços reais.
- [ ] Sincronização opcional entre dispositivos (exige backend e autenticação).
- [ ] Listas múltiplas (mensal, semanal, churrasco…).

## Melhorias técnicas (sem mudança de comportamento)
- [ ] Endpoint alternativo do Overpass, com nova tentativa automática quando o principal falhar (429/504).
- [ ] Hospedar o Tesseract.js e os dados de idioma junto do app, em vez de usar o CDN.
- [ ] Testes de interface automatizados (ex.: Playwright) para reduzir o roteiro manual.
- [ ] Lint no CI.
