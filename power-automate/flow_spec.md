# Especificação do Fluxo Power Automate

## Nome sugerido
`Receber Inscricao Projetos Vivo 5G`

## Gatilho
`When an HTTP request is received`

## Entrada
JSON conforme `docs/payload_example.json`.

## Passos recomendados

### 1. Receber payload
Configurar o schema do gatilho HTTP usando o payload de exemplo.

### 2. Criar item na SharePoint List
Criar item na lista `InscricoesProjetos` com os principais dados do projeto.

Campos sugeridos:

- Title = Nome do projeto
- DataInicioProjeto
- ProblemaResolvido
- MetaEstrategicaVP
- ResultadosGerados
- UsaTecnologia
- DescricaoTecnologia
- PaixaoPurpura
- PotencialExpansao
- ParticipantesJson
- StatusProcessamento
- DataEnvio

### 3. Criar pasta na biblioteca
Criar pasta na Document Library `EvidenciasProjetos` usando o ID do item criado.

Padrão sugerido:

```text
/EvidenciasProjetos/Projeto-{ID}-{NomeProjetoSanitizado}/
```

Subpastas:

```text
/fotos-participantes/
/evidencias/
/video/
/powerpoint/
```

### 4. Salvar fotos dos participantes
Para cada participante:

- Decodificar Base64.
- Criar arquivo em `/fotos-participantes/`.
- Guardar link do arquivo.

### 5. Salvar evidências
Salvar vídeo, PowerPoint e evidências adicionais nas respectivas pastas.

### 6. Atualizar item da lista
Atualizar o item criado com:

- LinksFotosParticipantes
- LinkVideo
- LinkPowerPoint
- LinksEvidenciasAdicionais
- StatusProcessamento = Concluído

### 7. Responder ao React
Retornar status `200` com:

```json
{
  "success": true,
  "itemId": 123,
  "message": "Inscrição recebida com sucesso."
}
```

## Tratamento de erro
Se qualquer etapa falhar:

- Atualizar StatusProcessamento como `Erro`, se o item já tiver sido criado.
- Retornar status adequado para o front.
- Não expor detalhes técnicos ao usuário final.

## Observação importante
Validar com TI/Segurança da Informação se o gatilho HTTP pode ser usado no tenant da Vivo. Se houver bloqueio, avaliar alternativa com Power Apps, Power Pages ou SharePoint Framework.
