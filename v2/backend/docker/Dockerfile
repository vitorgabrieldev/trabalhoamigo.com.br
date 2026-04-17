FROM php:8.3-fpm-alpine

# System deps
RUN apk add --no-cache \
    bash \
    curl \
    libpng-dev \
    libxml2-dev \
    oniguruma-dev \
    postgresql-dev \
    zip \
    unzip \
    git

# PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    xml

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Install dependencies (cached layer)
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-interaction --prefer-dist

# Copy source
COPY . .

# Generate autoloader
RUN composer dump-autoload --optimize

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
