# Resumen del Proyecto: Sistema Atenea

Este documento consolida la información clave del proyecto "Sistema Atenea" para proporcionar una comprensión rápida y completa de su propósito, estructura, funcionalidades y datos, incluyendo las últimas actualizaciones.

## 1. Contexto General del Proyecto (`project_context.md`)

El "Sistema Atenea" busca innovar las metodologías de enseñanza-aprendizaje, desarrollando el pensamiento científico y las habilidades de liderazgo en estudiantes de El Salvador, específicamente en Matemática, Física, Química, Biología e Informática. El programa se estructura en:
*   **Olimpiadas Nacionales:** Método de ingreso al programa, incluyendo ONM, OSF, OSQ, ONABI, OSI, OSA.
*   **Academia Sabatina:** Componente anual de formación intensiva en 3 sedes, atendiendo a estudiantes de diferentes niveles.
*   **Olimpiadas Internacionales:** Preparación y participación de estudiantes en eventos internacionales.
*   **Internado "Futuros Dirigentes Técnicos Científicos de El Salvador" (FDTC):** Curso intensivo presencial al finalizar el año escolar.

### Roles de Usuario Clave:
*   **Director:** Visualización total, reportes, administración de periodos.
*   **Informático / Administrador de Usuarios TI:** Administración de usuarios y roles.
*   **Administrador Académico:** Gestión de expedientes, calificaciones, asistencias, reportes.
*   **Administrador Académico de Sede:** Funciones similares, restringido a su sede y solo consulta.
*   **Coordinador de Área:** Gestión de aspirantes, asignación de mentores, revisión de avances.
*   **Jefe de Psicología / Doctor Jefe:** Gestión de expedientes y asignación de casos/perfiles.
*   **Psicólogo / Doctor:** Gestión y actualización de expedientes psicológicos/clínicos.
*   **Mentor / Instructor:** Acceso restringido al rendimiento de estudiantes, ingreso de notas, asistencias, contenidos.
*   **Aspirante / Estudiante:** Acceso a datos de admisión y expediente personal.
*   **Calificador:** Ingreso de notas en el proceso de admisión.

### Módulos del Sistema:
*   **Módulo de Admisiones para Aspirantes:** Gestión de solicitudes, exámenes, listados de seleccionados.
*   **Módulo de Expedientes Académicos de Estudiantes:** Gestión de notas, asistencias, logros, horarios, boletas.
*   **Módulo de FDTC:** Registro de estudiantes, notas y desempeño en el internado.
*   **Módulo de Expediente Clínico:** Historiales médicos y psicológicos.
*   **Módulo de Usuarios y Seguridad:** Gestión de cuentas, roles, control de acceso.

## 2. Requerimientos Específicos (`requerimientos.md`)

### Módulo de Expediente Académico (Historias de Usuario - HU-MRA):
*   **HU-MRA-01: Generación de informes (Instructor):** Cuestionario para informes mensuales exportable a Word/PDF; exportación de notas a Excel.
*   **HU-MRA-02: Establecer la ponderación de notas (Instructor):** (Actualizado) Ahora se refiere a `puntos_maximos` por ítem. Los instructores pueden definir los puntos máximos para cada actividad evaluada.
*   **HU-MRA-03: Ingresar Notas (Instructor):** Listado de estudiantes por nivel para asignar notas.
*   **HU-MRA-04: Ingresar Asistencia (Instructor):** Listado de estudiantes por nivel con checkboxes para marcar asistencia.

### Módulo de Admisión (Historias de Usuario - HU-MA):
*   **HU-MA-01: Registro en el sistema (Aspirante):** Registrarse y acceder al sistema.
*   **HU-MA-02: Inscripción a Olimpiadas (Aspirante):** Ver olimpiadas disponibles y seleccionar participación.
*   **HU-MA-03: Asignar Calificadores (Coordinador de Área):** Ver estudiantes inscritos y asignar calificadores por nivel.
*   **HU-MA-04: Ingresar Notas (Calificador):** Ver estudiantes asignados para ingresar notas (por problema o total).
*   **HU-MA-05: Establecer Nota mínima de aprobación (Coordinador de Área):** Definir la nota mínima para aprobar la olimpiada.
*   **HU-MA-06: Seleccionar estudiantes para la academia (Administrador Académico):** Generar listado de estudiantes seleccionados para la academia.

## 3. Estructura de la Base de Datos (Migraciones)

El esquema de la base de datos ha sido ajustado para soportar la gestión de usuarios, estudiantes, olimpiadas, fases de olimpiadas, inscripciones y evaluaciones. Se han realizado los siguientes cambios clave en la tabla `items_definidos`:

### Actualizaciones en `items_definidos` (migración `2025_08_12_181646_create_items_definidos_table.php`):
*   **`puntos_maximos`** (anteriormente `ponderacion`): Campo `decimal(5, 2)` que representa el puntaje máximo que un estudiante puede obtener por este ítem. Este es el campo principal para la valoración del ítem.
*   **Eliminación de `puntaje_maximo` original**: El campo `puntaje_maximo` original ha sido eliminado, ya que su funcionalidad ha sido absorbida por `puntos_maximos`.
*   **Eliminación de `obligatorio`**: El campo booleano `obligatorio` ha sido removido, ya que todos los ítems se consideran obligatorios por defecto.

### Tablas Clave (Actualizado):
*   **`users`**: Información de usuarios (nombre, email, contraseña, sede, estado, softDeletes).
*   **`estudiantes`**: Detalles personales y académicos de estudiantes (código, user_id, nombres, apellidos, sexo, fecha_nacimiento, centro_educativo, nie, email, dirección, distrito, nivel_educativo, nivel, aprobado, softDeletes).
*   **`olimpiadas`**: Definición de cada olimpiada (nombre, descripción, area_id, activa, nivel_educativo_id).
*   **`fases_olimpiadas`**: Fases dentro de una olimpiada (olimpiada_id, nombre, orden, estado, fechas de inicio/fin, activa, observaciones, cupos, nota_minima_aprobacion, fechas de inscripción, resultados_publicados). **Ahora vinculada a `definiciones_evaluacion` para establecer su rúbrica.**
*   **`inscripciones_olimpiadas`**: Relación entre estudiantes y olimpiadas (olimpiada_id, estudiante_codigo, estado_inscripcion_id).
*   **`definiciones_evaluacion`**: Rúbricas de evaluación (nombre, descripción, versión, estado, bloqueada, creada_por).
*   **`items_evaluados`**: Puntajes y observaciones para ítems individuales dentro de una evaluación (evaluacion_id, item_definido_id, puntaje, observacion).
*   **`calificador_item_asignado`**: Asignación de ítems de evaluación a calificadores para una fase (calificador_id, fase_olimpiada_id, item_definido_id).

### Relaciones:
Extensas relaciones mediante claves foráneas conectan usuarios, estudiantes, olimpiadas, fases, inscripciones, evaluaciones y sus componentes, asegurando la integridad y coherencia de los datos.

## 4. Lógica de la Aplicación (Controladores)

Los controladores implementan la lógica de negocio y la interacción con el frontend (Inertia.js). Se observa un patrón de validación robusta, autorización, uso de servicios para lógica compleja, transacciones de base de datos, soft deletes y registro de actividad. Se han realizado las siguientes mejoras y ajustes:

### Actualizaciones en `DefinicionEvaluacionController.php`:
*   **`index()`**: Se revirtió el cambio de paginación para enviar todos los datos al frontend para un manejo de tabla del lado del cliente.
*   **Validación de Ítems**: Se ajustaron las reglas de validación para `items.*.puntos_maximos` y se eliminaron las reglas para `items.*.puntaje_maximo` y `items.*.obligatorio`.
*   **Control de `bloqueada`**: Se añadió una validación en el método `update` para prevenir modificaciones en una definición de evaluación si esta se encuentra `bloqueada`.
*   **`store()` y `update()`**: Se ajustaron para manejar el nuevo nombre de campo `puntos_maximos`.

### Controladores Clave y sus Funcionalidades (Actualizado):
*   **`AdmisionController`**: Maneja el registro de aspirantes, incluyendo la creación de usuarios, estudiantes y responsables, asignación de roles y notificaciones.
*   **`AsignacionCalificadorController`**: Gestiona la asignación de calificadores a ítems de evaluación específicos por fase de olimpiada.
*   **`CalificacionOlimpiadaController`**: Permite a los calificadores ver y registrar puntajes para los ítems de evaluación asignados, con validaciones de permisos y puntajes.
*   **`EvaluacionController`**: Proporciona una API RESTful para la gestión de registros de evaluación (CRUD).
*   **`FaseOlimpiadaController`**: Administra las fases de las olimpiadas (creación, actualización, eliminación, reordenación, asignación de rúbricas de evaluación).
*   **`InscripcionOlimpiadaController`**: Gestiona las inscripciones de estudiantes en las olimpiadas, incluyendo validaciones de elegibilidad y cambios de estado.
*   **`OlimpiadaController`**: Administra la creación, actualización y eliminación de las olimpiadas.
*   **`UserController`**: Controla la gestión de usuarios, incluyendo creación, actualización, eliminación lógica, restauración, envío de enlaces de restablecimiento de contraseña, y una compleja lógica de asignación de roles y permisos basada en la visibilidad y el rol del usuario autenticado.

## 5. Población Inicial de Datos (Seeders)

Los seeders son fundamentales para configurar la base de datos con datos iniciales y de prueba.

### Seeders Clave:
*   **`DatabaseSeeder`**: Orquesta la ejecución de todos los demás seeders.
*   **`PermissionSeeder`**: Configura los permisos de la aplicación.
*   **`SedeSeeder`**: Crea las sedes del programa.
*   **`AreaSeeder`**: Puebla las áreas académicas (Matemática, Biología, etc.).
*   **`EssentialUserSeeder`**: Crea usuarios esenciales como 'admin-ti', 'jefe-psicologia', 'jefe-medicina' y varios 'calificadores' con contraseñas predefinidas y roles asignados.
*   **`DepartamentoSeeder`, `MunicipioSeeder`, `DistritoSeeder`**: Pueblan datos geográficos.
*   **`NivelEducativoSeeder`, `CentroEducativoSeeder`**: Pueblan niveles educativos y centros educativos.
*   **`EstadoInscripcionSeeder`**: Define los posibles estados de una inscripción.
*   **`OlimpiadaSeeder`**: Crea las olimpiadas iniciales.
*   **`DefinicionEvaluacionSeeder`**: Crea rúbricas de evaluación predefinidas.
*   **`ItemDefinidoSeeder`**: Define los ítems específicos para las rúbricas de evaluación.
*   **`FaseOlimpiadaSeeder`**: Crea las fases iniciales para las olimpiadas y las vincula a las rúbricas.
*   **`TestDataSeeder`**: Genera datos de prueba interconectados para estudiantes, inscripciones, evaluaciones y asignaciones.

---

Este `project_overview.md` proporciona una referencia rápida y completa del proyecto.