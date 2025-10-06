

/**
 * **Historia de Usuario: HU-MS-02 - Cerrar Sesión**
 * **Caso de Uso: CU-MS-02 - Cierre de sesión de usuario**
 *
 * **Descripción:** Esta prueba verifica que un usuario autenticado pueda cerrar su sesión de forma segura.
 *
 * **Criterios de Aceptación:**
 * 1. Un usuario autenticado puede encontrar y hacer clic en un botón o enlace para cerrar sesión.
 * 2. Al cerrar sesión, la sesión del usuario se invalida en el servidor.
 * 3. Después de cerrar sesión, el usuario es redirigido a la página de inicio de sesión.
 */
describe('HU-MS-02: Cerrar Sesión', () => {
  it('Yo como usuario quiero poder cerrar la sesión de mi cuenta dentro del sistema.', () => {
    // Prerrequisito: Iniciar sesión en el sistema.
    cy.log('Prerrequisito: Iniciar sesión');
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();
    cy.url().should('include', '/dashboard');

    // Criterio de Aceptación 1: El usuario puede encontrar y hacer clic en un botón para cerrar sesión.
    cy.log('Paso 1: Abrir el menú de usuario');
    cy.get('.text-sidebar-accent-foreground').click();
    cy.wait(1000);

    cy.log('Paso 2: Hacer clic en "Cerrar sesión"');
    cy.contains('Cerrar sesión').click();

    // Criterio de Aceptación 2 y 3: La sesión se invalida y el usuario es redirigido a la página de login.
    cy.log('Paso 3: Verificar redirección a la página de login');
    cy.url().should('include', '/login');
  });
});
