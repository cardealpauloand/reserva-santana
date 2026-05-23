# Reserva Santanna
Site ecommerce simulado de uma vinicula, desenvolvido com Laravel, React e PostgreSQL para projeto academico de Analise e Desenvolvimento de Sistemas.

This is an academic group project developed by **Murilo Pereira**, **Paulo Andre** and **Luiz Otavio**, students of **Analise e Desenvolvimento de Sistemas**.

> Status: Desenvolvimento. Funcional para fins academicos, sem vendas reais; pagamentos, estoque e pedidos sao simulados.

## Por Que Esse Projeto Existe
O projeto existe para demonstrar um fluxo completo de ecommerce aplicado a uma vinicula ficticia, integrando vitrine, carrinho, checkout, pedidos, estoque e painel administrativo.
- Simular jornada de compra de vinhos, do catalogo ate a confirmacao do pedido.
- Praticar desenvolvimento full stack com API Laravel, frontend React e banco PostgreSQL em Docker.

## Demonstração Do Fluxo
> Substitua por uma print da pagina `/` mostrando vitrine, carrossel principal e produtos em destaque.
1. Cliente acessa a pagina inicial, confirma idade e navega pelos vinhos.
2. Cliente abre detalhes do produto, adiciona itens ao carrinho e segue para checkout.
> Substitua por uma print da pagina `/checkout` mostrando etapas de entrega, frete, pagamento e confirmacao.
3. Sistema registra pedido simulado e atualiza fluxo de pedidos do usuario.
4. Administrador acompanha metricas, produtos, pedidos e estoque nas telas protegidas.
> Substitua por uma print da pagina `/dashboard` mostrando cards de metricas, grafico de receita e produtos mais vendidos.

## Funcionalidades
### Vitrine E Catalogo
> Substitua por uma print da pagina `/catalogo` mostrando listagem de vinhos e filtros.
- Listagem de produtos por catalogo, busca e categoria.
- Pagina de detalhes por produto.
- Carrossel principal, destaques e grade de produtos na home.
- Bloqueio visual de idade via `AgeGate`.

### Carrinho E Checkout
> Substitua por uma print da pagina `/carrinho` mostrando produtos adicionados e resumo do pedido.
- Carrinho com itens, quantidades, total e limpeza.
- Checkout em etapas com endereco, cotacao de frete e pagamento simulado.
- Cadastro e reutilizacao de enderecos do usuario autenticado.
- Criacao de pedidos simulados sem cobranca real.

### Conta Do Cliente
> Substitua por uma print da pagina `/perfil` mostrando dados do usuario e enderecos.
- Registro, login, logout e sessao via Laravel Sanctum.
- Perfil do usuario autenticado.
- Historico de pedidos em `/pedidos`.

### Administracao
> Substitua por uma print da pagina `/dashboard` mostrando indicadores administrativos.
- Dashboard com metricas, comparacao por periodo, receita e rankings.
- Gestao de produtos em `/produtos`.
- Gestao de estoque em `/estoque`, com entradas e saidas.
- Gestao de pedidos em `/admin/pedidos`.

### Backend E Dados
> Substitua por uma print de ferramenta API ou banco mostrando endpoints/dados do projeto.
- API REST em Laravel para catalogo, autenticacao, carrinho, checkout, enderecos e admin.
- Controle de permissao admin via middleware.
- Migrations e seeders para catalogo, estoque, usuarios e vendas simuladas.
- PostgreSQL com extensoes, triggers/procedures e estrutura relacional.

## Rotas Principais
| Rota | Funcao |
| --- | --- |
| `/` | Home com vitrine, carrossel e produtos em destaque |
| `/catalogo` | Catalogo geral de produtos |
| `/categoria/:category` | Produtos filtrados por categoria |
| `/busca` | Busca de produtos |
| `/produto/:id` | Detalhes de um produto |
| `/carrinho` | Carrinho do cliente |
| `/checkout` | Finalizacao simulada de pedido |
| `/auth` | Login e cadastro |
| `/perfil` | Perfil do usuario autenticado |
| `/pedidos` | Pedidos do cliente |
| `/dashboard` | Dashboard administrativo protegido |
| `/produtos` | Gestao administrativa de produtos |
| `/estoque` | Gestao administrativa de estoque |
| `/admin/pedidos` | Gestao administrativa de pedidos |
| `/api/catalog/products` | API de listagem de produtos |
| `/api/catalog/categories` | API de categorias |
| `/api/auth/login` | API de login |
| `/api/cart` | API de carrinho autenticado |
| `/api/orders` | API de pedidos autenticados |
| `/api/admin/dashboard` | API de metricas administrativas |

## Stack
**Frontend**
- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui, Radix UI e lucide-react

**Backend**
- PHP 8.2
- Laravel 12
- Laravel Sanctum
- PostgreSQL via `pdo_pgsql`
- PHPUnit

**Infra e desenvolvimento**
- Docker e Docker Compose
- PostgreSQL 16
- Node.js 20
- Composer 2
- ESLint

## Competências Demonstradas
- Modelagem de banco relacional para ecommerce.
- Criacao de API REST com Laravel.
- Autenticacao e autorizacao com Sanctum e middleware admin.
- Integração frontend/backend com React, services e TanStack Query.
- Controle de estado de carrinho e sessao.
- Fluxo de checkout simulado com cotacao de frete.
- Dashboard administrativo com metricas e visualizacao de dados.
- Containerizacao com Docker Compose.
- Testes automatizados no backend.

## Como Rodar Localmente
```bash
# Na raiz do projeto
cp backend/.env.example backend/.env
docker compose up --build

# Em outro terminal, popular dados iniciais
docker compose exec backend php artisan db:seed

# Opcional: criar usuario admin
docker compose exec backend php artisan db:seed --class=AdminSeeder
```

Frontend: `http://localhost:5173`

Backend/API: `http://localhost:8000/api`

Banco PostgreSQL: `localhost:5544`

Credenciais admin opcionais apos `AdminSeeder`:
- Email: `admin@example.com`
- Senha: `password123`

## Autor
**Murilo Pereira**, **Paulo Andre** e **Luiz Otavio** — estudantes de Analise e Desenvolvimento de Sistemas.
