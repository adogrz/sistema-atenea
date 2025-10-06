

/**
 * **Historia de Usuario: HU-MS-13 - Consultar Cuentas de Usuario**
 * **Caso de Uso: CU-MS-13 - Visualización de listado de usuarios**
 *
 * **Descripción:** Esta prueba verifica que un administrador pueda ver una lista de todos los usuarios registrados en el sistema.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede navegar a la página de gestión de usuarios.
 * 2. La página muestra una tabla o lista con los usuarios registrados.
 * 3. La tabla incluye columnas clave como Nombre, Correo Electrónico, Roles y Sede.
 * 4. La lista de usuarios se carga y se muestra correctamente.
 *
 * **Nota:** Esta prueba actualmente utiliza selectores de placeholder.
 */
describe('HU-MS-13: Consultar cuentas de usuario', () => {
  beforeEach(() => {
    cy.visit('/login');

    // Enter email and password
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');

    // Click the login button
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();

    cy.log('After login click');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  it('Yo como administrador TI quiero poder consultar las cuentas de usuario.', () => {
    // Criterio de Aceptación 1: Navegar a la página de gestión de usuarios.
    cy.log('Paso 1: Visitar la página de gestión de usuarios');
    cy.visit('/dashboard/users');

    // Criterio de Aceptación 2, 3 y 4: Verificar que la tabla de usuarios se muestra correctamente.
    cy.log('Paso 2: Verificar que la tabla y sus componentes son visibles');
    // NOTA: Los selectores son placeholders y verifican la presencia de gráficos, no de la tabla directamente.
    cy.contains('Estado de Usuarios').should('be.visible');
    cy.contains('Usuarios por Rol').should('be.visible');
    cy.contains('Usuarios por Sede').should('be.visible');
    
    cy.log('Paso 3: Verificar que la tabla tiene al menos una fila de datos');
    // NOTA: El selector para la tabla es genérico y puede no ser robusto.
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });
});
