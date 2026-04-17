FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        unzip \
        git \
        libzip-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
    && docker-php-ext-install mysqli pdo_mysql \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html/trabalhoamigo.com.br
