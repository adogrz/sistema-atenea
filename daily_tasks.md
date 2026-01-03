# Tareas Diarias - 3 de Enero de 2026

## Tareas Realizadas:

*   **Mejora de UX en la Página de Resultados:**
    *   Refactorizada la página `resources/js/pages/Olimpiadas/Resultados.tsx` en un componente contenedor (`Index.tsx`) y un componente de visualización (`ResultadosView.tsx`).
    *   Implementados combobox de búsqueda para la selección de Olimpiadas y Fases utilizando `resources/js/pages/Olimpiadas/Resultados/ResultadosToolbar.tsx`.
    *   Añadido un panel informativo para mostrar detalles de la Olimpiada seleccionada.
    *   Actualizado `app/Http/Controllers/ResultadoController.php` para proporcionar todas las Olimpiadas y Fases, y para obtener dinámicamente los resultados basándose en los filtros seleccionados.

*   **Reestructuración de Componentes de Resultados:**
    *   Movido `ResultadosToolbar.tsx` a `resources/js/pages/Olimpiadas/Resultados/ResultadosToolbar.tsx`.
    *   Movido `Management.tsx`, `ScoreDistributionChart.tsx` y `StatsCards.tsx` a `resources/js/pages/Olimpiadas/Resultados/`.
    *   Actualizadas todas las rutas de importación internas para reflejar la nueva estructura.

*   **Limpieza de Código Residual:**
    *   Eliminada lógica obsoleta de `resources/js/pages/Olimpiadas/Resultados/Management.tsx` y reemplazada con un placeholder para futuras implementaciones.
    *   Eliminadas rutas no utilizadas (`resultados.management`, `resultados.generatePermanentCodes`, y `resultados.emails`) de `routes/web.php`.
    *   Eliminados los métodos `managementIndex`, `getEmailsForPassedStudents`, y cualquier método `generatePermanentCodes` de `app/Http/Controllers/ResultadoController.php`.

*   **Eliminación de Componente `CentroEducativo/import.tsx` no utilizado:**
    *   Identificado y eliminado el archivo `resources/js/pages/CentroEducativo/import.tsx`.
    *   Eliminado el directorio `resources/js/pages/CentroEducativo` al quedar vacío.

## Tareas Pendientes:

*   **Implementar Interfaz de Aprobación de Estudiantes:** Crear una nueva interfaz donde se visualicen los estudiantes aprobados y seleccionados por los coordinadores de área para que el administrador académico apruebe su inscripción en la olimpiada, considerando filtros por número de cupos, etc.
*   **Implementación de UI para `nota_minima_aprobacion` en `FasesPanel.tsx`:**
    *   Añadir un campo de entrada (`Input` de tipo `number`) para `nota_minima_aprobacion` en los formularios de creación y edición de fases.
    *   Implementar validación para `nota_minima_aprobacion` (e.g., valor mínimo 0, máximo 100).
    *   Mostrar `nota_minima_aprobacion` en el `SortableFaseItem` como un badge.
    *   Asegurar que el campo esté deshabilitado si el usuario no tiene `fases:assign-nota-minima` permission.
