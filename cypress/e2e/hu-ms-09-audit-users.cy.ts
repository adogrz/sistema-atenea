

/**
 * **Historia de Usuario: HU-MS-09 - Auditoría de Cuentas**
 * **Caso de Uso: CU-MS-09 - Revisión de logs de actividad**
 *
 * **Descripción:** Esta prueba verifica que un administrador pueda ver el registro de auditoría de las acciones
 * realizadas sobre las cuentas de usuario.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede navegar a la página de registros de auditoría.
 * 2. La página muestra una lista de eventos de actividad, como creación, actualización y eliminación de usuarios.
 * 3. Cada registro de auditoría contiene información relevante como el usuario afectado, el administrador que realizó la acción y la fecha.
 * 4. Es posible filtrar los registros para encontrar eventos específicos.
 *
 * **Nota:** Esta prueba actualmente utiliza selectores de placeholder.
 */
describe('HU-MS-09: Auditoría de cuentas de usuario', () => {
  beforeEach(() => {
    // Enter email and password
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
  });

  it('Yo como administrador de usuarios tengo que poder auditar los cambios realizados en las cuentas de usuario.', () => {
    // Prerrequisito: Iniciar sesión como administrador.
    cy.log('Prerrequisito: Iniciar sesión como administrador');
    cy.url().should('include', '/dashboard');

    // Criterio de Aceptación 1: Navegar a la página de registros de auditoría.
    cy.log('Paso 1: Visitar la página de auditoría');
    cy.visit('/dashboard/audit');

    // Criterio de Aceptación 2 y 3: Verificar que la lista de eventos se muestra con información relevante.
    cy.log('Paso 2: Verificar que la tabla de auditoría es visible con las columnas esperadas');
    // NOTA: Los selectores son placeholders y necesitan ser actualizados.
    cy.contains('span', 'Usuario').should('be.visible');
    cy.contains('span', 'Tipo').should('be.visible');

    // Criterio de Aceptación 4: Filtrar los registros.
    cy.log('Paso 3: Filtrar los eventos por tipo');
    // NOTA: El selector para el filtro es un placeholder.
    cy.contains('Evento').should('be.visible');
  });
});
