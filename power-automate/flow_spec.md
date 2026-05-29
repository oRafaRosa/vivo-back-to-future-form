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
- AreaResponsavel
- LiderProjeto
- EmailLider
- CoParticipantesJson
- PossuiGanhoFinanceiro
- DescricaoGanhoFinanceiro
- ObjetivoProjeto
- DescricaoProjeto
- ImpactoEstrategico
- SituacaoAtualAsIs
- SituacaoFuturaToBe
- BeneficiosProjeto
- ProdutosImpactados
- Premissas
- ResultadosEsperados
- LinkPastaOneDrive
- StatusProcessamento
- DataEnvio

### 3. Atualizar status

Após criar o item:

- StatusProcessamento = Concluído

### 4. Responder ao React

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
