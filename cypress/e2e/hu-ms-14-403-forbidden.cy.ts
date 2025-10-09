/**
 * **Historia de Usuario: HU-MS-14 - Acceso No Autorizado**
 * **Caso de Uso: CU-MS-14 - Redirección de rutas protegidas**
 *
 * **Descripción:** Esta prueba verifica que los usuarios no autenticados
 * sean redirigidos a la página de inicio de sesión al intentar acceder a rutas protegidas.
 *
 * **Criterios de Aceptación:**
 * 1. Cuando un usuario no autenticado intenta acceder a una ruta protegida,
 *    es redirigido a la página de '/login'.
 * 2. La URL en el navegador debe cambiar a la URL de inicio de sesión.
 */
describe('HU-MS-14: Acceso No Autorizado a Rutas Protegidas', () => {
  // Lista de rutas que deberían estar protegidas por autenticación.
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/audit',
    '/dashboard/users',
    '/dashboard/olimpiadas',
    '/dashboard/inscripciones',
    '/dashboard/calendario',
  ];

  it('Debe redirigir al usuario no autenticado a la página de login', () => {
    cy.log('Verificando la redirección para usuarios no autenticados');

    protectedRoutes.forEach(route => {
      cy.log(`Intentando acceder a: ${route}`);
      // Evita que el test falle si la página responde con un 403, 
      // aunque Laravel debería redirigir a 302.
      cy.visit(route, { failOnStatusCode: false });

      // Criterio de Aceptación 1 y 2: Verificar la redirección a /login
      cy.url().should('include', '/login', `Se esperaba redirección a /login desde ${route}`);
    });
  });
});