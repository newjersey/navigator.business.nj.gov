class BusinessStructurePage {
  getLegalStructure(value: string) {
    return cy.get(`[value="${value}"]`);
  }

  selectLegalStructure(value: string) {
    // Open the accordion to ensure  all legal structure options are visible
    const otherBusinessStructuresAccordion = cy.get(
      `[data-testid="other-business-structures-header"]`,
    );
    otherBusinessStructuresAccordion.click();

    this.getLegalStructure(value).scrollIntoView();
    // radio checked twice to prevent local flaky tests
    this.getLegalStructure(value).check();
    this.getLegalStructure(value).check();
  }

  saveLegalStructure() {
    cy.get('button[data-testid="save-business-structure"]').click();
  }
}

export const onBusinessStructurePage = new BusinessStructurePage();
