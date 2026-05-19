# AGENTS.md — Formulário de Inscrição de Projetos | Vivo 5G

## Papel do agente
Você é o agente responsável por desenvolver um formulário web em React para inscrição de projetos internos da Vivo/Telefônica Brasil, com tema visual “De Volta Para o Futuro”, tecnologia, inteligência artificial e roxo neon Vivo.

O objetivo é entregar uma experiência visual moderna, animada, futurista e corporativa, mas sem comprometer segurança, LGPD ou aderência ao ecossistema Microsoft 365.

## Regra principal
Antes de codar, leia todos os arquivos da pasta `docs/`, especialmente:

- `docs/project_brief.md`
- `docs/questions.md`
- `docs/questions.json`
- `docs/architecture.md`
- `docs/visual_guidelines.md`
- `power-automate/flow_spec.md`
- `sharepoint/sharepoint_schema.md`

Não invente campos fora do escopo sem registrar no README ou perguntar ao responsável.

## Stack esperada
Use preferencialmente:

- React + Vite
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide React
- React Hook Form ou estado controlado simples
- Zod para validação, se fizer sentido

Evite dependências pesadas sem necessidade.

## Estilo de código
- Código limpo, componentizado e fácil de manter.
- Comentários em pt-BR, simples e naturais, apenas quando ajudarem.
- Evite comentários óbvios.
- Nomeie componentes e funções de forma clara.
- Priorize acessibilidade mínima: labels, contraste, foco de teclado e mensagens de erro.
- Não deixar URLs, tokens, endpoints ou dados sensíveis hardcoded.
- Usar `.env` para endpoints e configurações.

## UX obrigatória
O formulário deve ser em etapas, não uma tela única gigante.

Etapas sugeridas:

1. Boas-vindas
2. Participantes
3. Informações do projeto
4. Estratégia e resultados
5. Tecnologia, IA e automação
6. Cultura e expansão
7. Evidências
8. Revisão e envio
9. Confirmação

Deve ter:

- Barra de progresso
- Botões Voltar/Avançar
- Validação por etapa
- Upload com drag-and-drop
- Preview de fotos dos participantes
- Componente dinâmico de participantes: adicionar/remover participante
- Revisão final antes do envio
- Tela de sucesso animada
- Tratamento visual de erro no envio

## Identidade visual obrigatória
Tema: “De Volta Para o Futuro”.

Elementos desejados:

- Fundo preto ou grafite muito escuro
- Roxo neon Vivo como cor principal
- Luzes, glow, partículas, grids e linhas futuristas
- Referência visual a viagem no tempo
- Carro inspirado no DeLorean/de volta para o futuro como elemento visual
- Vivinho/logo Vivo 5G em destaque, usando arquivo em `src/assets/media/` quando disponível
- Visual tecnológico, IA, automação, dados e futuro

Use as imagens de `src/assets/reference/` apenas como referência visual. Os assets finais devem ser salvos em `src/assets/media/`.

## Animações
Usar animações com bom senso. A experiência deve parecer premium, não carnaval de CSS.

Sugestões:

- Entrada suave dos cards
- Glow pulsando no roxo Vivo
- Grid de fundo em movimento lento
- Partículas discretas
- Linha neon passando atrás do carro
- Transição entre etapas com Framer Motion
- Botão com hover futurista
- Confirmação final com animação de sucesso

## Integração com Power Automate
O front deve enviar os dados para um endpoint configurado via variável de ambiente:

```env
VITE_POWER_AUTOMATE_ENDPOINT=https://...
```

Nunca commitar endpoint real.

Payload esperado documentado em `docs/payload_example.json`.

Arquivos devem ser enviados em Base64 para o Power Automate no MVP, respeitando validação de tamanho e extensão.

## LGPD e segurança
- Não usar banco externo, Supabase, Firebase, Airtable ou similares.
- O destino das respostas deve ser SharePoint List e SharePoint Document Library.
- Não coletar dados além dos necessários.
- Exibir aviso curto de uso dos dados na tela inicial ou antes do envio.
- Não armazenar respostas em localStorage, exceto rascunho temporário se explicitamente solicitado depois.
- Não expor endpoint em código fonte além do necessário via env de build.

## Assets
A pasta `src/assets/media/` existe para salvar:

- `vivinho-logo.png`
- `vivo-5g-logo.png`
- `delorean-car.png`
- `neon-clock.png`
- `bg-grid.png`
- outros assets finais

Enquanto os assets finais não existirem, use placeholders visuais em CSS ou SVG simples.

## Entrega esperada
Ao finalizar, o projeto deve rodar com:

```bash
npm install
npm run dev
```

E deve gerar build com:

```bash
npm run build
```

## Critérios de aceite
- Formulário navega entre etapas sem perder dados.
- Participantes podem ser adicionados/removidos.
- Cada participante pode ter foto individual.
- Evidências aceitam vídeo e PowerPoint.
- Revisão mostra resumo antes do envio.
- Payload enviado segue `docs/payload_example.json`.
- Visual segue o tema “De Volta Para o Futuro” + Vivo 5G + roxo neon.
- Nenhum segredo/token está commitado.

## Assinatura técnica
Quando fizer sentido em rodapé discreto ou comentário de documentação, pode usar:

`Projeto estruturado por R² Solutions Group – Tech & Consulting`
