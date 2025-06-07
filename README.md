Gestor de Igrejas - Painel Administrativo
Bem-vindo ao repositório do Gestor de Igrejas, uma aplicação web moderna desenhada para centralizar e simplificar a administração de igrejas.

Este painel administrativo, construído com React, TypeScript e Supabase, oferece uma plataforma robusta para gerir todos os aspetos da comunidade, desde membros e finanças até à comunicação e eventos.

✨ Funcionalidades Implementadas
Atualmente, o sistema conta com os seguintes módulos totalmente funcionais:

Dashboard Principal: Uma visão geral e rápida das métricas mais importantes da igreja.

Gestão de Membros:

Cadastro completo de membros com informações pessoais e eclesiásticas.

Criação e gestão de Grupos e Ministérios.

Associação de membros a múltiplos grupos.

Geração automática de número de membro.

Gestão Financeira:

Registo de todas as transações (receitas e despesas).

Gestão de categorias financeiras.

Painel dinâmico com totais por período.

Relatórios visuais com gráficos e resumos por categoria.

Anexo de links para comprovativos de despesas.

Comunicação e Eventos:

Mural de Avisos para comunicados gerais.

Agenda de Eventos com suporte para eventos recorrentes (semanal e mensal).

Gestão de voluntários por evento, com criação de funções e escala de membros.

Gestão de Conteúdo:

Biblioteca central para devocionais (texto), vídeos (links do YouTube) e estudos (links de PDFs).

🚀 Tecnologias Utilizadas
Frontend: React com Vite

Linguagem: TypeScript

Backend & Base de Dados: Supabase (PostgreSQL)

Estilização: Tailwind CSS

Componentes UI: Shadcn/ui

Gráficos: Recharts

Gestão de Estado: Zustand

⚙️ Como Executar o Projeto Localmente
Para configurar e executar o projeto na sua máquina local, siga os passos abaixo.

Pré-requisitos
Node.js (versão 18 ou superior)

npm ou yarn

Git

Passos de Instalação
Clone o repositório:

git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

Instale as dependências:

npm install

Configure as Variáveis de Ambiente:

Crie um ficheiro .env na raiz do projeto.

Adicione as suas chaves do Supabase a este ficheiro:

VITE_SUPABASE_URL=https://jgunaqwuqjlswvgaiwrv.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

Execute o servidor de desenvolvimento:

npm run dev

Abra http://localhost:5173 (ou a porta indicada no terminal) no seu navegador para ver a aplicação.