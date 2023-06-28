class BusinessStructurePage {
  getLegalStructure(value: string) {
    return cy.get(`input[name="legal-structure"][value="${value}"]`);
  }

  selectLegalStructure(value: string) {
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
