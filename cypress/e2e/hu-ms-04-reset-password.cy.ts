

/**
 * **Historia de Usuario: HU-MS-04 - Restablecer Contraseña**
 * **Caso de Uso: CU-MS-04 - Solicitud de restablecimiento de contraseña**
 *
 * **Descripción:** Esta prueba verifica que un usuario que ha olvidado su contraseña puede solicitar un enlace para restablecerla.
 *
 * **Criterios de Aceptación:**
 * 1. En la página de inicio de sesión, existe un enlace o botón para "Restablecer contraseña".
 * 2. Al hacer clic, el usuario es llevado a un formulario donde puede ingresar su correo electrónico.
 * 3. Al enviar el formulario con un correo electrónico válido y registrado, el sistema procesa la solicitud.
 */
describe('HU-MS-04: Restablecer contraseña', () => {
  it('Yo como usuario necesito poder restablecer mi contraseña cuando lo olvide.', () => {
    // Criterio de Aceptación 1: En la página de inicio de sesión, existe un enlace para "Restablecer contraseña".
    cy.log('Paso 1: Visitar la página de login y encontrar el enlace de restablecer contraseña');
    cy.visit('/login');
    cy.contains('¿Olvidaste tu contraseña?').should('be.visible');

    // Criterio de Aceptación 2: Al hacer clic, el usuario es llevado a un formulario para ingresar su correo.
    cy.log('Paso 2: Hacer clic en el enlace y verificar la redirección');
    cy.contains('¿Olvidaste tu contraseña?').click();
    cy.url().should('include', '/forgot-password');

    // Criterio de Aceptación 3: Al enviar el formulario con un correo válido, el sistema procesa la solicitud.
    cy.log('Paso 3: Ingresar el correo y enviar el formulario');
    cy.get('input[name="email"]').type('ml19017@ues.edu.sv');
    cy.contains('Enviar enlace').click();

    cy.wait(1000);
    cy.contains('Se ha enviado un enlace para restablecer la contraseña a su correo electrónico.').should('be.visible');
    // La aserción final está comentada porque la respuesta del backend (envío de correo) no se puede verificar fácilmente en Cypress sin una infraestructura de prueba de correo.
    // cy.contains('Se ha enviado un enlace para restablecer la contraseña a su correo electrónico.').should('be.visible');
  });
});
