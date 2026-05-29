# SharePoint Schema

## Lista: InscricoesProjetos

Campos sugeridos:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Title | Texto | Sim | Nome do projeto |
| AreaResponsavel | Escolha | Sim | Área responsável |
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
| LinkPastaOneDrive | Hiperlink ou Texto | Sim | Pasta compartilhada com vídeo, apresentação e evidências |
| DataEnvio | Data e hora | Sim | Data/hora de envio |
| StatusProcessamento | Escolha | Sim | Recebido, Processando, Concluído, Erro |
| ObservacaoErro | Múltiplas linhas | Não | Erro técnico resumido |

## Evidências

O formulário não envia vídeos, PowerPoints ou arquivos em Base64. O usuário deve criar uma pasta compartilhada no OneDrive e informar o link no campo `LinkPastaOneDrive`.

## Permissões

Preferencialmente:

- Usuários preenchem o formulário sem acesso direto de edição à lista.
- Power Automate grava os dados com conexão de serviço ou usuário autorizado.
- Equipe organizadora possui acesso de leitura/edição aos resultados.
