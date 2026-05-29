# Formulário de Inscrição de Projetos - Vivo | De Volta Para o Futuro

Aplicação React + Vite para inscrição de projetos internos, com tema futurista inspirado em "De Volta Para o Futuro", Vivo, tecnologia, IA e roxo neon.

## Objetivo

Criar uma experiência premium para inscrição de projetos internos, coletando área responsável, liderança, coparticipantes, ganho financeiro, descrição do projeto, impacto estratégico, produtos impactados, resultados esperados e o link da pasta compartilhada no OneDrive com as evidências.

## Arquitetura

React + Vite -> Power Automate -> SharePoint List

- SharePoint List: dados estruturados da inscrição.
- Power Automate: camada de recebimento e gravação dos dados.
- OneDrive: armazenamento das evidências em pasta compartilhada pelo usuário.

## Como rodar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Exportação XLSX

Na etapa de revisão e na confirmação final, o usuário pode baixar um arquivo `.xlsx` com as respostas organizadas. O formulário não coleta foto de perfil nem armazena vídeos ou apresentações.

## Variáveis de ambiente

Crie um arquivo `.env` local usando `.env.example` como referência:

```env
VITE_POWER_AUTOMATE_ENDPOINT=
VITE_ALLOWED_EMAIL_DOMAIN=telefonica.com
```

Não commite endpoint real do Power Automate. Para GitHub Pages com Actions, configure `VITE_POWER_AUTOMATE_ENDPOINT` como secret do repositório.

## Publicação no GitHub Pages

O projeto inclui `.github/workflows/pages.yml`. Depois de enviar o repositório para o GitHub:

1. Abra `Settings > Pages`.
2. Em `Build and deployment`, selecione `GitHub Actions`.
3. Configure o secret `VITE_POWER_AUTOMATE_ENDPOINT`, se o envio real estiver habilitado.
4. Faça push na branch `main`.

Também existe o script:

```bash
npm run deploy
```

Esse script publica a pasta `dist` via branch `gh-pages`, desde que o repositório remoto `origin` esteja configurado.

## Assets

Os assets finais usados pelo app estão em `src/assets/media/`:

- `vivinho-logo.png`
- `delorean-car.png`

As imagens originais permanecem em `public/images/`.

## Segurança

Este projeto foi pensado para evitar armazenamento em banco externo. O destino recomendado segue o ambiente corporativo homologado.

Projeto desenvolvido por Gabriela Paula da Silva
