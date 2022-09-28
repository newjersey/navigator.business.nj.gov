/* eslint-disable cypress/no-unnecessary-waiting */
import { FormationFormData, LookupIndustryById, randomInt } from "@businessnjgovnavigator/shared/";
import {
  AdditionalFormation,
  completeNewBusinessOnboarding,
  generateFormationAddress,
  generateMunicipality,
} from "cypress/support/helpers";
import { onAddressModal } from "cypress/support/page_objects/addressModal";
import { onBusinessFormationPage } from "cypress/support/page_objects/businessFormationPage";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import dayjs from "dayjs";

describe("Business Formation [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("successfully forms an LLC business", () => {
    const industry = LookupIndustryById("food-truck");
    const legalStructureId = "limited-liability-company";
    const businessNameSearch = "My Cool Business";
    const businessStartDate = dayjs().add(2, "months").format("MM/DD/YYYY");
    const businessSuffix = "LIMITED LIABILITY CO";
    const businessAddressLine1 = `some-business-address-1-${randomInt()}`;
    const businessAddressLine2 = `some-business-address-2-${randomInt()}`;
    const businessAddressCity = generateMunicipality({ displayName: "Allendale" });
    const businessAddressZipCode = "07005";
    const businessPurpose = "My Business Purpose...";
    const provisions: FormationFormData["provisions"] = ["My Provision 1", "My Provision 2"];
    const agentNumberOrManual: FormationFormData["agentNumberOrManual"] = "MANUAL_ENTRY";
    const registeredAgentSameAsAccountCheckbox = false;
    const agentName = "John Doe";
    const agentEmail = "John.Doe@gmail.com";
    const getRegisteredAgentSameAsBusinessAddressCheckbox = false;
    const agentOfficeAddressLine1 = "123 Agent Main St.";
    const agentOfficeAddressLine2 = "Apt Agent 321";
    const agentOfficeAddressCity = "My City";
    const agentOfficeAddressZipCode = "07666";
    const members: FormationFormData["members"] = [
      generateFormationAddress({ addressZipCode: "07333" }),
      generateFormationAddress({ addressZipCode: "07996" }),
    ];
    const signers: FormationFormData["members"] = [
      generateFormationAddress({}),
      generateFormationAddress({}),
      generateFormationAddress({}),
    ];
    const contactFirstName = "Joe";
    const contactLastName = "Smith";
    const contactPhoneNumber = "1324567894";

    const certificateOfStanding = true;
    const certifiedCopyOfFormationDocument = true;
    const paymentType: FormationFormData["paymentType"] = "ACH";

    completeNewBusinessOnboarding({
      industry,
      legalStructureId,
    });

    onDashboardPage.clickRoadmapTask("form-business-entity");
    submitBusinessNameSearchAndContinue(businessNameSearch);

    typeDesignatorAndStartDate({ businessStartDate, businessSuffix });
    typeBusinessAddress({
      businessAddressLine1,
      businessAddressLine2,
      businessAddressCity,
      businessAddressZipCode,
    });
    typeBusinessPurpose(businessPurpose);
    typeProvisions(provisions);
    onBusinessFormationPage.clickContinueToNextTab();

    selectAndTypeRegisteredAgent({
      agentNumberOrManual,
      registeredAgentSameAsAccountCheckbox,
      agentName,
      agentEmail,
      getRegisteredAgentSameAsBusinessAddressCheckbox,
      agentOfficeAddressLine1,
      agentOfficeAddressLine2,
      agentOfficeAddressCity,
      agentOfficeAddressZipCode,
    });

    addMembersToFormation(members);
    addSigners(signers);
    onBusinessFormationPage.clickContinueToNextTab();

    typeBillingContactInfo({
      contactFirstName,
      contactLastName,
      contactPhoneNumber,
    });
    selectServices({ certificateOfStanding, certifiedCopyOfFormationDocument, paymentType });
    onBusinessFormationPage.clickContinueToNextTab();
    onBusinessFormationPage.clickContinueToNextTab();
    onBusinessFormationPage.getFormationSuccessPage().should("be.visible");
  });
});

const submitBusinessNameSearchAndContinue = (name: string) => {
  cy.url().should("include", "form-business-entity");
  onBusinessFormationPage.typeBusinessNameSearch(name);
  onBusinessFormationPage.getBusinessNameSearch().invoke("prop", "value").should("contain", name);
  onBusinessFormationPage.submitBusinessNameSearch();
  onBusinessFormationPage.getAvailableBusinessNameAlert().should("be.visible");
  onBusinessFormationPage.clickContinueToNextTab();
};

const typeDesignatorAndStartDate = ({ businessSuffix, businessStartDate }: Partial<FormationFormData>) => {
  if (businessSuffix) {
    onBusinessFormationPage.selectBusinessDesignator(businessSuffix);
    onBusinessFormationPage.getBusinessDesignator().invoke("prop", "value").should("contain", businessSuffix);
  }
  if (businessStartDate) {
    onBusinessFormationPage.typeBusinessStartDate(businessStartDate as string);
    onBusinessFormationPage
      .getBusinessStartDate()
      .invoke("prop", "value")
      .should("contain", businessStartDate);
  }
};

const typeBusinessAddress = ({
  businessAddressLine1,
  businessAddressLine2,
  businessAddressCity,
  businessAddressZipCode,
}: Partial<FormationFormData>) => {
  if (businessAddressLine1) {
    onBusinessFormationPage.typeBusinessAddressLine1(businessAddressLine1 as string);
    onBusinessFormationPage
      .getBusinessAddressLine1()
      .invoke("prop", "value")
      .should("contain", businessAddressLine1);
  }
  if (businessAddressLine2) {
    onBusinessFormationPage.typeBusinessAddressLine2(businessAddressLine2 as string);
    onBusinessFormationPage
      .getBusinessAddressLine2()
      .invoke("prop", "value")
      .should("contain", businessAddressLine2);
  }
  if (businessAddressCity) {
    onBusinessFormationPage.selectBusinessAddressCity(businessAddressCity.displayName);
    onBusinessFormationPage
      .getBusinessAddressCity()
      .invoke("prop", "value")
      .should("contain", businessAddressCity.displayName);
  }
  if (businessAddressZipCode) {
    onBusinessFormationPage.typeBusinessAddressZipCode(businessAddressZipCode);
    onBusinessFormationPage
      .getBusinessAddressZipCode()
      .invoke("prop", "value")
      .should("contain", businessAddressZipCode);
  }
};

const typeBusinessPurpose = (businessPurpose: FormationFormData["businessPurpose"]) => {
  onBusinessFormationPage.clickAddBusinessPurpose();
  onBusinessFormationPage.typeBusinessPurpose(businessPurpose as string);
  onBusinessFormationPage.getBusinessPurpose().invoke("prop", "value").should("contain", businessPurpose);
};

const typeProvisions = (provisions: FormationFormData["provisions"]) => {
  onBusinessFormationPage.clickAddProvisions();
  for (const [index, privision] of provisions.entries()) {
    onBusinessFormationPage.typeProvision(privision, index);
    onBusinessFormationPage.getProvision(index).invoke("prop", "value").should("contain", provisions[index]);
    if (index + 1 < provisions.length) {
      onBusinessFormationPage.clickAddNewProvision();
    }
  }
};

const selectAndTypeRegisteredAgent = ({
  agentNumberOrManual,
  agentNumber,
  registeredAgentSameAsAccountCheckbox,
  agentName,
  agentEmail,
  getRegisteredAgentSameAsBusinessAddressCheckbox,
  agentOfficeAddressLine1,
  agentOfficeAddressLine2,
  agentOfficeAddressCity,
  agentOfficeAddressZipCode,
}: Partial<AdditionalFormation>) => {
  if (agentNumberOrManual === "NUMBER") {
    onBusinessFormationPage.getRegisteredAgentNumberRadio().check();
    onBusinessFormationPage.getRegisteredAgentNumberRadio().should("be.checked");

    if (agentNumber) {
      onBusinessFormationPage.typeRegisteredAgentIdNumber(agentNumber);
      onBusinessFormationPage
        .getRegisteredAgentIdNumber()
        .invoke("prop", "value")
        .should("contain", agentNumber);
    }
  }
  if (agentNumberOrManual === "MANUAL_ENTRY") {
    onBusinessFormationPage.getRegisteredAgentManualRadio().check();
    onBusinessFormationPage.getRegisteredAgentManualRadio().should("be.checked");

    if (registeredAgentSameAsAccountCheckbox) {
      onBusinessFormationPage.getRegisteredAgentSameAsAccountCheckbox().check();
      onBusinessFormationPage.getRegisteredAgentManualRadio().should("be.checked");
      onBusinessFormationPage.getRegisteredAgentName().should("be.disabled");
      onBusinessFormationPage.getRegisteredAgentEmail().should("be.disabled");
    }
    if (agentName) {
      onBusinessFormationPage.typeRegisteredAgentName(agentName);
      onBusinessFormationPage.getRegisteredAgentName().invoke("prop", "value").should("contain", agentName);
    }
    if (agentEmail) {
      onBusinessFormationPage.typeRegisteredAgentEmail(agentEmail);
      onBusinessFormationPage.getRegisteredAgentEmail().invoke("prop", "value").should("contain", agentEmail);
    }
    if (getRegisteredAgentSameAsBusinessAddressCheckbox) {
      onBusinessFormationPage.getRegisteredAgentSameAsBusinessAddressCheckbox().check();
      onBusinessFormationPage.getRegisteredAgentManualRadio().should("be.checked");
      onBusinessFormationPage.getRegisteredAgentAddressLine1().should("be.disabled");
      onBusinessFormationPage.getRegisteredAgentAddressLine2().should("be.disabled");
      onBusinessFormationPage.getRegisteredAgentCity().should("be.disabled");
      onBusinessFormationPage.getRegisteredAgentState().should("be.disabled");
      onBusinessFormationPage.getRegisteredAgentZipCode().should("be.disabled");
    }
    if (agentOfficeAddressLine1) {
      onBusinessFormationPage.typeRegisteredAgentAddressLine1(agentOfficeAddressLine1);
      onBusinessFormationPage
        .getRegisteredAgentAddressLine1()
        .invoke("prop", "value")
        .should("contain", agentOfficeAddressLine1);
    }
    if (agentOfficeAddressLine2) {
      onBusinessFormationPage.typeRegisteredAgentAddressLine2(agentOfficeAddressLine2);
      onBusinessFormationPage
        .getRegisteredAgentAddressLine2()
        .invoke("prop", "value")
        .should("contain", agentOfficeAddressLine2);
    }
    if (agentOfficeAddressCity) {
      onBusinessFormationPage.typeRegisteredAgentCity(agentOfficeAddressCity);
      onBusinessFormationPage
        .getRegisteredAgentCity()
        .invoke("prop", "value")
        .should("contain", agentOfficeAddressCity);
    }
    if (agentOfficeAddressZipCode) {
      onBusinessFormationPage.typeRegisteredAgentZipCode(agentOfficeAddressZipCode);
      onBusinessFormationPage
        .getRegisteredAgentZipCode()
        .invoke("prop", "value")
        .should("contain", agentOfficeAddressZipCode);
    }
  }
};

const addMembersToFormation = (members: FormationFormData["members"]) => {
  for (const membersObj of members) {
    onBusinessFormationPage.clickAddNewMembers();
    onAddressModal.typeFullName(membersObj.name);
    onAddressModal.getFullName().invoke("prop", "value").should("contain", membersObj.name);

    onAddressModal.typeAddressLine1(membersObj.addressLine1);
    onAddressModal.getAddressLine1().invoke("prop", "value").should("contain", membersObj.addressLine1);

    onAddressModal.typeAddressLine2(membersObj.addressLine2);
    onAddressModal.getAddressLine2().invoke("prop", "value").should("contain", membersObj.addressLine2);

    onAddressModal.typeCity(membersObj.addressCity);
    onAddressModal.getCity().invoke("prop", "value").should("contain", membersObj.addressCity);

    onAddressModal.selectState(membersObj.addressState);
    onAddressModal.getState().invoke("prop", "value").should("contain", membersObj.addressState);

    onAddressModal.typeZipCode(membersObj.addressZipCode);
    onAddressModal.getZipCode().invoke("prop", "value").should("contain", membersObj.addressZipCode);

    onAddressModal.clickAddMemberButton();
  }
};

const addSigners = (signers: FormationFormData["signers"]) => {
  for (const [index, signer] of signers.entries()) {
    onBusinessFormationPage.typeSigner(signer.name, index);
    onBusinessFormationPage.getSigner(index).invoke("prop", "value").should("contain", signer.name);
    onBusinessFormationPage.getSignerSignatureCheckbox(index).check();
    onBusinessFormationPage.getSignerSignatureCheckbox(index).should("be.checked");

    if (index + 1 < signers.length) {
      onBusinessFormationPage.clickAddNewSigner();
    }
  }
};

const typeBillingContactInfo = ({
  contactFirstName,
  contactLastName,
  contactPhoneNumber,
}: Partial<FormationFormData>) => {
  if (contactFirstName) {
    onBusinessFormationPage.typeContactFirstName(contactFirstName);
    onBusinessFormationPage.getContactFirstName().invoke("prop", "value").should("contain", contactFirstName);
  }
  if (contactLastName) {
    onBusinessFormationPage.typeContactLastName(contactLastName);
    onBusinessFormationPage.getContactLastName().invoke("prop", "value").should("contain", contactLastName);
  }
  if (contactPhoneNumber) {
    onBusinessFormationPage.typeContactPhoneNumber(contactPhoneNumber);
    onBusinessFormationPage
      .getContactPhoneNumber()
      .invoke("prop", "value")
      .should(
        "contain",
        `(${contactPhoneNumber.slice(0, 3)}) ${contactPhoneNumber.slice(3, 6)}-${contactPhoneNumber.slice(
          6,
          10
        )}`
      );
  }
};

const selectServices = ({
  certificateOfStanding,
  certifiedCopyOfFormationDocument,
  paymentType,
}: Partial<FormationFormData>) => {
  if (certificateOfStanding) {
    onBusinessFormationPage.getCertificateOfStanding().check();
    onBusinessFormationPage.getCertificateOfStanding().should("be.checked");
  }
  if (certifiedCopyOfFormationDocument) {
    onBusinessFormationPage.getCertifiedCopyOfFormationDocument().check();
    onBusinessFormationPage.getCertifiedCopyOfFormationDocument().should("be.checked");
  }
  if (paymentType === "CC") {
    onBusinessFormationPage.getPaymenTypeCreditCardRadio().check();
    onBusinessFormationPage.getPaymenTypeCreditCardRadio().should("be.checked");
  }
  if (paymentType === "ACH") {
    onBusinessFormationPage.getPaymentTypeAHCRadio().check();
    onBusinessFormationPage.getPaymentTypeAHCRadio().should("be.checked");
  }
};
