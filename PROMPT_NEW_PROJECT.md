# 🤖 AI / IDE Integration Prompt: Novo Projeto Baseado no Boilerplate

Este arquivo contém o prompt mestre para parametrizar uma Inteligência Artificial ou Assistente de IDE ao iniciar um **NOVO PROJETO** utilizando este boilerplate (Code - base).
*Utilize a versão em Português ou Inglês conforme a preferência da sua IA.*

---

## 🇧🇷 Versão em Português

**Objetivo:** Inicializar e construir os módulos de negócio de um novo sistema do zero, utilizando o Sarak UI Engine Boilerplate.

**Prompt a ser enviado:**
> "Você atuará como um Engenheiro de Software Full-Stack encarregado de construir as regras de negócio de um novo projeto, inicializado a partir deste Boilerplate padrão.
> 
> **Contexto da Arquitetura:**
> Esta estrutura utiliza o Sarak UI Engine, um Motor Agnóstico de Design no Frontend (`frontend/src/core/`). O Motor visual já está 100% testado, construído (utilizando TailwindCSS v4, Framer Motion e Lucide) e isolado.
> 
> **Suas Restrições Máximas de Código:**
> 1. Você está TERMINANTEMENTE PROIBIDO de alterar, editar ou adicionar qualquer arquivo que esteja dentro da pasta `frontend/src/core/`. Entenda essa pasta como uma biblioteca fechada.
> 2. Todas as lógicas da interface deste nosso novo projeto, telas (pages) e componentes de negócio devem ser criadas dentro de `frontend/src/modules/`.
> 3. No Backend, toda a lógica de negócio (cálculos, validações) deve ser isolada na camada `services/` do respectivo módulo (separado de `api/` e `repository/`), conforme dita a arquitetura.
> 
> **Leitura Obrigatória para Execução:**
> Antes de criar o primeiro módulo, VOCÊ DEVE LER os seguintes documentos presentes na raiz deste Boilerplate para entender os contratos visuais e estruturais que você deve seguir:
> - `PROJECT_STRUCTURE.md` (Na raiz do repo).
> - `ARCHITECTURE.md` (As regras rígidas de escrita de código, na raiz).
> - `frontend/src/core/docs/06-MODULE_CREATION.md` (O manual estrito de 3 passos de como plugar o nosso módulo novo no SarakShell via `App.jsx`).
> 
> Entendido o contexto e lida a documentação obrigatória, o primeiro módulo que nós vamos orquestrar será o [INSERA O NOME DO MÓDULO AQUI, Ex: Dashboard Financeiro]. Crie o esqueleto do módulo no React, o registre no SarakConfig e me apresente o plano de execução para o Backend Python."

---

## 🇺🇸 English Version

**Objective:** Initialize and build business modules for a new system from scratch using the Sarak UI Engine Boilerplate.

**Prompt to be sent:**
> "You will act as a Full-Stack Software Engineer tasked with building the business rules of a new project, initialized from this standard Boilerplate.
> 
> **Architecture Context:**
> This structure utilizes the Sarak UI Engine, an Agnostic UI Framework on the Frontend (`frontend/src/core/`). The visual Engine is already 100% tested, built (using TailwindCSS v4, Framer Motion, and Lucide), and completely isolated.
> 
> **Your Absolute Code Constraints:**
> 1. You are STRICTLY FORBIDDEN from changing, editing, or adding any files inside the `frontend/src/core/` folder. Treat this folder as a closed, read-only third-party library.
> 2. All interface logic for our new project, screens (pages), and business components must exclusively be created inside `frontend/src/modules/`.
> 3. On the Backend, all business logic (calculations, validations, heavy lifting) must be isolated in the `services/` layer of the target module (strictly separated from `api/` and `repository/`), as the architecture demands.
> 
> **Mandatory Reading for Execution:**
> Before creating the first module, YOU MUST READ the following documents located in this Boilerplate to deeply understand the visual and structural contracts you must follow:
> - `PROJECT_STRUCTURE.md` (At the repository root).
> - `ARCHITECTURE.md` (The strict code-writing guidelines, at the root).
> - `frontend/src/core/docs/06-MODULE_CREATION.md` (The strict 3-step manual on how to plug our new module into the SarakShell via `App.jsx`).
> 
> Having understood the context and read the mandatory documentation, the first module we will orchestrate is [INSERT MODULE NAME HERE, e.g., Financial Dashboard]. Create the module skeleton in React, register it in the SarakConfig, and present me with the execution plan for the Python Backend."
