# Perguntas do formulário

Modelo atualizado a partir do arquivo `Atualizacao Formulario Projetos.docx`.

## 1. Nome do Projeto
**Tipo:** resposta curta
**Limite:** máximo 80 caracteres
**Obrigatório:** sim

## 2. Área Responsável
**Tipo:** dropdown
**Obrigatório:** sim

Opções sugeridas:

- Gerência de Serviços ao Cliente Centralizado
- Operações FTTH
- Qualidade
- MIS / Analytics
- Atendimento
- Outra área

## 3. Líder do Projeto
**Tipo:** resposta curta
**Limite:** máximo 60 caracteres
**Obrigatório:** sim

## 4. E-mail do líder
**Tipo:** e-mail
**Obrigatório:** sim

Validação sugerida: exigir e-mail válido e domínio corporativo configurado em `VITE_ALLOWED_EMAIL_DOMAIN`.

## 5. Coparticipantes
**Tipo:** lista dinâmica opcional
**Limite:** máximo 60 caracteres por nome/equipe
**Obrigatório:** não

Implementação: permitir adicionar/remover coparticipantes, sem foto de perfil.

## 6. O projeto possui ganho financeiro?
**Tipo:** múltipla escolha
**Obrigatório:** sim

Opções:

- Sim
- Não

## 7. Descreva o ganho financeiro
**Tipo:** parágrafo
**Limite:** máximo 300 caracteres
**Obrigatório:** condicional, apenas se houver ganho financeiro

## 8. Objetivo do Projeto
**Tipo:** parágrafo
**Limite:** máximo 500 caracteres
**Obrigatório:** sim

## 9. Descrição do Projeto
**Tipo:** parágrafo
**Limite:** máximo 2.000 caracteres
**Obrigatório:** sim

## 10. Impacto Estratégico
**Tipo:** caixa de seleção
**Obrigatório:** sim

Opções sugeridas:

- Produtividade
- Eficiência Operacional
- IA
- Automação
- Experiência do Cliente
- Ganho financeiro
- Qualidade
- Escalabilidade

## 11. Situação Atual (AS IS)
**Tipo:** parágrafo
**Limite:** máximo 700 caracteres
**Obrigatório:** sim

## 12. Situação Futura (TO BE)
**Tipo:** parágrafo
**Limite:** máximo 700 caracteres
**Obrigatório:** sim

## 13. Benefícios do Projeto
**Tipo:** parágrafo
**Limite:** máximo 700 caracteres
**Obrigatório:** sim

## 14. Produtos Impactados
**Tipo:** caixa de seleção
**Obrigatório:** sim

Opções sugeridas:

- Fibra
- IPTV
- Voz IMS
- B2B
- B2C
- Móvel
- Outros

## 15. Premissas
**Tipo:** parágrafo
**Limite:** máximo 500 caracteres
**Obrigatório:** não

Campos não aplicáveis podem ser preenchidos com `N/A`.

## 16. Resultados Esperados
**Tipo:** parágrafo
**Limite:** máximo 700 caracteres
**Obrigatório:** sim

## 17. Upload do Vídeo
**Tipo:** upload de arquivo
**Regra:** vídeo de até 3 minutos
**Obrigatório:** sim

## 18. Apresentação PowerPoint
**Tipo:** upload de arquivo
**Obrigatório:** não

## 19. Outras evidências/resultados
**Tipo:** múltiplos uploads
**Obrigatório:** não

## 20. Exportação XLSX
Ao final da revisão e na tela de confirmação, o usuário pode baixar um arquivo `.xlsx` com as respostas organizadas em abas de respostas e anexos.
