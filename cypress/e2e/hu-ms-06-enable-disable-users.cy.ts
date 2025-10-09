

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

    cy.visit('/dashboard/users');
    cy.url().should('include', '/dashboard/users');

    // Criterio de Aceptación 1 y 2: Encontrar un usuario y cambiar su estado a inactivo.
    cy.log('Paso 1: Encontrar un usuario y hacer clic en deshabilitar');
    // NOTA: El selector para el botón es un placeholder.
    cy.visit('/dashboard/users/8/edit');
    cy.get('#user-status').click();

    cy.log('Paso 2: Guardar los cambios haciendo clic en "Actualizar cuenta"');
    cy.contains('button', 'Actualizar cuenta').click();

    cy.log('Paso 3: Verificar que los cambios se reflejan en la lista de usuarios');
    cy.wait(1000); // Espera breve para asegurar que la redirección se complete
    cy.url().should('include', '/dashboard/users');
    cy.get('input[placeholder="Buscar..."]').type('montoya.ivan@example.net');
    cy.contains('montoya.ivan@example.net').should('be.visible');
    cy.contains('span', 'Inactivo').scrollIntoView().should('be.visible');
  });
});
