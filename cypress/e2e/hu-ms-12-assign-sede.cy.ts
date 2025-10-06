import { ifError } from "assert";


/**
 * **Historia de Usuario: HU-MS-12 - Asignar Sede a Usuario**
 * **Caso de Uso: CU-MS-12 - Modificación de sede de usuario**
 *
 * **Descripción:** Esta prueba verifica que un administrador pueda cambiar la sede asignada a un usuario.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede navegar a la página de edición de un usuario.
 * 2. El formulario de edición contiene un campo para seleccionar la sede del usuario.
 * 3. El administrador puede seleccionar una nueva sede de la lista de sedes disponibles.
 * 4. Al guardar, la nueva sede del usuario se actualiza en el sistema.
 * 5. El cambio se refleja en la página de detalles del usuario o en la lista de usuarios.
 *
 * **Nota:** Esta prueba actualmente utiliza selectores de placeholder y un comando `cy.login()` no definido.
 */
describe('HU-MS-12: Asignar sede a usuario', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();
    cy.url().should('include', '/dashboard');
  });

  it('Yo como administrador TI debo de poder asignar una sede a un usuario.', () => {
    // Prerrequisito: Iniciar sesión como administrador.
    cy.log('Prerrequisito: Iniciar sesión como administrador');

    // Criterio de Aceptación 1: Navegar a la página de edición de un usuario.
    cy.log('Paso 1: Visitar la página de edición de un usuario específico (ID 13)');
    // NOTA: Se navega directamente a la página de edición. Un test más robusto seleccionaría al usuario de la tabla.
    cy.visit('/dashboard/users/13/edit');

    // Criterio de Aceptación 2 y 3: Seleccionar una nueva sede.
    cy.log('Paso 2: Cambiar la sede del usuario a \'Sede Central\'');

    // Haz clic en el trigger del select de Sede
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

    // Criterio de Aceptación 4: Guardar los cambios.
    cy.log('Paso 3: Guardar los cambios haciendo clic en "Actualizar cuenta"');
    cy.contains('button', 'Actualizar cuenta').click();

    // Criterio de Aceptación 5: Verificar que el cambio se refleja en la lista.
    cy.log('Paso 4: Verificar que la nueva sede se muestra en la tabla de usuarios');
    cy.url().should('include', '/dashboard/users');
    cy.contains('td', 'usuario@example.com').parent('tr').within(() => {
      cy.contains('Sede Central').should('be.visible');
    });
  });
});
