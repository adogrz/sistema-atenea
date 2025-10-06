

/**
 * **Historia de Usuario: HU-MS-06 - Habilitar/Deshabilitar Usuarios**
 * **Caso de Uso: CU-MS-06 - Gestión de estado de cuentas**
 *
 * **Descripción:** Esta prueba verifica que un administrador pueda habilitar o deshabilitar la cuenta de un usuario.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede seleccionar un usuario y encontrar una opción para cambiar su estado (activo/inactivo).
 * 2. Al cambiar el estado, el sistema actualiza el registro del usuario.
 * 3. El cambio de estado se refleja visualmente en la lista de usuarios.
 * 4. Un usuario con la cuenta deshabilitada no puede iniciar sesión.
 *
 * **Nota:** Esta prueba actualmente utiliza selectores de placeholder y un comando `cy.login()` no definido.
 */
describe('HU-MS-06: Habilitar y deshabilitar cuentas de usuario', () => {
  beforeEach(() => {
    // Login as an admin
    cy.log('Prerrequisito: Iniciar sesión como administrador');
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();
    cy.url().should('include', '/dashboard');
  });

  it('Yo como administrador TI debo de poder habilitar o deshabilitar las cuentas de los usuarios.', () => {
    // Prerrequisito: Iniciar sesión como administrador y estar en la página de usuarios.
    // NOTA: Se utiliza un comando personalizado cy.login() y una URL base no configurada.
    cy.log('Prerrequisito: Iniciar sesión y visitar la página de usuarios');

    // Criterio de Aceptación 1 y 2: Encontrar un usuario y cambiar su estado a inactivo.
    cy.log('Paso 1: Encontrar un usuario y hacer clic en deshabilitar');
    // NOTA: El selector para el botón es un placeholder.
    cy.contains('tr', 'usuario@example.com').within(() => {
      cy.get('.disable-button').click();
    });

    // Criterio de Aceptación 3: Verificar que el cambio de estado se refleja.
    cy.log('Paso 2: Verificar que el usuario aparece como Inactivo');
    cy.contains('tr', 'usuario@example.com').within(() => {
      cy.contains('Inactivo').should('be.visible');
    });

    // Criterio de Aceptación 1 y 2 (inverso): Encontrar el mismo usuario y cambiar su estado a activo.
    cy.log('Paso 3: Encontrar el mismo usuario y hacer clic en habilitar');
    // NOTA: El selector para el botón es un placeholder.
    cy.contains('tr', 'usuario@example.com').within(() => {
      cy.get('.enable-button').click();
    });

    // Criterio de Aceptación 3 (inverso): Verificar que el estado vuelve a ser activo.
    cy.log('Paso 4: Verificar que el usuario aparece como Activo');
    cy.contains('tr', 'usuario@example.com').within(() => {
      cy.contains('Activo').should('be.visible');
    });
  });
});
