# SharePoint Schema

## Lista: InscricoesProjetos

Campos sugeridos:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Title | Texto | Sim | Nome do projeto |
| AreaResponsavel | Texto ou escolha | Sim | Área responsável |
| LiderProjeto | Texto | Sim | Líder do projeto |
| EmailLider | Texto | Sim | E-mail corporativo do líder |
| CoParticipantesJson | Múltiplas linhas | Não | Lista de coparticipantes em JSON |
| PossuiGanhoFinanceiro | Sim/Não | Sim | Indica ganho financeiro |
| DescricaoGanhoFinanceiro | Múltiplas linhas | Condicional | Obrigatório se houver ganho financeiro |
| ObjetivoProjeto | Múltiplas linhas | Sim | Objetivo do projeto |
| DescricaoProjeto | Múltiplas linhas | Sim | Descrição executiva do projeto |
| ImpactoEstrategico | Múltiplas linhas ou escolha múltipla | Sim | Impactos selecionados |
| SituacaoAtualAsIs | Múltiplas linhas | Sim | Situação atual |
| SituacaoFuturaToBe | Múltiplas linhas | Sim | Situação futura |
| BeneficiosProjeto | Múltiplas linhas | Sim | Benefícios |
| ProdutosImpactados | Múltiplas linhas ou escolha múltipla | Sim | Produtos impactados |
| Premissas | Múltiplas linhas | Não | Premissas do projeto |
| ResultadosEsperados | Múltiplas linhas | Sim | Resultados esperados |
| LinkVideo | Hiperlink ou Texto | Não | Vídeo do projeto |
| LinkPowerPoint | Hiperlink ou Texto | Não | Apresentação |
| LinksEvidenciasAdicionais | Múltiplas linhas | Não | URLs adicionais |
| DataEnvio | Data e hora | Sim | Data/hora de envio |
| StatusProcessamento | Escolha | Sim | Recebido, Processando, Concluído, Erro |
| ObservacaoErro | Múltiplas linhas | Não | Erro técnico resumido |

## Biblioteca: EvidenciasProjetos

Finalidade: armazenar vídeos, PowerPoints e evidências complementares.

Estrutura recomendada por inscrição:

```text
EvidenciasProjetos/
└─ Projeto-{ID}-{NomeProjetoSanitizado}/
   ├─ video/
   ├─ powerpoint/
   └─ evidencias/
```

## Permissões

Preferencialmente:

- Usuários preenchem o formulário sem acesso direto de edição à lista.
- Power Automate grava os dados com conexão de serviço ou usuário autorizado.
- Equipe organizadora possui acesso de leitura/edição aos resultados.
