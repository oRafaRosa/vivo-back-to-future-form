# Arquitetura Técnica

## Visão geral

```text
Usuário
  ↓
React App
  ↓ JSON + arquivos em Base64
Power Automate HTTP Trigger
  ↓
SharePoint List: item principal da inscrição
  ↓
SharePoint Document Library: fotos e evidências
  ↓
SharePoint List atualizada com links dos arquivos
```

## Por que não usar Excel como banco principal
Excel Online pode funcionar para MVP muito simples, mas não é o melhor destino para arquivos, múltiplos participantes e evidências.

Riscos do Excel como base principal:

- Concorrência de edição
- Tabela quebrar ou ser alterada manualmente
- Dificuldade para anexos
- Menos controle estrutural
- Menos escalável

## Recomendação
Usar:

- SharePoint List para os dados estruturados.
- SharePoint Document Library para arquivos.
- Exportação para Excel/Power BI apenas como saída ou relatório.

## Variáveis de ambiente

Criar `.env.example`:

```env
VITE_POWER_AUTOMATE_ENDPOINT=
VITE_MAX_FILE_SIZE_MB=25
VITE_ALLOWED_EMAIL_DOMAIN=telefonica.com
```

## Payload
Ver `docs/payload_example.json`.
