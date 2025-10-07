<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Reserva Santana Backend

This Laravel backend is configured to use PostgreSQL and ships with migrations that reproduce the full commerce schema you shared (users, RBAC, catalog, stock, carts, orders, payments, shipping, returns, suppliers, and purchasing).

### Requirements

-   PHP 8.2+
-   Composer 2+
-   PostgreSQL 14+ with the extensions `pg_trgm` and `uuid-ossp`

### First-time setup

1. Install PHP dependencies: `composer install`
2. Copy `.env.example` to `.env` and adjust the `DB_*` variables to match your local PostgreSQL instance.
3. Ensure the target database exists (`createdb reserva_santana`) and that the Postgres service is running.
4. Run the migrations: `php artisan migrate`

### Shipping (Correios) configuration

Add these variables to your `.env` (example values):

```
SHIPPING_ORIGIN_ZIP=01001-000
SHIPPING_DEFAULT_ITEM_WEIGHT_KG=0.3
SHIPPING_DEFAULT_LENGTH_CM=20
SHIPPING_DEFAULT_WIDTH_CM=20
SHIPPING_DEFAULT_HEIGHT_CM=15
SHIPPING_DEFAULT_DIAMETER_CM=0
SHIPPING_CORREIOS_SERVICE_CODES=04014,04510
```

The endpoint `POST /api/shipping/quote` expects:

```
{
	"destination_zip": "04567-000",
	"items": [{ "quantity": 2 }]
}
```

It returns a list of quotes like:

```
{
	"data": [
		{ "service_code": "04014", "service_name": "SEDEX", "price": 22.9, "deadline_days": 2 },
		{ "service_code": "04510", "service_name": "PAC",   "price": 16.7, "deadline_days": 6 }
	]
}
```

### Catalog data & API

-   Seed the catalog with wine categories, sample products, and images using `php artisan db:seed`.
-   Exposed REST endpoints for the SPA live under `/api/catalog` (e.g. `GET /api/catalog/products`, `GET /api/catalog/products/{id}`, `GET /api/catalog/categories`, `GET /api/catalog/categories/{slug}`) and return camel-case friendly payloads for the React app.
-   Every product response includes pricing, merchandising metadata, the primary image URL, and category associations so the frontend can render detail, search, and listing pages.

When running the frontend locally, point `VITE_API_URL` to `http://localhost:8000/api` so requests are routed to this backend.

The `setup_postgres_extensions_and_types` migration will create the required extensions and enum types if they are not already present. The follow-up migrations create every table, index, and constraint described in your SQL reference, so you can start integrating the frontend or seed data right away.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

-   [Simple, fast routing engine](https://laravel.com/docs/routing).
-   [Powerful dependency injection container](https://laravel.com/docs/container).
-   Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
-   Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
-   Database agnostic [schema migrations](https://laravel.com/docs/migrations).
-   [Robust background job processing](https://laravel.com/docs/queues).
-   [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

-   **[Vehikl](https://vehikl.com)**
-   **[Tighten Co.](https://tighten.co)**
-   **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
-   **[64 Robots](https://64robots.com)**
-   **[Curotec](https://www.curotec.com/services/technologies/laravel)**
-   **[DevSquad](https://devsquad.com/hire-laravel-developers)**
-   **[Redberry](https://redberry.international/laravel-development)**
-   **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
