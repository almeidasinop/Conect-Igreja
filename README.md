Gestor de Igrejas - Painel Admin & PWA
Este repositório contém o código-fonte de um sistema completo de gestão para igrejas, composto por duas aplicações principais: um painel administrativo robusto e um Progressive Web App (PWA) moderno para os membros.

Funcionalidades Principais
Painel de Administração
Gestão de Membros: Cadastro, edição e visualização de todos os membros da igreja.

Gestão de Grupos: Criação e administração de pequenos grupos ou células.

Controle Financeiro: Lançamento de dízimos, ofertas e despesas.

Comunicação e Engajamento:

Mural de Avisos: Crie, edite e exclua anúncios com suporte a imagens de capa.

Gestão de Eventos: Agende e administre eventos, incluindo a capacidade de fazer upload de imagens de fundo personalizadas.

Gestão de Conteúdo: Administração de estudos, vídeos e outros materiais.

Controle de Acessos: Sistema de permissões baseado em papéis de usuário.

Progressive Web App (PWA) para Membros
Home Page Dinâmica: Exibe as últimas notícias, os próximos eventos e os vídeos mais recentes do canal do YouTube da igreja.

Notícias e Eventos com Imagem: Visualização imersiva de notícias e eventos com as imagens de capa e de fundo definidas no painel administrativo.

Navegação Detalhada: Páginas dedicadas para listar todas as notícias e para visualizar os detalhes completos de cada uma.

Bíblia Online: Ferramenta de leitura e estudo da Bíblia diretamente no app.

Vídeos do YouTube: Seção que exibe automaticamente os últimos vídeos publicados no canal da igreja.

Design Responsivo: Totalmente funcional e otimizado para celulares, tablets e desktops.

Tecnologias Utilizadas
Frontend: React, TypeScript, Vite

Estilização: Tailwind CSS, shadcn/ui

Backend & Banco de Dados: Supabase (PostgreSQL, Storage, Auth)

Gestão de Estado: Zustand & React Query

Roteamento: React Router

Integrações: YouTube Data API v3

Começando
Para rodar este projeto localmente, siga os passos abaixo.

1. Pré-requisitos
Node.js (versão 18 ou superior)

npm ou yarn

Uma conta no Supabase

Uma Conta Google para a API do YouTube

2. Configuração do Projeto
# Clone o repositório
git clone <URL_DO_SEU_REPOSITORIO>

# Navegue até a pasta do projeto
cd <NOME_DA_PASTA>

# Instale as dependências
npm install

3. Configuração do Supabase
Crie um Projeto: Vá até o painel do Supabase e crie um novo projeto.

Variáveis de Ambiente: No seu código, localize o arquivo src/integrations/supabase/client.ts e insira a URL e a anon key do seu projeto.

Execute os Scripts SQL: Vá até o SQL Editor no painel do Supabase e execute os scripts abaixo para criar as tabelas, funções e políticas de segurança necessárias.

Script para criar as tabelas (events, announcements, etc.).

Script para criar a função handle_new_user e o gatilho on_auth_user_created (para sincronizar usuários e perfis).

Scripts para criar as políticas de segurança (RLS) para os buckets event-images e announcement-images.

4. Configuração da API do YouTube
Crie uma Chave de API: Siga o guia Como Obter uma Chave de API do YouTube no Google Cloud Console.

Adicione a Chave ao Código: Abra o arquivo src/pages/pwa/HomePage.tsx e substitua o placeholder COLE_SUA_CHAVE_DE_API_AQUI pela sua chave.

5. Rodando a Aplicação
# Inicie o servidor de desenvolvimento
npm run dev

O Painel de Administração estará acessível em http://localhost:5173.

O PWA estará acessível em http://localhost:5173/app.

Estrutura do Projeto
/
├── public/              # Arquivos estáticos e service worker
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   │   ├── ui/          # Componentes base (shadcn/ui)
│   │   └── pwa/         # Componentes específicos do PWA
│   ├── contexts/        # Contextos React (Auth, Permissions)
│   ├── integrations/    # Integrações com serviços externos (Supabase)
│   ├── pages/           # Componentes que representam as páginas/rotas
│   │   └── pwa/         # Páginas específicas do PWA
│   ├── App.tsx          # Roteador do Painel Admin
│   ├── App-pwa.tsx      # Roteador do PWA
│   └── MasterApp.tsx    # Componente principal que seleciona entre Admin e PWA
└── ...                  # Arquivos de configuração (vite, tailwind, etc.)
