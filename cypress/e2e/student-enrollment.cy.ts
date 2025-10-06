
describe('Student Enrollment', () => {
  // Test Case 1: Successful Enrollment
  it('should allow a student with a complete profile to enroll in an olympiad', () => {
    // Mock user login - replace with actual login command
    cy.login('student');

    // Visit the olympiad registration page
    cy.visit('/olympics-registration');

    // Find an available olympiad and click the enroll button
    cy.contains('.card', 'Olimpiada de Prueba').within(() => {
      cy.contains('Inscribirse').click();
    });

    // Assert that the enrollment was successful
    cy.contains('Inscrito').should('be.visible');
  });

  // Test Case 2: Incomplete Profile
  it('should not allow a student with an incomplete profile to enroll', () => {
    // Mock user login with incomplete profile
    cy.login('student_incomplete');

    // Visit the olympiad registration page
    cy.visit('/olympics-registration');

    // Verify that a warning message is displayed
    cy.contains('perfil está incompleto').should('be.visible');

    // Assert that the enroll button is disabled
    cy.contains('.card', 'Olimpiada de Prueba').within(() => {
      cy.contains('Inscribirse').should('be.disabled');
    });
  });
});
