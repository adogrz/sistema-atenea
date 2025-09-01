# Stage 1: Builder
# This stage installs all dependencies, compiles assets, and prepares the application.
FROM unit:1.34.1-php8.3 AS builder

# Install system and PHP dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip git libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libssl-dev \
    postgresql-client libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install -j$(nproc) pcntl opcache pdo pdo_pgsql pgsql intl zip gd exif ftp bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

RUN git config --global --add safe.directory /var/www/html

# Install Composer dependencies
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist

# Install NPM dependencies and build assets
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Optimize Laravel for production
RUN composer install --optimize-autoloader --no-dev --prefer-dist \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# ---

# Stage 2: Final Image
FROM unit:1.34.1-php8.3

# Install only necessary runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libpq-dev \
    # Removed supervisor as Dokploy can manage processes
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install -j$(nproc) pdo pdo_pgsql pgsql intl zip gd exif ftp bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP production configuration
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit=tracing" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit_buffer_size=256M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "upload_max_filesize=64M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/html

# Copy built artifacts from the 'builder' stage
COPY --from=builder /var/www/html/vendor ./vendor
COPY --from=builder /var/www/html/public ./public
COPY --from=builder /var/www/html/bootstrap/cache ./bootstrap/cache
COPY --from=builder /var/www/html .

# Create necessary directories and set permissions
# No need to create bootstrap/cache as it's copied from the builder
RUN mkdir -p storage/logs storage/framework/{cache,sessions,views} \
    && chown -R unit:unit storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Removed copying unit.json and supervisord.conf
# Dokploy handles Nginx/Unit configuration and process management.

EXPOSE 8000

#HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#    CMD curl -f http://localhost:8000/up || exit 1

# Dokploy will manage the entrypoint and process.
# We set the default command to run Nginx Unit directly.
CMD ["unitd", "--no-daemon", "--control", "unix:/var/run/unit/control.sock"]