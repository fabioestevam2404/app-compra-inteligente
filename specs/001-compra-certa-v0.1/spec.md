# Spec 001 — Compra Certa v0.1

| Campo | Valor |
|---|---|
| Status | **Aprovada** (21/10/2026) |
| Tipo | Spec retroativa (o código v0.1 já existe; esta spec passa a ser a referência) |
| Autor | Fabio Estevam |
| Criada em | 21/10/2026 |
| Constituição | [../constitution.md](../constitution.md) |

> Esta spec descreve **o quê** e **por quê**. Decisões de **como** (arquitetura, bibliotecas, armazenamento) ficam em `plan.md`, que será escrito depois da aprovação.

## 1. Problema

Quem faz compras de mercado planeja uma lista, escolhe onde comprar e, ao final, não tem um jeito simples de conferir se o que levou e pagou corresponde ao planejado. Hoje essas três etapas ficam em ferramentas diferentes (papel, app de mapas, a própria nota) ou nem acontecem.

## 2. Objetivo

Um único app, usado no celular, que acompanha a compra do começo ao fim: **planejar → escolher onde comprar → conferir e registrar o que foi pago**.

### Fora de escopo nesta versão
- Preços, ofertas, estoque ou disponibilidade reais.
- Conta de usuário, sincronização entre aparelhos ou backend.
- Leitura do QR Code da NFC-e.
- Ligação entre os estabelecimentos do localizador e o comparador de preços.

## 3. Usuários e cenário principal

**Persona:** pessoa que faz a compra do mês ou da semana, usa o celular dentro do mercado e quer controlar o gasto.

**Cenário:** em casa, a pessoa ajusta a lista e vê quanto a cesta deve custar. Antes de sair, procura mercados próximos. Depois de pagar, fotografa a nota, confere o que veio e o que ficou faltando, e salva o valor pago.

## 4. Histórias de usuário e critérios de aceite

Prioridade: **P1** é essencial para a v0.1 fazer sentido; **P2** agrega valor, mas o app funciona sem.

---

### US-LST — Manter a lista de compras (P1)

*Como comprador, quero montar e ajustar minha lista por categoria, para saber o que preciso comprar.*

| ID | Critério de aceite |
|---|---|
| CA-LST-01 | **Dado** que é o primeiro acesso, **quando** o app abre, **então** a lista está vazia e mostra uma orientação para incluir o primeiro item. *(Q5; hoje vem com itens de exemplo: DIV-01)* |
| CA-LST-02 | **Dado** a lista, **então** os itens aparecem agrupados por categoria, na ordem fixa: Hortifrúti, Açougue e peixaria, Laticínios e frios, Mercearia, Padaria, Bebidas, Limpeza, Higiene, Outros. Categorias sem itens não aparecem. |
| CA-LST-03 | **Dado** um produto que existe no catálogo, **quando** o usuário o inclui com categoria e unidade em "Automática", **então** o item recebe o nome, a categoria e a unidade do catálogo. |
| CA-LST-04 | **Dado** um produto fora do catálogo, **quando** o usuário o inclui com categoria e unidade em "Automática", **então** o item entra em "Outros" com unidade "un". |
| CA-LST-05 | **Dado** que o usuário escolheu categoria ou unidade, **quando** inclui o item, **então** a escolha do usuário prevalece sobre o catálogo. |
| CA-LST-06 | **Dado** que já existe um item com o mesmo nome (sem diferenciar acentos e maiúsculas) **e a mesma unidade**, **quando** o usuário o inclui de novo, **então** a quantidade é somada ao item existente, sem criar duplicata. Se a unidade for diferente, um novo item é criado, sem conversão. *(Q2)* |
| CA-LST-07 | **Dado** um nome vazio ou quantidade ≤ 0, **quando** o usuário tenta incluir, **então** nada é incluído. |
| CA-LST-08 | **Dado** um item, **quando** o usuário toca em + ou −, **então** a quantidade muda em 0,5 para kg, 100 para g e ml, e 1 para as demais unidades, nunca ficando abaixo de 0. |
| CA-LST-09 | **Dado** um item, **quando** o usuário digita uma quantidade ou troca a unidade, **então** a alteração é salva. Uma quantidade inválida ou negativa vira 0. |
| CA-LST-10 | **Dado** um item com quantidade 0, **então** ele continua visível na lista, mas não entra no dashboard nem na conferência. *(Q1)* |
| CA-LST-11 | **Dado** um item, **quando** o usuário toca em remover, **então** o item sai da lista. |
| CA-LST-12 | **Dado** qualquer alteração na lista, **quando** o usuário fecha e reabre o app no mesmo navegador, **então** a lista aparece como foi deixada. |
| CA-LST-13 | **Dado** o campo de produto, **quando** o usuário digita, **então** são sugeridos produtos do catálogo. |

---

### US-DSH — Ver quanto a cesta deve custar (P2)

*Como comprador, quero ver onde está o maior gasto e uma comparação entre mercados, para planejar quanto vou gastar.*

| ID | Critério de aceite |
|---|---|
| CA-DSH-01 | **Dado** o dashboard, **então** há um aviso visível de que preços e mercados do comparador são ilustrativos e não representam ofertas reais. (P1 da constituição) |
| CA-DSH-02 | **Dado** itens com quantidade > 0, **então** o dashboard mostra o nº de itens e o total de referência = Σ (quantidade × preço de referência). |
| CA-DSH-03 | **Dado** itens com quantidade > 0, **então** o dashboard mostra a categoria com maior gasto e a sua participação percentual no total. |
| CA-DSH-04 | **Dado** itens com quantidade > 0, **então** cada categoria aparece com valor e participação %, da maior para a menor. As participações somam 100% (± arredondamento). |
| CA-DSH-05 | **Dado** itens com quantidade > 0, **então** cada mercado de demonstração aparece com o total da cesta, do menor para o maior. O primeiro é marcado como "Menor cesta" e os demais mostram a diferença % = (total − menor) ÷ menor. |
| CA-DSH-06 | **Dado** a mesma lista, **quando** o dashboard é aberto várias vezes, **então** os valores de demonstração são sempre os mesmos (não mudam a cada visita). |
| CA-DSH-07 | **Dado** uma lista sem itens com quantidade > 0, **então** o dashboard pede para adicionar itens, em vez de mostrar zeros. |
| CA-DSH-08 | **Dado** uma alteração na lista, **quando** o usuário abre o dashboard, **então** os valores já refletem a alteração. |

---

### US-LOC — Encontrar estabelecimentos próximos (P2)

*Como comprador, quero ver mercados perto de um lugar ou de mim, para decidir onde comprar.*

| ID | Critério de aceite |
|---|---|
| CA-LOC-01 | **Dado** um termo de cidade, bairro ou CEP com 3 caracteres ou mais e um raio de 1, 2, 5 ou 10 km, **quando** o usuário pesquisa, **então** são exibidos até 4 estabelecimentos dentro do raio. |
| CA-LOC-02 | **Dado** um termo com menos de 3 caracteres, **quando** o usuário pesquisa, **então** aparece uma mensagem pedindo cidade, bairro ou CEP, e nenhuma consulta externa é feita. |
| CA-LOC-03 | **Dado** um termo composto só por dígitos, espaços, ponto e hífen que somem 8 dígitos, **então** ele é tratado como CEP. |
| CA-LOC-04 | **Dado** cada resultado, **então** são exibidos: nome (ou o tipo, se não houver nome), tipo, distância aproximada (em m abaixo de 1 km, em km acima), endereço quando houver, horário quando houver e link para o mapa. |
| CA-LOC-05 | **Dado** que há mais de 4 candidatos, **então** a escolha prioriza estabelecimentos com nome, depois supermercados e atacados, depois os mais próximos. A lista exibida fica ordenada por distância. |
| CA-LOC-06 | **Dado** um horário exibido, **então** a interface avisa que ele não confirma funcionamento em tempo real. |
| CA-LOC-07 | **Dado** que o usuário toca em "Usar minha localização", **então** a permissão é pedida nesse momento, nunca antes. Se ela for concedida, a pesquisa usa as coordenadas do aparelho. |
| CA-LOC-08 | **Dado** permissão negada, tempo esgotado, navegador sem suporte ou página fora de HTTPS/localhost, **então** aparece uma mensagem específica para cada caso, sugerindo pesquisar por texto. |
| CA-LOC-09 | **Dado** uma região não encontrada, nenhum estabelecimento no raio ou falha do serviço, **então** aparece uma mensagem específica, e o usuário pode tentar de novo. |
| CA-LOC-10 | **Dado** a mesma pesquisa repetida em até 24 h, **então** o resultado vem do aparelho, sem nova consulta externa. |
| CA-LOC-11 | **Dado** a tela do localizador, **então** ela informa que o termo ou as coordenadas são enviados ao OpenStreetMap e traz a atribuição dos dados. (P2 da constituição) |
| CA-LOC-12 | **Dado** uma pesquisa feita, **quando** o usuário volta ao localizador em outra visita, **então** o último termo e o raio já estão preenchidos. |

---

### US-CNF — Conferir a compra pela nota fiscal (P1)

*Como comprador, quero fotografar a nota e ver o que da minha lista veio, o que ficou de fora e o que comprei a mais.*

| ID | Critério de aceite |
|---|---|
| CA-CNF-01 | **Dado** a tela de conferência, **então** há uma opção para abrir a câmera e outra para escolher uma imagem já salva. |
| CA-CNF-02 | **Dado** que o usuário escolhe um arquivo que não é imagem, **então** aparece um erro e nada é processado. |
| CA-CNF-03 | **Dado** uma imagem, **então** o reconhecimento de texto em português acontece no aparelho, com indicação de progresso, e a imagem não é salva nem enviada a servidores. |
| CA-CNF-04 | **Dado** o texto reconhecido, **então** o app propõe: nome do mercado (primeira linha com texto que não seja CNPJ/CPF), data (primeira data dd/mm/aaaa ou dd/mm/aa válida) e total pago (último valor em linha de "total", ignorando subtotal). |
| CA-CNF-05 | **Dado** o texto reconhecido, **então** vira linha de item toda linha que termina em valor monetário, exceto total, subtotal, desconto, acréscimo, troco, forma de pagamento e tributos. Número do item, código de barras e "QTD UN X VALOR" são retirados da descrição. |
| CA-CNF-06 | **Dado** que nenhum total foi encontrado, **então** o total proposto é a soma das linhas. |
| CA-CNF-07 | **Dado** cada linha, **então** o app sugere o item da lista correspondente quando o produto principal do item (primeira palavra significativa) aparece na descrição, aceitando abreviações de 3 letras ou mais (ex.: "FEIJ" → "Feijão"), e ao menos metade das palavras significativas do item aparecem. Caso contrário, a linha fica como "Extra". |
| CA-CNF-08 | **Dado** a revisão, **então** o usuário pode editar mercado, data, total, descrição e valor de cada linha, trocar o item associado, incluir e remover linhas. (P3 da constituição) |
| CA-CNF-09 | **Dado** a revisão, **então** o app mostra, atualizado a cada mudança: itens identificados, itens da lista que ficaram de fora, extras (linhas sem item) e a soma das linhas. |
| CA-CNF-10 | **Dado** que o usuário não quer ou não consegue usar foto, **então** ele pode preencher a conferência manualmente, com a data de hoje já preenchida. |
| CA-CNF-11 | **Dado** mercado vazio, total vazio, inválido ou negativo, ou data vazia, **quando** o usuário salva, **então** o registro não é salvo e o primeiro campo com problema recebe foco e mensagem. *(Q4; hoje o mercado é opcional: DIV-02)* |
| CA-CNF-15 | **Dado** a conferência, **então** ela verifica só a **presença** de cada item da lista na nota, sem comparar quantidade ou preço. *(Q3; comparação de quantidade e preço fica para uma spec futura)* |
| CA-CNF-12 | **Dado** dados válidos, **quando** o usuário salva, **então** a compra entra no histórico, a revisão é limpa e o app abre o histórico. |
| CA-CNF-13 | **Dado** que a ferramenta de OCR não carrega (sem internet, por exemplo), **então** aparece um erro claro, e o preenchimento manual continua disponível. |
| CA-CNF-14 | **Dado** uma linha associada a um item que depois é removido da lista, **então** a linha passa a contar como "Extra". *(hoje a linha some do resumo: defeito DEF-02)* |

---

### US-HST — Acompanhar o histórico de compras (P1)

*Como comprador, quero ver as compras registradas, para acompanhar quanto gasto.*

| ID | Critério de aceite |
|---|---|
| CA-HST-01 | **Dado** registros salvos, **então** eles aparecem do mais recente para o mais antigo pela data da compra. No mesmo dia, o salvo por último vem primeiro. |
| CA-HST-02 | **Dado** registros salvos, **então** o topo mostra a quantidade de compras, o total pago somado e a média por compra. |
| CA-HST-03 | **Dado** cada registro, **então** são exibidos o mercado, a data, o total pago e a contagem de identificados, fora da compra e extras, com o detalhe de cada grupo. |
| CA-HST-04 | **Dado** um registro, **quando** o usuário pede para excluir, **então** o app pede confirmação. Se o usuário confirmar, o registro é removido e os totais são recalculados. |
| CA-HST-05 | **Dado** registros salvos, **quando** o usuário fecha e reabre o app no mesmo navegador, **então** o histórico continua lá. |
| CA-HST-06 | **Dado** nenhum registro, **então** o app mostra uma orientação para usar "Conferir compra". |

---

## 5. Requisitos transversais

| ID | Critério de aceite |
|---|---|
| CA-GER-01 | **Dado** um celular com tela de 320 px de largura, **então** todas as telas podem ser usadas sem rolagem horizontal da página. |
| CA-GER-02 | **Dado** o uso só por teclado, **então** é possível trocar de aba com Tab e com as setas/Home/End, e todos os controles têm rótulo acessível. |
| CA-GER-03 | **Dado** mensagens de status (pesquisa, OCR, erros), **então** elas são anunciadas por leitores de tela. |
| CA-GER-04 | **Dado** o sistema em modo escuro, **então** o app usa tema escuro legível. |
| CA-GER-05 | **Dado** um navegador que bloqueia o armazenamento local, **então** o app continua funcionando durante a sessão, sem erro, mas não guarda os dados. |
| CA-GER-06 | **Dado** o app reaberto, **então** ele volta na última aba usada. |
| CA-GER-07 | **Dado** o rodapé, **então** aparece o crédito "Desenvolvido por Fabio Estevam" e o aviso de protótipo. |

## 6. Decisões de produto (21/10/2026)

| ID | Questão | Decisão |
|---|---|---|
| Q1 | Item zerado continua na lista? | **Sim**, continua visível e é ignorado nos cálculos e na conferência. |
| Q2 | Item repetido com outra unidade? | **Soma só se a unidade for igual.** Unidade diferente cria um novo item, sem conversão. |
| Q3 | A conferência compara quantidade e preço? | **Não na v0.1**, só presença. Quantidade e preço viram uma spec futura. |
| Q4 | Mercado obrigatório para salvar? | **Sim.** |
| Q5 | A lista começa com exemplos? | **Não**, começa vazia. |

## 7. Divergências entre o código v0.1 e esta spec

Toda divergência será resolvida no código (constituição, item 5).

| ID | Tipo | Descrição | Critério |
|---|---|---|---|
| DEF-01 | Defeito | Item repetido com unidade diferente tem a quantidade somada sem conversão (500 g + 1 kg = "501 kg"). | CA-LST-06 |
| DEF-02 | Defeito | Uma linha associada a um item removido da lista some do resumo, em vez de virar "Extra". | CA-CNF-14 |
| DIV-01 | Mudança de produto | A lista começa com 11 itens de exemplo. | CA-LST-01 |
| DIV-02 | Mudança de produto | O mercado é opcional ao salvar a conferência. | CA-CNF-11 |

## 8. Métricas de sucesso (protótipo)

- Uma pessoa sem instrução prévia consegue ir da lista até a compra salva no histórico em menos de 3 minutos, com uma nota real.
- Em notas fiscais nítidas, ao menos 70% das linhas de produto são reconhecidas com o valor correto, sem edição.

## 9. Aprovação

- [x] Questões Q1–Q5 decididas (21/10/2026)
- [x] Critérios de aceite revisados
- [x] Spec aprovada por: Fabio Estevam em 21/10/2026
