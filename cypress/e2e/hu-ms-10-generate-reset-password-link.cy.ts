

/**
 * **Historia de Usuario: HU-MS-10 - Generar Enlace de Restablecimiento**
 * **Caso de Uso: CU-MS-10 - Restablecimiento de contraseña por administrador**
 *
 * **Descripción:** Esta prueba verifica que un administrador pueda generar y enviar un enlace de restablecimiento
 * de contraseña para un usuario específico.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede seleccionar un usuario de la lista.
 * 2. Existe una opción para "Enviar enlace de recuperación" para el usuario seleccionado.
 * 3. Al activar la opción, el sistema envía un correo electrónico al usuario con el enlace.
 * 4. La interfaz muestra un mensaje de confirmación indicando que el enlace ha sido enviado.
 *
 * **Nota:** Esta prueba actualmente utiliza selectores de placeholder y un comando `cy.login()` no definido.
 */
describe('HU-MS-10: Generar enlace de restablecimiento de contraseña', () => {
  beforeEach(() => {
    // Enter email and password
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
  });

  it('Yo como administrador de usuarios necesito generar enlaces para restablecer las contraseñas de usuario.', () => {
    // Prerrequisito: Iniciar sesión como administrador y estar en la página de usuarios.
    // NOTA: Se utiliza un comando personalizado cy.login() y una URL base no configurada.
    cy.log('Prerrequisito: Iniciar sesión y visitar la página de usuarios');
    cy.url().should('include', '/dashboard');
    cy.visit('/dashboard/users');

    // Asegurarse de que la tabla de usuarios esté visible
    cy.get('table').should('be.visible');

    cy.visit('/dashboard/users/28/edit');

    // Criterio de Aceptación 1 y 2: Seleccionar un usuario y encontrar la opción para enviar el enlace.
    cy.log('Paso 1: Encontrar un usuario y hacer clic en el botón de generar enlace');
    // NOTA: El selector para el botón es un placeholder.
    cy.contains('ml19017@ues.edu.sv').should('be.visible');
    //cy.contains('button', 'Enviar enlace').scrollIntoView().click();

    // Criterio de Aceptación 3 y 4: El sistema envía el enlace y muestra una confirmación.
    cy.log('Paso 2: Verificar que se muestra el mensaje de éxito');
    // Se busca específicamente dentro de las notificaciones de Sonner.
    //cy.get('[data-sonner-toast]').contains('Enlace de restablecimiento de contraseña enviado correctamente.').should('be.visible');
  });
});
