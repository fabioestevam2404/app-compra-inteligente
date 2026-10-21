# Roteiro de teste manual — Spec 001

Para os critérios de aceite que dependem de navegador, câmera, GPS, rede ou leitura humana. Execute em **um celular** (Safari iOS ou Chrome Android) e em **um desktop**, servindo o app por HTTPS (GitHub Pages ou túnel) ou por `localhost`.

**Antes de começar:** abra o app numa janela anônima, para ter o estado de primeiro acesso.

Registre cada execução na tabela do fim do arquivo.

## Lista

| CA | Passos | Resultado esperado |
|---|---|---|
| CA-LST-01 | Abrir o app pela primeira vez. | Lista vazia com a mensagem "Sua lista está vazia…". |
| CA-LST-13 | No campo Produto, digitar "arr". | O navegador sugere "Arroz branco 5 kg". |

## Dashboard

| CA | Passos | Resultado esperado |
|---|---|---|
| CA-DSH-01 | Abrir Dashboard. | Aviso destacado de que preços e mercados são ilustrativos. |
| CA-DSH-07 | Com a lista vazia, abrir Dashboard. | Mensagem pedindo para adicionar itens, sem zeros. |
| CA-DSH-08 | Incluir "Tomate" na Lista e abrir Dashboard. | Total e categorias já incluem o tomate. |

## Localizador

| CA | Passos | Resultado esperado |
|---|---|---|
| CA-LOC-01/04 | Pesquisar "Pinheiros, São Paulo" com raio de 2 km. | Até 4 cartões com nome, tipo, distância, endereço (se houver) e link "Ver no mapa" que abre o OpenStreetMap. |
| CA-LOC-02 | Pesquisar "ab". | Mensagem de erro, sem requisição na aba Rede do DevTools. |
| CA-LOC-06 | Achar um resultado com horário. | Texto "Horário no mapa: …" e, no rodapé, o aviso de que o horário não confirma funcionamento. |
| CA-LOC-07 | Recarregar e abrir a aba. | Nenhum pedido de permissão. Ao tocar em "Usar minha localização", o pedido aparece e, se aceito, os resultados ficam perto do aparelho. |
| CA-LOC-08 | Negar a permissão; abrir também por `http://IP-da-rede:8000`. | Mensagens específicas: "Permissão de localização negada…" e "A localização do dispositivo exige HTTPS ou localhost.". |
| CA-LOC-09 | Pesquisar "Xyzxyzxyz"; depois, em modo avião, pesquisar uma nova região. | "Não encontramos essa região…" e "Não foi possível concluir a pesquisa…". Os botões voltam a funcionar depois. |
| CA-LOC-11 | Ler o rodapé da aba. | Informa o envio ao OpenStreetMap e traz o link de atribuição. |
| CA-LOC-12 | Pesquisar, recarregar a página e voltar à aba. | Termo e raio já preenchidos. |

## Conferência

| CA | Passos | Resultado esperado |
|---|---|---|
| CA-CNF-01 | No celular, tocar em "Fotografar nota" e depois em "Selecionar imagem". | O primeiro abre a câmera; o segundo, a galeria ou os arquivos. |
| CA-CNF-02 | No desktop, escolher um PDF em "Selecionar imagem" (alterar o filtro para "Todos os arquivos"). | "Selecione um arquivo de imagem." Nada é processado. |
| CA-CNF-03 | Fotografar uma nota real, com o DevTools aberto na aba Rede. | Barra de progresso e percentual. A imagem não aparece em nenhuma requisição; só baixam o tesseract e os dados de idioma. |
| CA-CNF-08 | Na revisão, editar mercado, data, total, uma descrição e um valor; trocar o item de uma linha; incluir e remover uma linha. | Todas as alterações são aceitas e o resumo se atualiza. |
| CA-CNF-09 | Trocar o item de uma linha para "Extra". | O item passa de "Identificados" para "Ficaram de fora" e a linha aparece em "Extras". |
| CA-CNF-10 | Tocar em "Preencher manualmente". | A revisão abre vazia, com a data de hoje. |
| CA-CNF-11 | Tentar salvar com o mercado vazio. | Mensagem "Informe o mercado." e foco no campo Mercado. |
| CA-CNF-12 | Salvar uma conferência válida. | Abre o Histórico com o registro novo, e a conferência fica limpa. |
| CA-CNF-13 | Em modo avião, numa sessão nova, fotografar uma nota. | Erro claro de carregamento do OCR; "Preencher manualmente" continua funcionando. |
| CA-CNF-14 | Com a revisão aberta e uma linha associada, remover esse item na aba Lista e voltar. | A linha mostra "Extra (fora da lista)" e aparece em "Extras". |

## Histórico

| CA | Passos | Resultado esperado |
|---|---|---|
| CA-HST-03 | Abrir um registro e tocar em "Ver conferência". | Mercado, data, total, contagens e listas de identificados, de fora e extras. |
| CA-HST-04 | Tocar em "Excluir registro", cancelar e depois confirmar. | Cancelar mantém o registro; confirmar remove e recalcula os totais. |
| CA-HST-06 | Sem registros, abrir o Histórico. | Orientação para usar "Conferir compra". |

## Transversais

| CA | Passos | Resultado esperado |
|---|---|---|
| CA-GER-01 | DevTools no modo dispositivo, 320 px de largura, percorrer todas as abas. | Sem rolagem horizontal da página. Tabelas largas rolam dentro do próprio cartão. |
| CA-GER-02 | Só com o teclado: Tab até as abas, setas ←/→, Home e End; Tab pelos controles. | Troca de aba e foco visível. Leitor de tela anuncia o rótulo de cada controle. |
| CA-GER-03 | Com VoiceOver ou TalkBack, fazer uma pesquisa no localizador. | O status é anunciado sem mover o foco. |
| CA-GER-04 | Ativar o modo escuro do sistema. | Tema escuro com texto legível em todas as abas. |
| CA-GER-05 | Safari em navegação privada (ou bloquear cookies e dados do site). | O app funciona na sessão sem erros no console. |
| CA-GER-06 | Abrir "Histórico", fechar e reabrir o app. | Reabre no Histórico. |
| CA-GER-07 | Rolar até o rodapé. | "Desenvolvido por Fabio Estevam · Protótipo: preços do comparador são ilustrativos." |

## Registro de execuções

| Data | Versão/commit | Dispositivo e navegador | Responsável | Falhas (CA) |
|---|---|---|---|---|
| | | | | |
