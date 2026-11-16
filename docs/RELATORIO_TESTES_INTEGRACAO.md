# Relatório de Testes de Integração e Qualidade — JE Gestão

## 1. Objetivo

Este documento apresenta os testes realizados durante a integração do frontend React com o backend Node.js do sistema JE Gestão, desenvolvido para gerenciamento de serviços de manutenção de ar-condicionado.

O objetivo foi verificar a comunicação entre as aplicações, validar as principais funcionalidades e registrar os resultados obtidos.

## 2. Ambiente utilizado

- **Frontend:** React com TypeScript e Vite.
- **Backend:** Node.js com Express e TypeScript.
- **Banco de dados:** PostgreSQL.
- **ORM:** Prisma.
- **Ferramenta de testes de API:** Insomnia.
- **Editor de código:** Visual Studio Code.

## 3. Validação inicial

Foram executados os seguintes procedimentos:

| Verificação | Resultado |
|---|---|
| Instalação das dependências do backend | Sucesso |
| Validação do schema Prisma | Sucesso |
| Compilação do backend | Sucesso |
| Testes automatizados do backend | 11 aprovados |
| Instalação das dependências do frontend | Sucesso |
| Compilação do frontend | Sucesso |
| Sincronização do banco de dados | Sucesso |
| Inicialização do servidor backend | Sucesso |
| Inicialização do frontend | Sucesso |

## 4. Testes de integração realizados

### 4.1. Formulários públicos

- **Solicitação de orçamento:** envio realizado com sucesso pelo frontend, com resposta positiva do backend.
- **Fale Conosco:** envio de mensagem realizado com sucesso.

### 4.2. Autenticação

- Cadastro de usuário de teste realizado pelo Insomnia.
- Login validado pelo Insomnia, com retorno de token JWT.
- Login pelo frontend realizado com sucesso.
- Redirecionamento para o painel principal após autenticação.

### 4.3. Cadastros

Foram realizados cadastros de teste nas seguintes funcionalidades:

- Clientes.
- Técnicos.
- Serviços.
- Materiais.
- Equipamentos.

Todos os cadastros realizados apresentaram confirmação de sucesso e os registros foram exibidos nas respectivas telas do sistema, quando aplicável.

### 4.4. Agendamentos

- Criação de agendamento utilizando cliente, serviço e técnico cadastrados.
- Verificação da exibição do agendamento no painel.
- Associação do agendamento a uma ordem de serviço.
- Ao concluir a ordem de serviço, o agendamento vinculado foi atualizado automaticamente para o status **CONCLUÍDO**.

### 4.5. Ordens de serviço

Foi criada uma ordem de serviço utilizando os dados cadastrados anteriormente.

Foram validadas as seguintes funcionalidades:

- Seleção de cliente e técnico.
- Seleção de equipamento.
- Registro do diagnóstico.
- Preenchimento e salvamento do checklist técnico.
- Adição de material à ordem de serviço.
- Cálculo dos valores de mão de obra e materiais.
- Atualização do status da ordem de serviço.

O sistema apresentou os seguintes valores no teste:

| Descrição | Valor |
|---|---:|
| Mão de obra | R$ 150,00 |
| Materiais | R$ 35,00 |
| **Total** | **R$ 185,00** |

Também foi validada a mudança de status da ordem de serviço:

**ABERTA → EM_ANDAMENTO → CONCLUIDA**

As operações apresentaram mensagens de confirmação.

## 5. Testes automatizados do backend

Foi executado o comando `npm test` no backend.

**Resultado:**
- 11 testes executados.
- 11 testes aprovados.
- 0 testes reprovados.
- 0 testes ignorados.

Os testes contemplaram validações de valores de mão de obra, quantidades de materiais e alterações de status das ordens de serviço.

## 6. Problemas identificados e correções

Durante o primeiro teste de envio de solicitação de orçamento, foi identificado um erro HTTP 404.

Após análise, foi constatada a ausência do arquivo `.env` na pasta do frontend, responsável por configurar o endereço-base da API.

A configuração foi criada localmente a partir do arquivo `.env.example`, utilizando o endereço correto do backend.

Após reiniciar o frontend, o envio da solicitação foi realizado com sucesso.

Também foi verificado que o login dependia de um usuário previamente cadastrado no banco de dados. Para realizar os testes, foi criado um usuário fictício por meio da rota de registro da API.

## 7. Observações e limitações

Os testes foram realizados em ambiente local, utilizando dados fictícios.

Não foram realizados testes específicos para todas as situações de erro, como conflitos de horários, CPF duplicado ou cancelamento de ordens de serviço.

As validações descritas neste relatório correspondem às funcionalidades efetivamente executadas durante a integração.

## 8. Conclusão

Os testes realizados demonstraram que o frontend e o backend do sistema JE Gestão conseguem se comunicar corretamente nas funcionalidades verificadas.

As principais operações de autenticação, cadastros, formulários públicos, agendamentos e ordens de serviço foram executadas com sucesso.

Além disso, a compilação das duas aplicações e os testes automatizados do backend foram concluídos sem erros.

Dessa forma, a integração foi validada para os fluxos testados, ficando registradas neste documento as verificações realizadas e as limitações identificadas.