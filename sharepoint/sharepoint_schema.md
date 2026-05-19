# SharePoint Schema

## Lista: InscricoesProjetos

Campos sugeridos:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Title | Texto | Sim | Nome do projeto |
| DataInicioProjeto | Texto ou Data | Sim | Mês/ano do início |
| ProblemaResolvido | Múltiplas linhas | Sim | Descrição do problema |
| MetaEstrategicaVP | Múltiplas linhas | Sim | Meta estratégica apoiada |
| ResultadosGerados | Múltiplas linhas | Sim | Resultados do projeto |
| UsaTecnologia | Sim/Não | Sim | Uso de IA, automação ou tecnologia |
| DescricaoTecnologia | Múltiplas linhas | Condicional | Obrigatório se UsaTecnologia = Sim |
| PaixaoPurpura | Escolha | Sim | Confirmar opções oficiais |
| PotencialExpansao | Múltiplas linhas | Sim | Replicabilidade/escala |
| ParticipantesJson | Múltiplas linhas | Sim | Lista de participantes em JSON |
| LinksFotosParticipantes | Múltiplas linhas | Não | URLs das fotos |
| LinkVideo | Hiperlink ou Texto | Não | Vídeo do projeto |
| LinkPowerPoint | Hiperlink ou Texto | Não | Apresentação |
| LinksEvidenciasAdicionais | Múltiplas linhas | Não | URLs adicionais |
| DataEnvio | Data e hora | Sim | Data/hora de envio |
| StatusProcessamento | Escolha | Sim | Recebido, Processando, Concluído, Erro |
| ObservacaoErro | Múltiplas linhas | Não | Erro técnico resumido |

## Biblioteca: EvidenciasProjetos

Finalidade: armazenar fotos dos participantes, vídeos, PowerPoints e evidências complementares.

Estrutura recomendada por inscrição:

```text
EvidenciasProjetos/
└─ Projeto-{ID}-{NomeProjetoSanitizado}/
   ├─ fotos-participantes/
   ├─ video/
   ├─ powerpoint/
   └─ evidencias/
```

## Permissões
Preferencialmente:

- Usuários preenchem o formulário sem acesso direto de edição à lista.
- Power Automate grava os dados com conexão de serviço ou usuário autorizado.
- Equipe organizadora possui acesso de leitura/edição aos resultados.
