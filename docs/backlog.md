# Backlog — Compra Certa

Atualizado em 21/10/2026. Referências de requisitos em [SDD.md](SDD.md).

## Implementado (v0.1)

| Funcionalidade | Requisitos |
|---|---|
| Lista de compras por categoria, com inclusão, quantidade, unidade e remoção | RF01–RF03 |
| Catálogo com autocompletar e preço de referência | RN02 |
| Dashboard: resumo, participação por categoria e comparação demonstrativa da cesta | RF04–RF06 |
| Localizador por cidade/bairro/CEP e por localização do dispositivo, com até 4 resultados em até 10 km | RF07–RF09 |
| Cache de 24 h das pesquisas do localizador | RNF05 |
| Conferência por nota: câmera ou arquivo, OCR em português, revisão, associação automática e manual | RF10–RF14 |
| Preenchimento manual da conferência sem foto | RF13 |
| Histórico com totais, média, detalhes da conferência e exclusão | RF15–RF16 |
| Tema claro/escuro e navegação por teclado nas abas | RNF06–RNF07 |

## Próximos itens

### Prioridade alta
- [ ] **Testes automatizados** das funções puras (`interpretarNota`, `associar`, `resultado`, `calcular`) com um conjunto de notas reais anonimizadas.
- [ ] **Exportar e importar dados** (JSON) da lista e do histórico, para mitigar a perda ao limpar o navegador.
- [ ] **Endpoint alternativo do Overpass** com nova tentativa automática quando o principal falhar (429/504).
- [ ] **Pré-processamento da imagem** antes do OCR (escala de cinza, contraste, recorte) para melhorar a leitura.

### Prioridade média
- [ ] Ler o **QR Code da NFC-e** como alternativa ao OCR (os dados vêm da SEFAZ, então são estruturados e exatos).
- [ ] Marcar itens como "no carrinho" durante a compra.
- [ ] Comparar o total pago com o total de referência planejado na conferência.
- [ ] Gráfico de evolução de gastos no histórico.
- [ ] Editar a categoria e o nome de um item já incluído.
- [ ] Desfazer a remoção de item ou registro.

### Prioridade baixa / exploratória
- [ ] PWA: manifest + service worker para uso offline e instalação no celular.
- [ ] Fonte de preços reais (APIs de varejistas, Nota Paraná/Nota Fiscal Paulista ou preços coletados pelo próprio histórico).
- [ ] Ligar estabelecimentos do localizador ao comparador quando houver preços reais.
- [ ] Sincronização opcional entre dispositivos (requer backend e autenticação).
- [ ] Listas múltiplas (mensal, semanal, churrasco…).

## Dívidas técnicas
- Os módulos são objetos globais carregados em ordem. Migrar para ES Modules se adotarmos um bundler ou servidor com MIME garantido.
- A versão do Tesseract.js (`5.1.1`) está fixada no código. Revisar periodicamente e considerar hospedar os arquivos localmente.
- Sem CI nem lint configurados.
