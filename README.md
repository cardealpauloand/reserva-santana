# Reserva Santanna
Site ecommerce simulado de uma vinicula, desenvolvido com Laravel, React e PostgreSQL para projeto academico de Analise e Desenvolvimento de Sistemas.

This is an academic group project developed by **Murilo Pereira**, **Paulo Andre** and **Luiz Otavio**, students of **Analise e Desenvolvimento de Sistemas**.

> Status: Desenvolvimento. Funcional para fins academicos, sem vendas reais; pagamentos, estoque e pedidos sao simulados.

## Por Que Esse Projeto Existe
O projeto existe para demonstrar um fluxo completo de ecommerce aplicado a uma vinicula ficticia, integrando vitrine, carrinho, checkout, pedidos, estoque e painel administrativo.
- Simular jornada de compra de vinhos, do catalogo ate a confirmacao do pedido.
- Praticar desenvolvimento full stack com API Laravel, frontend React e banco PostgreSQL em Docker.

## Demonstração Do Fluxo
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0cf6fa30-b1c3-462c-b3b8-eb5d6139cbbe" />

1. Cliente acessa a pagina inicial, confirma idade e navega pelos vinhos.
2. Cliente abre detalhes do produto, adiciona itens ao carrinho e segue para checkout.
<img width="1248" height="1022" alt="image" src="https://github.com/user-attachments/assets/6e24e238-0f5e-4887-930a-6960a0b500f7" />

3. Sistema registra pedido simulado e atualiza fluxo de pedidos do usuario.
4. Administrador acompanha metricas, produtos, pedidos e estoque nas telas protegidas.


## Funcionalidades
### Vitrine E Catalogo
<img width="1248" height="1022" alt="image" src="https://github.com/user-attachments/assets/6b9f88d7-c2de-46a9-a468-9f1a0c86e825" />

- Listagem de produtos por catalogo, busca e categoria.
- Pagina de detalhes por produto.
- Carrossel principal, destaques e grade de produtos na home.
- Bloqueio visual de idade via `AgeGate`.

### Carrinho E Checkout
- Carrinho com itens, quantidades, total e limpeza.
<img width="1414" height="626" alt="image" src="https://github.com/user-attachments/assets/1f17c8f0-413f-4846-a186-bbb2770e0116" />

- Checkout em etapas com endereco, cotacao de frete e pagamento simulado.
- Cadastro e reutilizacao de enderecos do usuario autenticado.
<img width="1414" height="808" alt="image" src="https://github.com/user-attachments/assets/453da7dd-90cb-4b0b-9117-24b657c64159" />

- Criacao de pedidos simulados sem cobranca real.

### Conta Do Cliente
<img width="1414" height="626" alt="image" src="https://github.com/user-attachments/assets/0d51ed03-4b7e-4db1-b25a-1db371b95247" />

- Registro, login, logout e sessao via Laravel Sanctum.
- Perfil do usuario autenticado.
<img width="1414" height="454" alt="image" src="https://github.com/user-attachments/assets/9f5f34ce-6589-4b50-a835-35a05df1465b" />


### Administracao
- Dashboard com metricas, comparacao por periodo, receita e rankings.
<img width="1248" height="1022" alt="image" src="https://github.com/user-attachments/assets/385766ad-fb87-4ac8-8bd1-b2eccfa1bcfe" />

<img width="1248" height="1022" alt="image" src="https://github.com/user-attachments/assets/c671ac2d-f83c-4c28-9218-613d43aecd52" />
- Gestao de produtos em `/produtos`.
- <img width="1414" height="543" alt="image" src="https://github.com/user-attachments/assets/eb61242e-e361-462c-a680-1e1e96335fb6" />
- Gestao de estoque em `/estoque`, com entradas e saidas.
<img width="1414" height="543" alt="image" src="https://github.com/user-attachments/assets/ec155a63-d10f-4320-a333-839d4dc475b6" />
- Gestao de pedidos em `/admin/pedidos`.
<img width="1414" height="998" alt="image" src="https://github.com/user-attachments/assets/b91a27d3-b548-464e-af1d-41892c79cf20" />


### Backend E Dados
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
