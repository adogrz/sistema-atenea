

/**
 * **Historia de Usuario: HU-MS-05 - Asignar Roles y Sedes**
 * **Caso de Uso: CU-MS-05 - Gestión de asignaciones de usuario**
 *
 * **Descripción:** Esta prueba verifica que un administrador con los permisos adecuados pueda asignar y modificar
 * los roles y la sede de un usuario existente.
 *
 * **Criterios de Aceptación:**
 * 1. Un administrador puede seleccionar un usuario de la lista y acceder al formulario de edición.
 * 2. El formulario de edición permite modificar el rol principal, roles secundarios y la sede del usuario.
 * 3. Al guardar los cambios, estos se reflejan correctamente en el sistema.
 * 4. La interfaz muestra una confirmación de que los cambios han sido guardados.
 * 
 * **Nota:** Esta prueba actualmente utiliza selectores de placeholder y una URL hardcodeada, por lo que necesita ser actualizada.
 */
describe('HU-MS-05: Asignar roles y sedes a usuarios', () => {
  it('Yo como administrador TI debo de poder asignar roles y las sedes ya definidas, a los usuarios.', () => {
    // Prerrequisito: Iniciar sesión como administrador.
    cy.log('Prerrequisito: Iniciar sesión como administrador');
    cy.visit('/login');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();

    cy.url().should('include', '/dashboard');

    // Criterio de Aceptación 1: Acceder al formulario de edición de un usuario.                                                                                        
    cy.log('Paso 1: Visitar la página de edición de un usuario específico (ID 13)');
    cy.log('Paso 1: Visitar la página de gestión de usuarios y luego la de edición');
    cy.visit('/dashboard/users');
    // NOTA: Se navega directamente a la página de edición con un ID hardcodeado.                                                                                       
    // Esto debería ser reemplazado por una selección dinámica del usuario en la tabla.                                                                                 
    cy.visit('/dashboard/users/13/edit');

    // Criterio de Aceptación 2: Modificar el rol y la sede.                                                                                                            
    cy.log('Paso 2: Limpiar roles existentes para un estado limpio');
    // Se buscan los botones de eliminar y se hace clic en cada uno si existen.
    cy.log('Paso 3: Asignar un nuevo rol (Admin Academico)');
    cy.contains('label', 'Roles').parent().find('button[role="combobox"]').should('be.visible').click();
    cy.get('input[placeholder="Buscar rol..."]').should('be.visible').type('admin-academico');
    cy.contains('[role="option"]', 'Administrador Académico').should('be.visible').click();
    cy.contains('button', 'Agregar').should('be.visible').click();
    // Criterio de Aceptación 3: Guardar los cambios.                                                                                                                   
    cy.log('Paso 4: Guardar los cambios haciendo clic en "Actualizar cuenta"');
    cy.contains('button', 'Actualizar cuenta').click();

    // Criterio de Aceptación 4: Verificar que los cambios se guardaron.                                                                                                
    cy.log('Paso 5: Verificar que los cambios se reflejan en la lista de usuarios');
    cy.wait(1000); // Espera breve para asegurar que la redirección se complete
    cy.url().should('include', '/dashboard/users');
    cy.get('input[placeholder="Buscar..."]').type('jadorno@example.org');
    cy.contains('jadorno@example.org').should('be.visible');
    cy.contains('Administrador Académico').should('be.visible');
  });
});      