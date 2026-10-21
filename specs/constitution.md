# Constituição — Compra Certa

Princípios que valem para **todas** as specs e mudanças do projeto. Uma spec ou um plano que contrarie um princípio precisa alterar esta constituição primeiro, de forma explícita.

## Processo (Spec-Driven Development)

1. **A spec vem antes do código.** Toda mudança de comportamento começa alterando `specs/NNN-*/spec.md`. O código é derivado da spec, nunca o contrário.
2. **Fluxo obrigatório:** `spec.md` (o quê e por quê) → aprovação → `plan.md` (como) → `tasks.md` (passos) → implementação → verificação.
3. **Todo critério de aceite é verificável** e tem ID estável (`CA-XXX-NN`). IDs não são reaproveitados; um critério removido fica marcado como *removido*.
4. **Rastreabilidade:** cada critério de aceite aponta para um teste automatizado ou, quando não for automatizável, para um roteiro de teste manual. Cada tarefa aponta para os critérios que atende.
5. **Divergência entre código e spec é defeito**, e se resolve corrigindo o código ou alterando a spec com aprovação. Nunca fica implícita.

## Princípios do produto

- **P1 — Honestidade sobre os dados.** Todo valor ilustrativo é identificado como tal na interface. O app nunca apresenta preço demonstrativo como oferta real.
- **P2 — Privacidade por padrão.** Os dados do usuário ficam no aparelho. Nada é enviado a terceiros sem ação explícita do usuário, e todo envio é informado na interface.
- **P3 — O usuário confirma o que a máquina lê.** Resultados de OCR e associações automáticas são sempre revisáveis e editáveis antes de serem salvos.
- **P4 — Mobile-first e acessível.** Utilizável em telas a partir de 320 px, por teclado e por leitor de tela.
- **P5 — Simplicidade de operação.** Sem etapa de build nem backend enquanto o produto for protótipo. Qualquer servidor estático deve bastar.
