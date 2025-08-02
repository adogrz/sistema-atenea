# Stage 1: Builder
FROM php:8.3-fpm-alpine AS builder

# Install system dependencies
RUN apk add --no-cache git unzip libpng-dev libjpeg-turbo-dev libzip-dev \
    postgresql-dev \
    && docker-php-ext-install -j$(nproc) pdo pdo_pgsql intl gd zip exif bcmath

# Install Node.js (LTS)
RUN apk add --no-cache nodejs npm

WORKDIR /var/www/html

# Install Composer dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Install NPM dependencies and build assets
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Final Image
FROM php:8.3-fpm-alpine

# Copy necessary dependencies from builder stage
COPY --from=builder /usr/local/bin/composer /usr/local/bin/composer
COPY --from=builder /usr/lib/libzip.so* /usr/lib/
COPY --from=builder /usr/local/lib/php/extensions/no-debug-non-zts-* /usr/local/lib/php/extensions/

# Install necessary runtime dependencies
RUN apk add --no-cache libpng libjpeg-turbo libzip postgresql-libs \
    && docker-php-ext-enable pdo_pgsql intl gd zip exif bcmath

WORKDIR /var/www/html

# Copy built application from the 'builder' stage
COPY --from=builder /var/www/html ./

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Expose port and run php-fpm
EXPOSE 9000
CMD ["php-fpm"]