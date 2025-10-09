
/**
 * **Historia de Usuario: HU-MS-08 - Crear Cuentas de Usuario**
 * **Caso de Uso: CU-MS-08 - Creación de nuevos usuarios**
 *
 * **Descripción:** Esta prueba verifica que un administrador pueda crear una nueva cuenta de usuario en el sistema.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede acceder al formulario de creación de usuarios desde el panel de gestión de usuarios.
 * 2. El administrador puede completar los campos requeridos: nombre, email, contraseña, rol y sede.
 * 3. Al enviar el formulario, se crea un nuevo registro de usuario en la base de datos.
 * 4. El nuevo usuario aparece en la lista de usuarios del panel de administración.
 */
describe('HU-MS-08: Crear cuentas de usuario', () => {
  beforeEach(() => {
    // Login as an admin
    cy.visit('/login');

    // Enter email and password
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();

  });

  it('Yo como administrador TI debo de poder crear nuevas cuentas de usuario.', () => {
    // Criterio de Aceptación 1: Acceder al formulario de creación de usuarios.
    cy.url().should('include', '/dashboard');
    cy.wait(1000);
    cy.log('Paso 1: Visitar la página de usuarios y hacer clic en "Agregar"');
    cy.visit('/dashboard/users');
    cy.wait(1000); // Espera breve para asegurar que la página cargue completamente
    cy.get('#add-user-button').click();

    // Criterio de Aceptación 2: Completar los campos requeridos.
    cy.log('Paso 2: Rellenar el formulario con los datos del nuevo usuario');
    cy.get('input#name').type('Cristian Mejia');
    cy.get('input#email').type('ml19017@ues.edu.sv');

    cy.log('Paso 2a: Seleccionar Sede');
    cy.contains('label', 'Sede')
      .parent()
      .find('[data-slot="select-trigger"]')
      .should('be.visible')
      .click({ force: true });
    // Espera a que aparezcan las opciones del select
    cy.get('[data-slot="select-content"]', { timeout: 5000 })
      .should('be.visible');
    // Selecciona la opción "Sede Central"
    cy.contains('[data-slot="select-item"]', 'Sede Central')
      .click({ force: true });
    // Verifica que el texto del trigger cambió correctamente
    cy.get('[data-slot="select-trigger"]').should('contain', 'Sede Central');

    cy.log('Paso 2a: Asignar un nuevo rol (Estudiante)');
    cy.contains('label', 'Roles').parent().find('button[role="combobox"]').should('be.visible').click();
    cy.get('input[placeholder="Buscar rol..."]').should('be.visible').type('Estudiante');
    cy.contains('[role="option"]', 'Estudiante').should('be.visible').click();
    cy.contains('button', 'Agregar').should('be.visible').click();

    // Rellena los campos de contraseña y confirmación
    cy.get('input[placeholder="Contraseña"]').type('Password123!');
    cy.get('input[placeholder="••••••••"]').type('Password123!');

    // Criterio de Aceptación 3: Enviar el formulario.
    cy.log('Paso 3: Hacer clic en el botón para crear la cuenta');
    cy.contains('button', 'Crear cuenta').click();
    cy.wait(1000); // Espera para asegurar que la acción de guardar se complete
    // Criterio de Aceptación 4: Verificar que el nuevo usuario aparece en la lista.
    cy.log('Paso 4: Verificar que el usuario aparece en la tabla de usuarios');
    cy.wait(1000); // Espera breve para asegurar que la redirección se complete
    cy.url().should('include', '/dashboard/users');
    cy.get('input[placeholder="Buscar..."]').type('ml19017@ues.edu.sv');
    cy.contains('ml19017@ues.edu.sv').should('be.visible');
    cy.contains('Estudiante').should('be.visible');
    
  });
});
