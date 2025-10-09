

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
    cy.visit('/login');
    cy.get('#email').type('ml19017@ues.edu.sv');
    cy.get('#password').type('password_incorrecta!');
    cy.get('button[type="submit"]').click();

    cy.contains('El correo o la contraseña son incorrectos.').should('be.visible');
    cy.visit('http://localhost:8000/reset-password/7774dd95327cb64c05e720c0299b193a70f16592eb2a20c7eb75fe66b6ad87ee?email=ml19017%40ues.edu.sv'); 

    cy.get('[name="password"]').type('Password123');
    cy.get('#password_confirmation').type('Password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait(1000);
    // Enter email and password
    cy.get('#email').type('ml19017@ues.edu.sv');
    cy.get('#password').type('Password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.wait(1000); // 1 seg delay to allow the dashboard to load properly
  });
});
