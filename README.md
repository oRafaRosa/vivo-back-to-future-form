# Formulario de Inscricao de Projetos - Vivo 5G | De Volta Para o Futuro

Aplicacao React + Vite para inscricao de projetos internos, com tema futurista inspirado em "De Volta Para o Futuro", Vivo 5G, tecnologia, IA e roxo neon.

## Objetivo

Criar uma experiencia premium para inscricao de projetos internos, coletando informacoes dos participantes, descricao do projeto, resultados, uso de tecnologia/IA/automacao e evidencias como imagens, videos e apresentacoes.

## Arquitetura

React + Vite -> Power Automate -> SharePoint List + SharePoint Document Library

- SharePoint List: dados estruturados da inscricao.
- Document Library: fotos dos participantes e evidencias.
- Power Automate: camada de recebimento, gravacao e organizacao dos arquivos.

## Como rodar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Variaveis de ambiente

Crie um arquivo `.env` local usando `.env.example` como referencia:

```env
VITE_POWER_AUTOMATE_ENDPOINT=
VITE_MAX_FILE_SIZE_MB=25
VITE_ALLOWED_EMAIL_DOMAIN=telefonica.com
```

Nao commite endpoint real do Power Automate. Para GitHub Pages com Actions, configure `VITE_POWER_AUTOMATE_ENDPOINT` como secret do repositorio.

## Publicacao no GitHub Pages

O projeto inclui `.github/workflows/pages.yml`. Depois de enviar o repositorio para o GitHub:

1. Abra `Settings > Pages`.
2. Em `Build and deployment`, selecione `GitHub Actions`.
3. Configure o secret `VITE_POWER_AUTOMATE_ENDPOINT`, se o envio real estiver habilitado.
4. Faca push na branch `main`.

Tambem existe o script:

```bash
npm run deploy
```

Esse script publica a pasta `dist` via branch `gh-pages`, desde que o repositorio remoto `origin` esteja configurado.

## Assets

Os assets finais usados pelo app estao em `src/assets/media/`:

- `vivinho-logo.png`
- `delorean-car.png`

As imagens originais permanecem em `public/images/`.

## Seguranca

Este projeto foi pensado para evitar armazenamento em banco externo. O destino recomendado e Microsoft 365, usando SharePoint List e Document Library.

Projeto estruturado por R2 Solutions Group - Tech & Consulting
