
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/*
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.intercept('**').as('allRequests'); // Intercept all requests
    cy.visit('/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').contains('Iniciar sesión').click();
    cy.url().should('not.eq', 'about:blank'); // Ensure not on about:blank
    cy.url().should('include', '/dashboard'); // Assert final URL
  });
});
*/
