# Roteiro de teste manual — Spec 001 (Compra Certa v0.1)

Cobre os critérios de aceite que dependem de navegador, câmera, GPS, rede ou avaliação humana. Os demais são verificados por `npm test`. A relação completa entre critérios e verificação está em [tasks.md](../specs/001-compra-certa-v0.1/tasks.md).

- **Duração estimada:** 45 a 60 min.
- **Ordem:** execute os casos **na sequência**. Cada bloco usa o estado deixado pelo anterior.
- **Plataforma de cada caso:** 📱 celular · 💻 desktop · 📱💻 ambos.

---

## 1. Preparação

### 1.1 Ambiente

| Item | Celular 📱 | Desktop 💻 |
|---|---|---|
| Navegador | Safari (iOS) ou Chrome (Android), versão atual | Chrome ou Edge, versão atual |
| Endereço do app | **HTTPS**: GitHub Pages ou túnel (`cloudflared`) | `http://localhost:8000` |
| Ferramentas | Câmera, GPS ligado | DevTools (F12) |

Para subir o app no desktop:

```bash
python -m http.server 8000 --directory dist
```

> O GPS **só funciona** em HTTPS ou `localhost`. Abrir no celular por `http://IP-da-rede:8000` serve apenas para o caso TM-08.

### 1.2 Limpar o estado (fazer antes de começar e quando um caso pedir)

| Plataforma | Como limpar |
|---|---|
| Safari iOS | Ajustes → Apps → Safari → Avançado → Dados dos Sites → apagar o domínio do app. Depois, feche e reabra a aba. |
| Chrome Android | No app: ⋮ → ⓘ (informações do site) → Cookies e dados do site → Apagar. |
| Desktop | DevTools → Application → Storage → **Clear site data**. |

### 1.3 Dados de teste

**Lista de teste** (incluída no TM-02):

| Produto (digitar exatamente) | Categoria | Quantidade | Unidade |
|---|---|---|---|
| Arroz branco 5 kg | Automática | 1 | Automática |
| Feijão carioca 1 kg | Automática | 2 | Automática |
| Leite integral 1 L | Automática | 6 | Automática |
| Café torrado 500 g | Automática | 1 | Automática |
| Tomate | Automática | 1 | Automática |

**Nota de exemplo:** [`tests/fixtures/nota-exemplo.html`](fixtures/nota-exemplo.html). Abra o arquivo no navegador do desktop (duplo clique), com zoom de 100% e a tela no brilho máximo. Para o desktop, salve também uma captura de tela da nota como `nota-exemplo.png`.

Valores da nota:

| Campo | Valor esperado |
|---|---|
| Mercado | SUPERMERCADO EXEMPLO LTDA |
| Data | 21/10/2026 |
| Total | 82,61 |
| Linhas | ARROZ TIPO 1 5KG (27,90) · FEIJ CARIOCA 1KG (16,98) · LEITE INTEGRAL 1L (31,74) · CHOCOLATE BARRA (6,99) |

### 1.4 Como registrar

Para cada caso, anote **✅ Passou**, **❌ Falhou** ou **⚠️ Bloqueado** na [planilha de execução](#5-registro-de-execução). Em caso de falha, anote o passo, o que aconteceu e um print. Um caso só passa se **todos** os resultados esperados forem observados.

---

## 2. Casos de teste

### Bloco A — Primeiro acesso e lista

#### TM-01 · Primeiro acesso 📱
**Critérios:** CA-LST-01, CA-DSH-07, CA-HST-06, CA-GER-07
**Pré-condição:** estado limpo (1.2).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir o app. | Aba **Lista** ativa. A mensagem "Sua lista está vazia. Adicione o primeiro item acima." aparece, sem nenhum item. |
| 2 | Tocar em **Dashboard**. | Aviso de preços ilustrativos e a mensagem "Adicione itens à lista para ver os indicadores." **Nenhum** cartão com R$ 0,00. |
| 3 | Tocar em **Histórico**. | "Nenhuma compra registrada. Use “Conferir compra” ao sair do mercado." |
| 4 | Rolar até o fim da página. | Rodapé: "Desenvolvido por Fabio Estevam · Protótipo: preços do comparador são ilustrativos." |

**Falha se:** a lista vier com itens, o dashboard mostrar zeros ou o rodapé não aparecer.

#### TM-02 · Sugestões do catálogo e montagem da lista 📱
**Critérios:** CA-LST-13 (e prepara os dados dos blocos seguintes)

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Aba **Lista**, tocar no campo **Produto** e digitar `arr`. | O teclado ou o campo sugere **"Arroz branco 5 kg"**. |
| 2 | Escolher a sugestão, quantidade `1` e tocar em **Adicionar**. | O item aparece no grupo **Mercearia**, com unidade **pct**. O campo é limpo. |
| 3 | Incluir os outros 4 itens da lista de teste (1.3). | 5 itens em 3 grupos, nesta ordem: **Hortifrúti** (Tomate, kg), **Laticínios e frios** (Leite, L), **Mercearia** (Arroz, Feijão, Café). |

**Falha se:** não houver sugestão, ou se a categoria, a unidade ou a ordem dos grupos estiver diferente.

> No Safari iOS, as sugestões do `datalist` aparecem acima do teclado. Se não aparecerem, anote ⚠️ com a versão do iOS e continue digitando os nomes completos.

---

### Bloco B — Dashboard

#### TM-03 · Aviso de demonstração e atualização 📱
**Critérios:** CA-DSH-01, CA-DSH-08

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir **Dashboard**. | Aviso em destaque: "Os preços e mercados deste comparador são **ilustrativos** e não representam ofertas reais." |
| 2 | Anotar o **Total de referência**. | Com a lista de teste: **R$ 104,51**. |
| 3 | Voltar à **Lista**, tocar em **+** no Café (vai para 2) e reabrir o **Dashboard**. | O total aumenta **R$ 18,90**, para **R$ 123,41**, sem recarregar a página. |
| 4 | Voltar à **Lista** e tocar em **−** no Café (volta para 1). | O Dashboard volta a **R$ 104,51**. |

**Falha se:** não houver aviso ou se o total não refletir a alteração.

---

### Bloco C — Localizador

#### TM-04 · Pesquisa por texto 📱
**Critérios:** CA-LOC-01, CA-LOC-04, CA-LOC-06, CA-LOC-11

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir **Localizar estabelecimentos**. Ler o texto abaixo dos resultados. | Informa que a pesquisa envia o termo ou as coordenadas ao OpenStreetMap, traz o link "OpenStreetMap" e diz que os horários não confirmam funcionamento em tempo real. |
| 2 | Digitar `Pinheiros, São Paulo`, raio **2 km**, e tocar em **Pesquisar**. | Status "Localizando a região…" e depois "Buscando estabelecimentos…". Os botões ficam desabilitados durante a busca. |
| 3 | Aguardar o resultado. | De **1 a 4** cartões, ordenados do mais perto para o mais longe. Status: "N estabelecimento(s) em até 2 km de Pinheiros, São Paulo." |
| 4 | Conferir cada cartão. | Nome (ou o tipo, se não houver nome), tipo e "aprox. X m" ou "aprox. X,X km" (sempre ≤ 2 km). Endereço ou "Endereço não informado no mapa." Horário, quando houver, como "Horário no mapa: …". |
| 5 | Tocar em **Ver no mapa** num cartão. | O OpenStreetMap abre em outra aba, com o marcador no estabelecimento. |

**Falha se:** aparecer mais de 4 cartões, alguma distância passar do raio, a ordem estiver errada ou o link não abrir o local.

> Se o serviço estiver instável (mensagem "Não foi possível concluir a pesquisa…"), aguarde 1 minuto e repita **uma** vez. Se falhar de novo, marque ⚠️ Bloqueado.

#### TM-05 · Termo curto não consulta a internet 💻
**Critérios:** CA-LOC-02

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | No desktop, abrir DevTools → **Network**, limpar a lista e abrir a aba **Localizar**. | — |
| 2 | Digitar `ab` e clicar em **Pesquisar**. | Mensagem em vermelho: "Informe uma cidade, bairro ou CEP." |
| 3 | Verificar a aba Network. | **Nenhuma** requisição para `nominatim.openstreetmap.org` nem para `overpass-api.de`. |

#### TM-06 · Termo e raio lembrados 📱
**Critérios:** CA-LOC-12

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Depois do TM-04, recarregar a página e abrir **Localizar**. | O campo traz `Pinheiros, São Paulo` e o raio está em **2 km**. |

#### TM-07 · Localização do aparelho permitida 📱
**Critérios:** CA-LOC-07
**Pré-condição:** app aberto por HTTPS; permissão de localização do site ainda não decidida (se já tiver sido, redefina nos ajustes do navegador).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Recarregar a página e navegar por todas as abas, sem tocar no botão de localização. | **Nenhum** pedido de permissão de localização aparece. |
| 2 | Em **Localizar**, tocar em **Usar minha localização**. | Status "Aguardando permissão de localização…" e o pedido de permissão do sistema. |
| 3 | Tocar em **Permitir**. | Os resultados ficam perto de onde você está. Status: "… de sua localização." |

#### TM-08 · Localização negada e página sem HTTPS 📱
**Critérios:** CA-LOC-08

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Redefinir a permissão do site, tocar em **Usar minha localização** e escolher **Não permitir**. | Mensagem: "Permissão de localização negada. Você pode pesquisar por cidade, bairro ou CEP." |
| 2 | Com o celular no mesmo Wi-Fi do PC, subir o servidor com `--bind 0.0.0.0` e abrir `http://IP-do-PC:8000`. Tocar em **Usar minha localização**. | Mensagem: "A localização do dispositivo exige HTTPS ou localhost." **Nenhum** pedido de permissão. |

#### TM-09 · Região inexistente e falha de rede 📱
**Critérios:** CA-LOC-09

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Pesquisar `Xyzxyzqwerty`. | "Não encontramos essa região. Confira a grafia ou informe cidade e estado." |
| 2 | Ativar o **modo avião** e pesquisar uma região nova (ex.: `Moema, São Paulo`). | "Não foi possível concluir a pesquisa. … Tente novamente em instantes." |
| 3 | Desativar o modo avião e pesquisar `Moema, São Paulo` de novo. | Os botões funcionam e os resultados aparecem. |

---

### Bloco D — Conferência por nota fiscal

#### TM-10 · Câmera e galeria 📱
**Critérios:** CA-CNF-01

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir **Conferir compra** e tocar em **Fotografar nota**. | Abre a **câmera traseira**. Cancelar. |
| 2 | Tocar em **Selecionar imagem**. | Abre a escolha de fotos ou arquivos (no iOS, um menu com Fototeca / Tirar Foto / Escolher Arquivo). Cancelar. |

#### TM-11 · Arquivo que não é imagem 💻
**Critérios:** CA-CNF-02

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | No desktop, em **Conferir compra**, clicar em **Selecionar imagem**, mudar o filtro para "Todos os arquivos" e escolher um `.pdf` ou `.txt`. | Mensagem: "Selecione um arquivo de imagem." Nenhuma pré-visualização nem revisão aparece. |

#### TM-12 · OCR no aparelho com a nota de exemplo 📱💻
**Critérios:** CA-CNF-03, CA-CNF-09
**Pré-condição:** lista de teste do TM-02; nota de exemplo aberta na tela do PC.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | 📱 Tocar em **Fotografar nota** e fotografar a nota na tela do PC, enquadrando só a nota, sem reflexo. | Pré-visualização da foto, barra de progresso e status "Carregando o OCR…" e depois "Lendo a nota… N%". |
| 2 | Aguardar o fim (na primeira vez, até cerca de 30 s). | Status "N linha(s) reconhecida(s). Revise antes de salvar." A seção **Revise os dados lidos** é aberta. |
| 3 | Comparar com os valores da nota (1.3). | Anotar: mercado ✔/✘, data ✔/✘, total ✔/✘ e **quantas das 4 linhas** vieram com descrição e valor corretos. *(Meta da spec: ≥ 70%, ou seja, 3 de 4.)* |
| 4 | Ver o resumo abaixo da tabela. | **Identificados:** Arroz, Feijão, Leite. **Ficaram de fora:** Café, Tomate. **Extras:** Chocolate. *(Se o OCR errou uma descrição, corrija no TM-13 antes de julgar.)* |
| 5 | 💻 No desktop, com DevTools → **Network** aberto, selecionar `nota-exemplo.png` em **Selecionar imagem**. | Só aparecem downloads do `tesseract.min.js`, do worker/core e de `por.traineddata`. **Nenhuma** requisição envia a imagem (nenhum POST/PUT com corpo de imagem). |

**Falha se:** o progresso não aparecer, a imagem for enviada, ou o resumo não corresponder às linhas exibidas. Uma leitura imprecisa do OCR **não** reprova o caso: registre a taxa de acerto do passo 3.

#### TM-13 · Edição completa da revisão 📱
**Critérios:** CA-CNF-08, CA-CNF-09

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Corrigir qualquer campo que o OCR tenha lido errado. | Os campos aceitam edição. |
| 2 | Na linha do **Chocolate**, trocar "Extra (fora da lista)" por **Café torrado 500 g**. | No resumo, Café passa para **Identificados** e Chocolate sai de **Extras**. |
| 3 | Voltar a linha para **Extra**. | O resumo volta ao estado anterior. |
| 4 | Tocar em **Adicionar linha**, digitar `PAO FRANCES` e o valor `4,50`. | A linha nova aparece em **Extras** como "PAO FRANCES — R$ 4,50". A **Soma das linhas** aumenta 4,50. |
| 5 | Remover essa linha (×). | Ela some da tabela e do resumo. |

#### TM-14 · Item removido da lista durante a revisão 📱
**Critérios:** CA-CNF-14

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Com a revisão aberta, ir à aba **Lista** e remover **Leite integral 1 L**. | — |
| 2 | Voltar a **Conferir compra**. | A linha do leite mostra **"Extra (fora da lista)"**. No resumo, ela está em **Extras** e o Leite não aparece em nenhum outro grupo. |
| 3 | Incluir de novo **Leite integral 1 L**, quantidade 6, e voltar à conferência. | A linha continua como Extra. Associar manualmente ao Leite: ela volta para **Identificados**. |

#### TM-15 · Validação ao salvar 📱
**Critérios:** CA-CNF-11

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Apagar o campo **Mercado** e tocar em **Salvar compra**. | "Informe o mercado." O cursor vai para o campo Mercado. Nada é salvo. |
| 2 | Preencher o mercado com `Supermercado Exemplo`, apagar o **Total** e salvar. | "Informe o total pago (ex.: 154,90)." Foco no Total. |
| 3 | Digitar `-5` no total e salvar. | Mesma mensagem. Nada é salvo. |
| 4 | Apagar a **Data** e salvar. | "Informe a data da compra." Foco na Data. |

#### TM-16 · Salvar a compra 📱
**Critérios:** CA-CNF-12

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Preencher Data `21/10/2026` e Total `82,61` e tocar em **Salvar compra**. | O app abre o **Histórico**, com o registro "Supermercado Exemplo · 21/10/2026 · R$ 82,61". |
| 2 | Voltar a **Conferir compra**. | A revisão está fechada e limpa, sem pré-visualização. Status "Compra salva no histórico." |

#### TM-17 · Preenchimento manual 📱
**Critérios:** CA-CNF-10

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Tocar em **Preencher manualmente**. | A revisão abre sem linhas ("Nenhuma linha reconhecida…"), com a **data de hoje** preenchida. |
| 2 | Mercado `Mercado Teste`, total `50,00`, adicionar a linha `TOMATE` `8,99` e salvar. | O registro é salvo. No histórico, o Tomate aparece em Identificados. |

#### TM-18 · OCR sem internet 📱
**Critérios:** CA-CNF-13
**Pré-condição:** abra o app numa **aba privada**, com internet, para o OCR ainda não estar em cache. Não use o OCR nessa aba. Ative o **modo avião**.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Fotografar qualquer imagem. | Mensagem: "Não foi possível carregar o mecanismo de OCR. Verifique a conexão." |
| 2 | Tocar em **Preencher manualmente**. | A revisão abre normalmente. Tocar em **Descartar**, desativar o modo avião, fechar a aba privada e voltar à aba normal. |

---

### Bloco E — Histórico

#### TM-19 · Detalhes do registro 📱
**Critérios:** CA-HST-03

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir **Histórico**. | 2 registros. O mais recente pela data vem primeiro. No topo: Compras registradas **2**, Total pago **R$ 132,61** e Média **R$ 66,31**. |
| 2 | No registro do Supermercado Exemplo, ler as etiquetas. | "3 identificado(s)", "2 fora da compra" e "1 extra(s)", ou os números que você obteve no TM-14. |
| 3 | Tocar em **Ver conferência**. | Três listas: Identificados, Ficaram de fora e Extras (com valor em R$). |

#### TM-20 · Exclusão com confirmação 📱
**Critérios:** CA-HST-04

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Tocar em **Excluir registro** no "Mercado Teste" e **Cancelar**. | O registro continua lá. |
| 2 | Repetir e **Confirmar**. | O registro some. Topo: **1** compra, Total **R$ 82,61** e Média **R$ 82,61**. |

---

### Bloco F — Transversais

#### TM-21 · Tela estreita (320 px) 💻
**Critérios:** CA-GER-01

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | DevTools → modo dispositivo (Ctrl+Shift+M), largura **320**. | — |
| 2 | Percorrer as 5 abas, abrindo a revisão da conferência ("Preencher manualmente" e adicionar uma linha). | Não há barra de rolagem horizontal **na página**. A barra de abas e a tabela da revisão podem rolar **dentro de si**. Nenhum texto ou botão cortado. |

#### TM-22 · Uso só com teclado 💻
**Critérios:** CA-GER-02

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Clicar na barra de endereço e apertar **Tab** até chegar à barra de abas. | O foco fica visível (contorno) na aba ativa. |
| 2 | Usar **→**, **←**, **Home** e **End**. | A aba muda e recebe o foco. O conteúdo acompanha. |
| 3 | Apertar **Tab** pelos controles da Lista e incluir um item só com o teclado (Enter para enviar). | Todo controle recebe foco visível, e o item é incluído. |

#### TM-23 · Leitor de tela 📱
**Critérios:** CA-GER-02, CA-GER-03

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Ativar o VoiceOver (iOS: Ajustes → Acessibilidade) ou o TalkBack (Android). | — |
| 2 | Deslizar pelos controles de um item da lista. | São lidos com nome: "Diminuir Tomate", "Quantidade de Tomate", "Aumentar Tomate", "Unidade de Tomate" e "Remover Tomate". |
| 3 | No Localizador, pesquisar `Moema, São Paulo`. | O leitor **anuncia** o status ("Localizando a região…", "N estabelecimento(s)…") sem mover o foco. |
| 4 | Desativar o leitor de tela. | — |

#### TM-24 · Modo escuro 📱
**Critérios:** CA-GER-04

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Ativar o modo escuro do sistema e voltar ao app. | Fundo escuro e texto claro em todas as abas. Aviso, etiquetas e barras do dashboard continuam legíveis. |

#### TM-25 · Armazenamento bloqueado 💻
**Critérios:** CA-GER-05

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Chrome → `chrome://settings/content/siteData` → **Não permitir que sites salvem dados** → adicionar `http://localhost:8000`. | — |
| 2 | Abrir o app, incluir um item e navegar pelas abas. | Tudo funciona. **Nenhum** erro vermelho no Console. |
| 3 | Recarregar a página. | A lista volta vazia (esperado: sem armazenamento). Remover a regra do passo 1 depois. |

#### TM-26 · Volta na última aba 📱
**Critérios:** CA-GER-06

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir **Histórico**, fechar a aba do navegador e abrir o app de novo. | Abre direto no **Histórico**. |

---

## 3. Critérios de saída

- **Aprovado:** todos os casos ✅, ou ⚠️ apenas por indisponibilidade de serviço externo (TM-04, TM-09), registrada com horário.
- **Reprovado:** qualquer ❌. Abra um defeito `DEF-NN` na spec (seção 7), ligado ao critério violado, e corrija seguindo a [constituição](../specs/constitution.md).
- Registre também a **taxa de acerto do OCR** (TM-12, passo 3), que alimenta a métrica de sucesso da spec.

## 4. Rastreabilidade (critério → caso)

| Critério | Caso | | Critério | Caso |
|---|---|---|---|---|
| CA-LST-01 | TM-01 | | CA-CNF-08 | TM-13 |
| CA-LST-13 | TM-02 | | CA-CNF-09 | TM-12, TM-13 |
| CA-DSH-01 | TM-03 | | CA-CNF-10 | TM-17 |
| CA-DSH-07 | TM-01 | | CA-CNF-11 | TM-15 |
| CA-DSH-08 | TM-03 | | CA-CNF-12 | TM-16 |
| CA-LOC-01 | TM-04 | | CA-CNF-13 | TM-18 |
| CA-LOC-02 | TM-05 | | CA-CNF-14 | TM-14 |
| CA-LOC-04 | TM-04 | | CA-HST-03 | TM-19 |
| CA-LOC-06 | TM-04 | | CA-HST-04 | TM-20 |
| CA-LOC-07 | TM-07 | | CA-HST-06 | TM-01 |
| CA-LOC-08 | TM-08 | | CA-GER-01 | TM-21 |
| CA-LOC-09 | TM-09 | | CA-GER-02 | TM-22, TM-23 |
| CA-LOC-11 | TM-04 | | CA-GER-03 | TM-23 |
| CA-LOC-12 | TM-06 | | CA-GER-04 | TM-24 |
| CA-CNF-01 | TM-10 | | CA-GER-05 | TM-25 |
| CA-CNF-02 | TM-11 | | CA-GER-06 | TM-26 |
| CA-CNF-03 | TM-12 | | CA-GER-07 | TM-01 |

## 5. Registro de execução

**Execução:** data ____/____/______ · commit `_______` · responsável ____________________
**Celular:** __________________ (navegador e versão) · **Desktop:** __________________

| Caso | Resultado | Observação / defeito |
|---|---|---|
| TM-01 | | |
| TM-02 | | |
| TM-03 | | |
| TM-04 | | |
| TM-05 | | |
| TM-06 | | |
| TM-07 | | |
| TM-08 | | |
| TM-09 | | |
| TM-10 | | |
| TM-11 | | |
| TM-12 | | Acerto do OCR: __/4 linhas · mercado ☐ data ☐ total ☐ |
| TM-13 | | |
| TM-14 | | |
| TM-15 | | |
| TM-16 | | |
| TM-17 | | |
| TM-18 | | |
| TM-19 | | |
| TM-20 | | |
| TM-21 | | |
| TM-22 | | |
| TM-23 | | |
| TM-24 | | |
| TM-25 | | |
| TM-26 | | |
