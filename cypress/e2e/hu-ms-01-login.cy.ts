

/**
 * **Historia de Usuario: HU-MS-01 - Iniciar Sesión**
 * **Caso de Uso: CU-MS-01 - Autenticación de usuario**
 *
 * **Descripción:** Esta prueba verifica el proceso de inicio de sesión en el sistema "Sistema Atenea".
 * Cubre tanto el escenario de éxito (credenciales válidas) como el de error (credenciales inválidas).
 *
 * **Criterios de Aceptación:**
 * 1. El usuario puede iniciar sesión exitosamente con un correo electrónico y contraseña válidos.
 * 2. Al iniciar sesión correctamente, el usuario es redirigido al dashboard principal.
 * 3. Si el usuario ingresa credenciales incorrectas, se muestra un mensaje de error claro.
 * 4. El sistema no permite el acceso si las credenciales son inválidas.
 */
describe('HU-MS-01: Iniciar Sesión', () => {
  it('Yo como usuario quiero poder iniciar sesión dentro del sistema con mis credenciales (correo y contraseña).', () => {
    // Criterio de Aceptación 1 y 2: Iniciar sesión con credenciales válidas y ser redirigido al dashboard.
    cy.log('Paso 1: Visitar la página de login');
    cy.visit('/login');

    cy.log('Paso 2: Ingresar credenciales válidas');
    cy.get('#email').type('admin@admin.com');
    cy.get('#password').type('password123');

    cy.log('Paso 3: Hacer clic en el botón de iniciar sesión');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();

    cy.log('Paso 4: Verificar redirección al dashboard');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.wait(1000); // 1 seg delay to allow the dashboard to load properly
  });

  it('should show an error message with invalid credentials', () => {
    // Criterio de Aceptación 3 y 4: Mostrar error con credenciales inválidas y no permitir acceso.
    cy.log('Paso 1: Visitar la página de login');
    cy.visit('/login');

    cy.log('Paso 2: Ingresar credenciales inválidas');
    cy.get('#email').type('invalid@example.com');
    cy.get('#password').type('invalidpassword');

    cy.log('Paso 3: Hacer clic en el botón de iniciar sesión');
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();

    cy.log('Paso 4: Verificar que se muestra el mensaje de error');
    cy.contains('El correo o la contraseña son incorrectos.').should('be.visible');
  });
});
