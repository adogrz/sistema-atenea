

/**
 * **Historia de Usuario: HU-MS-11 - Cambiar Contraseña**
 * **Caso de Uso: CU-MS-11 - Actualización de contraseña por el usuario**
 *
 * **Descripción:** Esta prueba verifica que un usuario autenticado pueda cambiar su propia contraseña.
 *
 * **Criterios de Aceptación:**
 * 1. Un usuario autenticado puede acceder a un formulario para cambiar su contraseña.
 * 2. El formulario requiere la contraseña actual, la nueva contraseña y la confirmación de la nueva contraseña.
 * 3. El sistema valida que la contraseña actual sea correcta.
 * 4. El sistema valida que la nueva contraseña cumpla con los requisitos de seguridad.
 * 5. El sistema valida que la nueva contraseña y su confirmación coincidan.
 * 6. Al enviar el formulario con datos válidos, la contraseña del usuario se actualiza.
 * 7. Se muestra un mensaje de éxito tras el cambio.
 *
 * **Nota:** Esta prueba actualmente utiliza un comando `cy.login()` no definido.
 */
describe('HU-MS-11: Cambiar contraseña', () => {
  it('Yo como usuario quiero poder cambiar mi contraseña.', () => {
    // Prerrequisito: Iniciar sesión como un usuario estándar.
    // NOTA: Se utiliza un comando personalizado cy.login().
    cy.log('Prerrequisito: Iniciar sesión');
    cy.login('usuario@example.com', 'password');

    // Criterio de Aceptación 1: Acceder al formulario para cambiar la contraseña.
    cy.log('Paso 1: Visitar la página de cambio de contraseña');
    cy.visit('/change-password');

    // Criterio de Aceptación 2, 3, 4, 5: Completar el formulario con datos válidos.
    cy.log('Paso 2: Rellenar el formulario con la contraseña actual y la nueva');
    cy.get('input[name="old_password"]').type('password');
    cy.get('input[name="new_password"]').type('new_password');
    cy.get('input[name="new_password_confirmation"]').type('new_password');

    // Criterio de Aceptación 6: Enviar el formulario.
    cy.log('Paso 3: Hacer clic en el botón de guardar');
    cy.get('button[type="submit"]').click();

    // Criterio de Aceptación 7: Verificar el mensaje de éxito.
    cy.log('Paso 4: Verificar que se muestra el mensaje de éxito');
    cy.contains('Contraseña actualizada correctamente').should('be.visible');
  });
});
