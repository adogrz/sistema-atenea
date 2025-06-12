# Sistema Atenea 🎓

## Requisitos previos 🛠️
Asegúrate de tener instalado lo siguiente en tu sistema:
- PHP 8.2
- Composer
- Node.js (se recomienda la versión actual estable)
- npm

## Puesta en marcha inicial 🚀

1. Clona el repositorio y cambia a la rama `dev`:
   ```bash
   git clone https://github.com/adogrz/sistema-atenea.git
   cd sistema-atenea
   git checkout dev
   ```

2. Instala las dependencias de PHP:
   ```bash
   composer install
   ```

3. Instala las dependencias de Node:
   ```bash
   npm install
   ```

4. Copia el archivo de entorno y genera la clave de la aplicación:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. Crea la base de datos y ejecuta las migraciones con los seeders:
   ```bash
   touch database/database.sqlite
   php artisan migrate --seed
   ```
   En Windows puedes usar `type nul > database\database.sqlite` o crear el archivo manualmente.

6. Inicia el entorno de desarrollo 🖥️:
   - Opción recomendada:
     ```bash
     composer run dev
     ```
   - Opción alternativa: usa `php artisan serve` y `npm run dev` en terminales separadas.

Después de estos pasos podrás acceder a la aplicación en `http://localhost:8000`.

## Ejecutar pruebas 🧪

Para lanzar las pruebas con Pest utiliza:

```bash
composer test
```
