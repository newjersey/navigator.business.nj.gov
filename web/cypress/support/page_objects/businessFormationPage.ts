class BusinessFormationPage {
  getAvailableBusinessNameAlert() {
    return cy.get('[data-testid="available-text"]');
  }
  getBusinessAddressLine1() {
    return cy.get('input[name="addressLine1"]');
  }
  getBusinessAddressLine2() {
    return cy.get('input[name="addressLine2"]');
  }
  getBusinessAddressMunicipality() {
    return cy.get('[id="addressMunicipality"]');
  }
  getBusinessAddressZipCode() {
    return cy.get('input[name="addressZipCode"]');
  }
  getBusinessNameSearch() {
    return cy.get('[aria-label="Search business name"]');
  }
  getBusinessDesignator() {
    return cy.get('[data-testid="business-suffix"]');
  }
  getBusinessStartDate() {
    return cy.get('[data-testid="date-businessStartDate"]');
  }
  getBusinessPurpose() {
    return cy.get('textarea[name="businessPurpose"]');
  }
  getProvision(number: number) {
    return cy.get(`textarea[name="provisions ${number}"]`);
  }
  getRegisteredAgentNumberRadio() {
    return cy.get('[type="radio"][value="NUMBER"]');
  }
  getRegisteredAgentManualRadio() {
    return cy.get('[type="radio"][value="MANUAL_ENTRY"]');
  }
  getRegisteredAgentIdNumber() {
    return cy.get('input[name="agentNumber"]');
  }
  getRegisteredAgentSameAsAccountCheckbox() {
    return cy.get('[id="same-agent-info-as-account-checkbox"]');
  }
  getRegisteredAgentSameAsBusinessAddressCheckbox() {
    return cy.get('[id="same-agent-address-as-business-checkbox"]');
  }
  getRegisteredAgentName() {
    return cy.get('input[name="agentName"]');
  }
  getRegisteredAgentEmail() {
    return cy.get('input[name="agentEmail"]');
  }
  getRegisteredAgentAddressLine1() {
    return cy.get('input[name="agentOfficeAddressLine1"]');
  }
  getRegisteredAgentAddressLine2() {
    return cy.get('input[name="agentOfficeAddressLine2"]');
  }
  getRegisteredAgentCity() {
    return cy.get('[id="agentOfficeAddressCity"]');
  }
  getRegisteredAgentZipCode() {
    return cy.get('input[name="agentOfficeAddressZipCode"]');
  }
  getSigner(number: number) {
    return cy.get(`input[aria-label="Signer ${number}"]`);
  }
  getSignerSignatureCheckbox(number: number) {
    if (!number) {
      return cy.get(`[id="signature-checkbox-signers"]`);
    } else {
      return cy.get(`[id="signature-checkbox-signers-${number}"]`);
    }
  }
  getContactFirstName() {
    return cy.get('input[name="contactFirstName"]');
  }
  getContactLastName() {
    return cy.get('input[name="contactLastName"]');
  }
  getContactPhoneNumber() {
    return cy.get('input[name="contactPhoneNumber"]');
  }
  getCertificateOfStanding() {
    return cy.get('input[id="certificateOfStanding"]');
  }
  getCertifiedCopyOfFormationDocument() {
    return cy.get('input[id="certifiedCopyOfFormationDocument"]');
  }
  getPaymenTypeCreditCardRadio() {
    return cy.get('input[id="paymentTypeCreditCardRadio"]');
  }
  getPaymentTypeAHCRadio() {
    return cy.get('input[id="paymentTypeACHRadio"]');
  }
  getFormationSuccessPage() {
    return cy.get('[data-testid="formation-success-page"]');
  }

  clickContinueToNextTab() {
    cy.get('[data-testid="next-button"]').click();
  }
  clickAddBusinessPurpose() {
    cy.get('[data-testid="show-businessPurpose"]').click();
  }
  clickAddProvisions() {
    cy.get('[data-testid="show-provisions"]').click();
  }
  clickAddNewProvision() {
    cy.get('[data-testid="add-new-provision"]').click();
  }
  clickAddNewMembers() {
    cy.get('[data-testid="addresses-members-newButtonText"]').click();
  }
  clickAddNewSigner() {
    cy.get('[data-testid="add-new-signer"]').click();
  }

  selectBusinessAddressMunicipality(city: string) {
    this.getBusinessAddressMunicipality().click();
    cy.get('[role="listbox"]').contains(city).click();
  }
  selectBusinessDesignator(businessSuffix: string) {
    cy.get('[id="business-suffix"]').click();
    cy.get('[role="listbox"]').contains(businessSuffix).click();
  }

  typeBusinessAddressLine1(address: string) {
    this.getBusinessAddressLine1().clear().type(address).blur();
  }
  typeBusinessAddressLine2(address: string) {
    this.getBusinessAddressLine2().clear().type(address).blur();
  }
  typeBusinessAddressZipCode(zipCode: string) {
    this.getBusinessAddressZipCode().clear().type(zipCode).blur();
  }
  typeBusinessNameSearch(businessName: string) {
    this.getBusinessNameSearch().clear().type(businessName).blur();
  }
  typeBusinessStartDate(monthYearString: string) {
    cy.chooseDatePicker('[data-testid="date-businessStartDate"]', monthYearString);
  }
  typeBusinessPurpose(purpose: string) {
    this.getBusinessPurpose().clear().type(purpose).blur();
  }
  typeRegisteredAgentName(name: string) {
    this.getRegisteredAgentName().clear().type(name).blur();
  }
  typeRegisteredAgentEmail(email: string) {
    this.getRegisteredAgentEmail().clear().type(email).blur();
  }
  typeProvision(provision: string, number: number) {
    this.getProvision(number).clear().type(provision).blur();
  }
  typeRegisteredAgentIdNumber(number: string) {
    this.getRegisteredAgentIdNumber().clear().type(number).blur();
  }
  typeRegisteredAgentAddressLine1(address: string) {
    this.getRegisteredAgentAddressLine1().clear().type(address).blur();
  }
  typeRegisteredAgentAddressLine2(address: string) {
    this.getRegisteredAgentAddressLine2().clear().type(address).blur();
  }

  typeRegisteredAgentCity(city: string) {
    this.getRegisteredAgentCity().clear().type(city).blur;
  }
  typeRegisteredAgentZipCode(zipCode: string) {
    this.getRegisteredAgentZipCode().clear().type(zipCode).blur();
  }
  typeSigner(name: string, number: number) {
    this.getSigner(number).clear().type(name).blur();
  }
  typeContactFirstName(name: string) {
    this.getContactFirstName().focus().clear().type(name).blur();
  }
  typeContactLastName(name: string) {
    this.getContactLastName().clear().type(name).blur();
  }
  typeContactPhoneNumber(name: string) {
    this.getContactPhoneNumber().clear().type(name).blur();
  }

  submitBusinessNameSearch() {
    cy.get('[data-testid="business-name-search-submit"]').click();
  }
}

export const onBusinessFormationPage = new BusinessFormationPage();
