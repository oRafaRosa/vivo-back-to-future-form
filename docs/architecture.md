# Arquitetura Técnica

## Visão geral

```text
Usuário
  ↓
React App
  ↓ JSON
Power Automate HTTP Trigger
  ↓
SharePoint List: item principal da inscrição
  ↓
Link OneDrive: pasta compartilhada com vídeo, apresentação e evidências
```

## Por que não enviar vídeos e apresentações pelo formulário

Arquivos grandes aumentam o tempo de envio, exigem armazenamento adicional e tornam o fluxo mais sensível a falhas. Para simplificar o MVP, o usuário deve criar uma pasta no OneDrive, colocar nela o vídeo, a apresentação e as evidências, compartilhar a pasta e informar o link no formulário.

## Recomendação

Usar:

- SharePoint List para os dados estruturados.
- OneDrive compartilhado pelo usuário para evidências.
- Exportação para Excel/Power BI apenas como saída ou relatório.

## Rascunho local

As respostas são salvas no cache do navegador via `localStorage`, para evitar perda de preenchimento se a página for atualizada.

## Variáveis de ambiente

Criar `.env.example`:

```env
VITE_POWER_AUTOMATE_ENDPOINT=
VITE_ALLOWED_EMAIL_DOMAIN=telefonica.com
```

## Payload

Ver `docs/payload_example.json`.
