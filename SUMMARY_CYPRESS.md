### **Resumen de Pruebas Cypress**

Este documento resume las pruebas de Cypress creadas para el proyecto "Sistema Atenea", basadas en los casos de uso y las historias de usuario proporcionadas. Cada prueba está diseñada para verificar una funcionalidad específica del sistema desde la perspectiva del usuario final.

---

#### **HU-MS-01: Iniciar Sesión**

*   **Descripción:** Verifica que un usuario pueda iniciar sesión correctamente con credenciales válidas y que se muestre un mensaje de error con credenciales inválidas.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-01-login.cy.ts`
*   **Casos de prueba:**
    *   Inicio de sesión exitoso con credenciales válidas.
    *   Manejo de credenciales inválidas.

---

#### **HU-MS-02: Cerrar Sesión**

*   **Descripción:** Verifica que un usuario autenticado pueda cerrar su sesión de forma segura y sea redirigido a la página de inicio de sesión.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-02-logout.cy.ts`
*   **Casos de prueba:**
    *   Cierre de sesión exitoso.

---

#### **HU-MS-03: Ver información de perfil de usuario**

*   **Descripción:** Verifica que un usuario autenticado pueda visualizar la información de su perfil (nombre, correo electrónico, rol).
*   **Archivo de prueba:** `cypress/e2e/hu-ms-03-view-profile.cy.ts`
*   **Casos de prueba:**
    *   Visualización correcta de la información del perfil.

---

#### **HU-MS-04: Restablecer contraseña**

*   **Descripción:** Verifica el flujo para que un usuario pueda solicitar un enlace de restablecimiento de contraseña cuando la olvida.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-04-reset-password.cy.ts`
*   **Casos de prueba:**
    *   Solicitud exitosa de enlace de restablecimiento de contraseña.

---

#### **HU-MS-05: Asignar roles y sedes a usuarios**

*   **Descripción:** Verifica que un administrador TI pueda asignar y modificar roles y sedes a los usuarios existentes en el sistema.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-05-assign-roles.cy.ts`
*   **Casos de prueba:**
    *   Asignación/modificación exitosa de rol y sede a un usuario.

---

#### **HU-MS-06: Habilitar y deshabilitar cuentas de usuario**

*   **Descripción:** Verifica que un administrador TI pueda cambiar el estado de una cuenta de usuario (habilitar/deshabilitar).
*   **Archivo de prueba:** `cypress/e2e/hu-ms-06-enable-disable-users.cy.ts`
*   **Casos de prueba:**
    *   Habilitación y deshabilitación exitosa de una cuenta de usuario.

---

#### **HU-MS-07: Eliminar cuentas de usuario**

*   **Descripción:** Verifica que un administrador TI pueda eliminar cuentas de usuario del sistema.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-07-delete-users.cy.ts`
*   **Casos de prueba:**
    *   Eliminación exitosa de una cuenta de usuario.

---

#### **HU-MS-08: Crear cuentas de usuario**

*   **Descripción:** Verifica que un administrador TI pueda crear nuevas cuentas de usuario con los roles y sedes correspondientes.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-08-create-users.cy.ts`
*   **Casos de prueba:**
    *   Creación exitosa de una nueva cuenta de usuario.

---

#### **HU-MS-09: Auditoría de cuentas de usuario**

*   **Descripción:** Verifica que un administrador de usuarios pueda auditar los cambios realizados en las cuentas de usuario a través de un registro de actividades.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-09-audit-users.cy.ts`
*   **Casos de prueba:**
    *   Visualización y filtrado de registros de auditoría.

---

#### **HU-MS-10: Generar enlace de restablecimiento de contraseña**

*   **Descripción:** Verifica que un administrador de usuarios pueda generar y enviar un enlace temporal para restablecer la contraseña de un usuario.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-10-generate-reset-password-link.cy.ts`
*   **Casos de prueba:**
    *   Generación y envío exitoso de un enlace de restablecimiento.

---

#### **HU-MS-11: Cambiar contraseña**

*   **Descripción:** Verifica que un usuario pueda cambiar su contraseña actual por una nueva, asegurando la validación de la misma.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-11-change-password.cy.ts`
*   **Casos de prueba:**
    *   Cambio de contraseña exitoso.

---

#### **HU-MS-12: Asignar sede a usuario**

*   **Descripción:** Verifica que un administrador TI pueda asignar una sede específica a un usuario.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-12-assign-sede.cy.ts`
*   **Casos de prueba:**
    *   Asignación exitosa de sede a un usuario.

---

#### **HU-MS-13: Consultar cuentas de usuario**

*   **Descripción:** Verifica que un administrador TI pueda consultar y visualizar una lista de todas las cuentas de usuario registradas en el sistema.
*   **Archivo de prueba:** `cypress/e2e/hu-ms-13-consult-users.cy.ts`
*   **Casos de prueba:**
    *   Visualización correcta de la tabla de usuarios.
