

/**
 * **Historia de Usuario: HU-MS-07 - Eliminar Cuentas de Usuario**
 * **Caso de Uso: CU-MS-07 - Eliminación de usuarios**
 *
 * **Descripción:** Esta prueba verifica que un administrador pueda eliminar la cuenta de un usuario.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede seleccionar un usuario y encontrar un botón para eliminarlo.
 * 2. Al hacer clic en eliminar, se muestra un diálogo de confirmación para prevenir acciones accidentales.
 * 3. Al confirmar la eliminación, la cuenta del usuario es eliminada (lógicamente) del sistema.
 * 4. El usuario eliminado ya no aparece en la lista principal de usuarios.
 *
 * **Nota:** Esta prueba actualmente utiliza selectores de placeholder y un comando `cy.login()` no definido.
 */
describe('HU-MS-07: Eliminar cuentas de usuario', () => {
  beforeEach(() => {
    // Login as an admin
    cy.log('Prerrequisito: Iniciar sesión como administrador');
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Admin TI').should('be.visible');
  });

  it('Yo como administrador TI debo de poder eliminar cuentas de usuario.', () => {
    // Prerrequisito: Iniciar sesión como administrador y estar en la página de usuarios.
    // NOTA: Se utiliza un comando personalizado cy.login() y una URL base no configurada.
    cy.log('Prerrequisito: Iniciar sesión y visitar la página de usuarios');

    // Criterio de Aceptación 1: Encontrar un usuario y hacer clic en el botón de eliminar.
    cy.log('Paso 1: Encontrar un usuario y hacer clic en eliminar');
    cy.visit('/dashboard/users');
    cy.url().should('include', '/dashboard/users');
    // NOTA: El selector para el botón es un placeholder.
    // Criterio de Aceptación 4: Verificar que los cambios se guardaron.                                                                                                
    
    cy.log('Buscando al usuario a eliminar y verificando su existencia');
    cy.wait(1000); // Espera breve para asegurar que la redirección se complete
    cy.url().should('include', '/dashboard/users');
    cy.get('input[placeholder="Buscar..."]').type('calificador2@atenea.com');
    cy.contains('calificador2@atenea.com').should('be.visible');
    cy.get('[name="user-selection"]').click();

    // Criterio de Aceptación 2: Confirmar la eliminación en el diálogo.
    cy.log('Paso 2: Confirmar la eliminación');
    cy.get('#delete-user-button > span').click();

    cy.get('button').contains('Sí, eliminar usuario').should('be.visible').click();

    // Criterio de Aceptación 3 y 4: Verificar que el usuario ya no está en la lista.
    cy.log('Paso 3: Verificar que el usuario fue eliminado de la tabla');
    cy.contains('calificador2@atenea.com').should('not.exist');
  });
});
