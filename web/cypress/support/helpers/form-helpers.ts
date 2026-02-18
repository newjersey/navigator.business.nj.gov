/**
 * Form helper utilities for Cypress tests
 * These helpers work with React's event system instead of bypassing it
 */

/**
 * Fills multiple form fields using standard Cypress commands
 * @param fields - Record of data-testid to value mappings
 * @example
 * fillForm({
 *   'business-name': 'Test Business',
 *   'address-1': '123 Main St',
 *   'zipcode': '07001'
 * });
 */
export const fillForm = (fields: Record<string, string>): void => {
  Object.entries(fields).forEach(([testId, value]) => {
    cy.get(`[data-testid="${testId}"]`).clear().type(value);
  });
};

/**
 * Verifies form field values match expected values
 * @param fields - Record of data-testid to expected value mappings
 * @example
 * verifyFormValues({
 *   'business-name': 'Test Business',
 *   'address-1': '123 Main St'
 * });
 */
export const verifyFormValues = (fields: Record<string, string>): void => {
  Object.entries(fields).forEach(([testId, expectedValue]) => {
    cy.get(`[data-testid="${testId}"]`).should("have.value", expectedValue);
  });
};

/**
 * Clears all specified form fields
 * @param testIds - Array of data-testid values to clear
 * @example
 * clearFormFields(['business-name', 'address-1', 'zipcode']);
 */
export const clearFormFields = (testIds: string[]): void => {
  testIds.forEach((testId) => {
    cy.get(`[data-testid="${testId}"]`).clear();
  });
};
