

/**
 * **Historia de Usuario: HU-MS-03 - Ver Perfil de Usuario**
 * **Caso de Uso: CU-MS-03 - Visualización de perfil**
 *
 * **Descripción:** Esta prueba verifica que un usuario autenticado pueda ver la información de su propio perfil.
 *
 * **Criterios de Aceptación:**
 * 1. Un usuario autenticado puede navegar a la página de su perfil.
 * 2. La página de perfil muestra correctamente el nombre de usuario y el correo electrónico.
 */
describe('HU-MS-03: Ver información de perfil de usuario', () => {
  it('Yo como usuario quiero poder visualizar la información de mi perfil de usuario, dentro del sistema.', () => {
    // Prerrequisito: Iniciar sesión en el sistema.
    cy.log('Prerrequisito: Iniciar sesión');
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();
    cy.url().should('include', '/dashboard');

    // Criterio de Aceptación 1: Un usuario autenticado puede navegar a la página de su perfil.
    cy.log('Paso 1: Navegar a la página de perfil');
    cy.get('.text-sidebar-accent-foreground').click();
    cy.wait(1000);
    cy.visit('/settings/profile');

    // Criterio de Aceptación 2: La página de perfil muestra correctamente el nombre de usuario y el correo electrónico.
    cy.log('Paso 2: Verificar que la información del perfil se muestra correctamente');
    cy.contains('Nombre').should('be.visible');
    cy.contains('Correo electrónico').should('be.visible');
  });
});
