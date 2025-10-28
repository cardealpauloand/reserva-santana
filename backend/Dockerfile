FROM php:8.2-cli

# System dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git unzip libzip-dev libpq-dev libonig-dev \
  && docker-php-ext-install zip pdo_pgsql mbstring \
  && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first to leverage Docker layer cache when possible
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress || true

# Copy the rest of the application
COPY . .

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
