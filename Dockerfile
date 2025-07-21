# Stage 1: Builder
# Esta etapa instalará todas las dependencias, compilará los assets y preparará la aplicación.
FROM unit:1.34.1-php8.3 AS builder

# Instalar dependencias del sistema y de PHP
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

# Instalar Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

# Instalar dependencias de Composer
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist

# Instalar dependencias de NPM y construir assets
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Optimizar Laravel para producción
RUN composer install --optimize-autoloader --no-dev --prefer-dist \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# ---

# Stage 2: Final Image
# Esta es la imagen final, optimizada y ligera que irá a producción.
FROM unit:1.34.1-php8.3

# Instalar solo las extensiones de PHP necesarias para ejecutar la aplicación
RUN apt-get update && apt-get install -y --no-install-recommends \
    libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install -j$(nproc) pdo pdo_pgsql pgsql intl zip gd exif ftp bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configuración de PHP para producción
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit=tracing" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit_buffer_size=256M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "upload_max_filesize=64M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/html

# Copiar los artefactos construidos desde la etapa \'builder\'
COPY --from=builder /var/www/html/vendor ./vendor
COPY --from=builder /var/www/html/public ./public
COPY --from=builder /var/www/html/bootstrap/cache ./bootstrap/cache
COPY --from=builder /var/www/html .

# Crear directorios necesarios y establecer permisos
# No es necesario crear bootstrap/cache ya que se copia desde el builder
RUN mkdir -p storage/logs storage/framework/{cache,sessions,views} \
    && chown -R unit:unit storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copiar la configuración de Nginx Unit
COPY unit.json /docker-entrypoint.d/unit.json

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

CMD ["unitd", "--no-daemon"]
