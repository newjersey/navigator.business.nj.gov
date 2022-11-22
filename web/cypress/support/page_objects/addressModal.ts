class AddressModal {
  getFullName() {
    return cy.get('input[name="addressName"]');
  }
  getAddressLine1() {
    return cy.get('input[name="addressLine1"]');
  }
  getAddressLine2() {
    return cy.get('input[name="addressLine2"]');
  }
  getCity() {
    return cy.get('input[name="addressCity"]');
  }
  getState() {
    return cy.get('input[name="addressState"]');
  }
  getZipCode() {
    return cy.get('input[name="addressZipCode"]');
  }

  clickCancelButton() {
    cy.get('[data-testid="modal-button-secondary"]').click();
  }
  clickAddMemberButton() {
    cy.get('[data-testid="modal-button-primary"]').click();
  }

  selectState(state?: string) {
    this.getState().click();
    cy.get('[role="listbox"]')
      .contains(state ? state : "")
      .click();
  }

  typeFullName(name: string) {
    this.getFullName().clear().type(name).blur();
  }
  typeAddressLine1(name: string) {
    this.getAddressLine1().clear().type(name).blur();
  }
  typeAddressLine2(name: string) {
    this.getAddressLine2().clear().type(name).blur();
  }
  typeCity(name?: string) {
    this.getCity()
      .clear()
      .type(name ? name : "")
      .blur();
  }
  typeZipCode(name: string) {
    this.getZipCode().clear().type(name).blur();
  }
}

export const onAddressModal = new AddressModal();
