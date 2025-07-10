# Convenciones de Commits - Especificación Detallada

## Resumen

La especificación de Commits Convencionales es una convención ligera sobre los mensajes de commits que proporciona un conjunto sencillo de reglas para crear un historial de commits explícito, facilitando la escritura de herramientas automatizadas.

## Estructura del Mensaje de Commit

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[nota(s) al pie opcional(es)]
```

## Tipos de Commits

### Tipos Principales

- **feat**: Introduce una nueva funcionalidad en la base del código (correlaciona con MINOR en Versionado Semántico)
- **fix**: Corrige un error en la base del código (correlaciona con PATCH en Versionado Semántico)

### Tipos Adicionales Recomendados

- **build**: Cambios que afectan el sistema de compilación o dependencias externas
- **chore**: Tareas de mantenimiento que no modifican código de producción
- **ci**: Cambios en archivos de configuración y scripts de integración continua
- **docs**: Cambios únicamente en documentación
- **style**: Cambios que no afectan el significado del código (espacios en blanco, formato, puntos y comas faltantes, etc.)
- **refactor**: Cambios de código que no corrigen errores ni agregan funcionalidades
- **perf**: Cambios de código que mejoran el rendimiento
- **test**: Agregar tests faltantes o corregir tests existentes

## Elementos Estructurales

### 1. Tipo (Obligatorio)

- DEBE iniciar con un sustantivo (feat, fix, etc.)
- DEBE estar seguido de dos puntos y un espacio
- DEBE estar en minúsculas

### 2. Ámbito (Opcional)

- PUEDE agregarse después del tipo
- DEBE consistir en un sustantivo que describa una sección de la base del código
- DEBE estar encerrado entre paréntesis
- Ejemplos: `feat(parser):`, `fix(auth):`, `docs(readme):`

### 3. Descripción (Obligatoria)

- DEBE ir inmediatamente después de los dos puntos y el espacio del prefijo tipo/ámbito
- Es un resumen corto de los cambios realizados en el código
- DEBE estar en minúsculas y sin punto final
- DEBE usar modo imperativo (ej: "cambiar" no "cambiado" ni "cambia")

### 4. Cuerpo (Opcional)

- PUEDE agregarse después de la descripción corta
- DEBE iniciar después de una línea en blanco después de la descripción
- Es de forma libre y PUEDE consistir de cualquier número de párrafos separados por nueva línea
- DEBE usar modo imperativo
- DEBE incluir la motivación para el cambio y contrastar con el comportamiento anterior

### 5. Notas al Pie (Opcional)

- PUEDEN agregarse una línea en blanco después del cuerpo
- Cada nota al pie DEBE consistir de una palabra clave seguida de `:<espacio>` o `<espacio>#`
- Una palabra clave DEBE usar `-` en lugar de espacios en blanco (ej: `Acked-by`)
- PUEDE contener espacios y líneas en blanco

## Cambios de Ruptura (BREAKING CHANGE)

Los cambios de ruptura DEBEN ser indicados de una de estas formas:

### 1. En el prefijo tipo/ámbito

```
refactor!: drop support for Node 6
```

### 2. Como nota al pie

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### 3. Ambos métodos

```
refactor!: drop support for Node 6

BREAKING CHANGE: refactor to use JavaScript features not available in Node 6.
```

## Ejemplos Prácticos

### Mensaje básico

```
feat: agregar autenticación con OAuth
```

### Mensaje con ámbito

```
fix(api): corregir error de validación en endpoint de usuarios
```

### Mensaje con cuerpo

```
feat(auth): implementar sistema de roles y permisos

Agregar soporte para roles de administrador, editor y usuario básico.
Incluye middleware para verificar permisos en rutas protegidas.
```

### Mensaje con notas al pie

```
fix: corregir errores menores de tipografía en el código

ver el issue para más detalles sobre los errores tipográficos corregidos.

Reviewed-by: María González
Refs #133
```

### Cambio de ruptura

```
feat!: cambiar estructura de respuesta de API

BREAKING CHANGE: la respuesta de la API ahora incluye metadatos en un objeto separado
```

## Reglas Específicas

1. Los commits DEBEN iniciar con un tipo
2. El tipo `feat` DEBE usarse para nuevas funcionalidades
3. El tipo `fix` DEBE usarse para correcciones de errores
4. Un ámbito PUEDE añadirse después del tipo
5. La descripción DEBE ir inmediatamente después de los dos puntos y espacio
6. El cuerpo DEBE iniciar después de una línea en blanco
7. Las notas al pie DEBEN añadirse después de una línea en blanco
8. Los cambios de ruptura DEBEN indicarse con `!` o `BREAKING CHANGE:`
9. Tipos diferentes a `feat` y `fix` PUEDEN usarse
10. La información NO DEBE ser tratada como sensible a mayúsculas/minúsculas, excepto `BREAKING CHANGE`

## Mejores Prácticas

### Para Descripciones

- Usar modo imperativo ("agregar" no "agrega" ni "agregado")
- No capitalizar la primera letra
- No usar punto final
- Mantener la descripción bajo 50 caracteres cuando sea posible

### Para Cuerpos

- Usar modo imperativo
- Incluir motivación para el cambio
- Contrastar con comportamiento anterior
- Mantener líneas bajo 72 caracteres

### Para Ámbitos

- Usar nombres cortos y descriptivos
- Ser consistente en el proyecto
- Ejemplos comunes: api, auth, ui, db, config, docs

## Beneficios

- Generación automática de CHANGELOGs
- Determinación automática de versión semántica
- Comunicación clara de la naturaleza de los cambios
- Facilita la contribución de otros desarrolladores
- Permite activar procesos de construcción y publicación automáticos
- Historial de commits más estructurado y navegable

## Herramientas Recomendadas

- **commitizen**: Para generar commits interactivamente
- **commitlint**: Para validar formato de commits
- **semantic-release**: Para versionado y publicación automática
- **conventional-changelog**: Para generar CHANGELOGs automáticamente

---

**Nota**: Esta especificación está basada en [Conventional Commits v1.0.0](https://www.conventionalcommits.org/es/v1.0.0/) y debe ser seguida por todos los miembros del equipo para mantener consistencia en el historial de commits del proyecto.
