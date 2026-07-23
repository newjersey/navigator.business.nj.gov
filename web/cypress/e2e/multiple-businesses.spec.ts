import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { onOnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";
import { onProfilePage } from "@businessnjgovnavigator/cypress/support/page_objects/profilePage";

describe("Multiple Businesses [feature] [all] [group2]", () => {
  const assertAdditionalBusinessOnboardingPage = (page: number): void => {
    cy.location().should(({ pathname, search }) => {
      const searchParams = new URLSearchParams(search);
      expect(pathname).to.eq("/onboarding");
      expect(searchParams.get("additionalBusiness")).to.eq("true");
      expect(searchParams.get("page")).to.eq(String(page));
    });
  };

  const updateCurrentBusinessName = (businessName: string, requestAlias: string): void => {
    cy.intercept("POST", "**/api/users").as(requestAlias);
    onDashboardPage.clickEditProfileInDropdown();
    cy.url().should("contain", "/profile");
    onProfilePage.getBusinessName().should("be.visible").clear().type(businessName);
    onProfilePage.clickSaveButton();
    cy.wait(`@${requestAlias}`).its("response.statusCode").should("eq", 200);
    cy.url().should("contain", "/dashboard");
  };

  const completeAdditionalBusinessOnboarding = (): void => {
    assertAdditionalBusinessOnboardingPage(1);
    onOnboardingPage.selectBusinessPersona("OWNING");
    onOnboardingPage.selectIndustrySector("construction");
    onOnboardingPage.clickNext();
    cy.url().should("contain", "/dashboard");
  };

  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("adds a second business", () => {
    completeNewBusinessOnboarding({});
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
    onDashboardPage.getAddBusinessButtonInDropdown().click();

    assertAdditionalBusinessOnboardingPage(1);

    onOnboardingPage.selectBusinessPersona("OWNING");
    onOnboardingPage.selectIndustrySector("construction");

    onOnboardingPage.clickNext();
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("exist");

    // additional business has filings calendar
    cy.get('[data-testid="filings-calendar"]').should("exist");

    // switch business
    cy.get('[data-testid="business-title-0"]').click();

    // original business has no calendar
    cy.get('[data-testid="filings-calendar"]').should("not.exist");
  });

  it("keeps profile fields scoped to the selected business after switching and reloading", () => {
    const firstBusinessName = "First Cypress Business";
    const secondBusinessName = "Second Cypress Business";

    completeNewBusinessOnboarding({});
    updateCurrentBusinessName(firstBusinessName, "saveFirstBusiness");

    onDashboardPage.getDropdown().click();
    onDashboardPage.getAddBusinessButtonInDropdown().click();
    completeAdditionalBusinessOnboarding();
    updateCurrentBusinessName(secondBusinessName, "saveSecondBusiness");

    cy.intercept("POST", "**/api/users").as("switchToFirstBusiness");
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').click();
    cy.wait("@switchToFirstBusiness").its("response.statusCode").should("eq", 200);

    cy.visit("/profile");
    onProfilePage.getBusinessName().should("have.value", firstBusinessName);

    cy.intercept("GET", "**/api/users/*").as("reloadFirstBusiness");
    cy.reload();
    cy.wait("@reloadFirstBusiness").its("response.statusCode").should("be.oneOf", [200, 304]);
    onProfilePage.getBusinessName().should("have.value", firstBusinessName);

    cy.intercept("POST", "**/api/users").as("switchToSecondBusiness");
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-1"]').click();
    cy.wait("@switchToSecondBusiness").its("response.statusCode").should("eq", 200);

    cy.url().should("contain", "/dashboard");
    cy.visit("/profile");
    onProfilePage.getBusinessName().should("have.value", secondBusinessName);
  });

  it("exits out of additional business onboarding without saving", () => {
    completeNewBusinessOnboarding({});
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    onDashboardPage.getAddBusinessButtonInDropdown().click();
    assertAdditionalBusinessOnboardingPage(1);

    onOnboardingPage.selectBusinessPersona("STARTING");
    onOnboardingPage.clickNext();
    cy.get('[data-testid="return-to-prev-button"]').click();
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
  });

  it("exits out of additional business onboarding without saving when new business is unsupported", () => {
    completeNewBusinessOnboarding({});
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    onDashboardPage.getAddBusinessButtonInDropdown().click();
    assertAdditionalBusinessOnboardingPage(1);

    onOnboardingPage.selectBusinessPersona("FOREIGN");
    onOnboardingPage.clickNext();

    onOnboardingPage.checkForeignBusinessType("none");
    onOnboardingPage.clickNext();

    cy.get('[data-testid="return-to-prev-button"]').click();
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
  });
});
