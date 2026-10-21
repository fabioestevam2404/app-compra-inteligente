# Compra Certa — Mercado Inteligente

Aplicação web responsiva para planejar compras de mercado, consultar a lista de itens, comparar uma cesta e registrar o valor pago após a compra.

> **Importante:** este projeto é um protótipo. O localizador consulta estabelecimentos mapeados, mas os preços apresentados no comparador são ilustrativos e não representam ofertas reais.

## Funcionalidades

- **Lista de compras:** montar a lista por categoria, incluir produtos (com sugestões do catálogo) e ajustar quantidades e unidades.
- **Dashboard:** visualizar a categoria com maior gasto, a participação percentual das categorias no total cotado e os totais demonstrativos por mercado, com diferença percentual em relação à menor cesta.
- **Localizador regional:** pesquisar até quatro estabelecimentos em um raio de até 10 km por cidade, bairro ou CEP; também é possível usar a localização do dispositivo após conceder permissão. Os resultados podem incluir distância aproximada, endereço e link para o mapa.
- **Conferência por nota fiscal:** fotografar ou selecionar uma imagem, executar OCR em português no navegador, revisar os dados lidos e associar linhas aos itens da lista. O app destaca itens identificados, itens que ficaram de fora e extras.
- **Histórico de compras:** salvar localmente o mercado, a data, o total pago e o resultado da conferência da nota, com total e média das compras.
- **Crédito:** Desenvolvido por Fabio Estevam.

## Como executar

Não há etapa de instalação ou build. Para testar localmente, inicie um servidor estático na raiz do repositório:

```bash
python -m http.server 8000 --directory dist
```

Depois, acesse <http://localhost:8000> no navegador. A permissão de localização do dispositivo requer um contexto seguro, como `localhost` ou um site publicado com HTTPS.

## Como testar

Testes automatizados (Node.js 22+, sem dependências):

```bash
npm test
```

Cada teste começa pelo ID do critério de aceite que verifica (ex.: `CA-LST-06`). Os critérios que dependem de câmera, GPS ou layout estão no [roteiro manual](tests/manual.md). No GitHub, o workflow roda os testes antes de cada publicação e não publica se algum falhar.

## Como usar

1. Monte a lista: inclua itens e ajuste quantidades.
2. Use **Localizar estabelecimentos** para pesquisar uma região ou autorizar a localização do aparelho.
3. Confira o dashboard e a comparação demonstrativa da cesta.
4. Ao terminar a compra, use **Conferir compra**, fotografe a nota (ou preencha manualmente), revise os dados reconhecidos e salve o registro.

## Privacidade e limitações

- A lista, as preferências, o histórico e o cache do localizador são guardados no `localStorage` do navegador. Não há sincronização entre dispositivos; limpar os dados do navegador pode apagá-los.
- A foto da nota é processada no navegador e não é armazenada pelo app. O OCR pode interpretar incorretamente descrições e valores; revise os campos antes de salvar.
- O mecanismo e os dados de idioma do OCR são carregados de CDNs externos.
- A pesquisa regional envia a cidade, o bairro, o CEP ou as coordenadas autorizadas aos serviços públicos OpenStreetMap Nominatim e Overpass. A localização do dispositivo só é solicitada após ação do usuário.
- Os resultados do mapa dependem da cobertura e atualização dos dados abertos e podem estar incompletos. Horários exibidos, quando disponíveis, não confirmam funcionamento em tempo real.
- O app ainda não consulta preços, ofertas, estoque ou disponibilidade reais dos mercados. Os valores no comparador são dados de demonstração.

## Spec-Driven Development (SDD)

O projeto segue Spec-Driven Development: toda mudança de comportamento começa pela spec, que é aprovada antes do código, e cada critério de aceite é ligado a um teste.

- [`specs/constitution.md`](specs/constitution.md): regras do processo e princípios do produto.
- [`specs/001-compra-certa-v0.1/spec.md`](specs/001-compra-certa-v0.1/spec.md): problema, histórias de usuário e critérios de aceite (o quê e por quê).
- [`specs/001-compra-certa-v0.1/plan.md`](specs/001-compra-certa-v0.1/plan.md): arquitetura e decisões técnicas (como).
- [`specs/001-compra-certa-v0.1/tasks.md`](specs/001-compra-certa-v0.1/tasks.md): tarefas e matriz de rastreabilidade entre critérios e testes.
- [`docs/backlog.md`](docs/backlog.md): próximos itens, candidatos a novas specs.
