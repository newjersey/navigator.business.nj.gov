import { randomElementFromArray } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPageWhenStarting";
import { carServiceOptions, Industries, Industry, randomInt } from "@businessnjgovnavigator/shared/";

const enabledIndustries = Industries.filter((element: Industry) => {
  return element.isEnabled;
});

describe("Onboarding for all industries when starting a business [feature] [all] [group4]", () => {
  describe("Desktop", () => {
    beforeEach(() => {
      cy.loginByCognitoApi();
    });

    for (const industry of enabledIndustries) {
      it(`Onboarding for ${industry.name}`, () => {
        cy.url().should("include", "onboarding?page=1");
        onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
        onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
        onOnboardingPageStartingBusiness.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPageStartingBusiness.selectIndustryDropdown(industry.id);

        const carService = industry.industryOnboardingQuestions.isCarServiceApplicable
          ? randomElementFromArray([...carServiceOptions])
          : undefined;

        if (carService === undefined) {
          onOnboardingPageStartingBusiness.getCarServiceRadio().should("not.exist");
        } else {
          onOnboardingPageStartingBusiness.selectCarServiceRadio(carService);
          onOnboardingPageStartingBusiness.getCarServiceRadio(carService).should("be.checked");

          const otherValues = carServiceOptions.filter((value) => value !== carService);
          for (const value of otherValues) {
            onOnboardingPageStartingBusiness.getCarServiceRadio(value).should("not.be.checked");
          }
        }
        const isChildcareForSixOrMore = industry.industryOnboardingQuestions.isChildcareForSixOrMore
          ? Boolean(randomInt() % 2)
          : undefined;

        if (isChildcareForSixOrMore === undefined) {
          onOnboardingPageStartingBusiness.getChildcareRadio().should("not.exist");
        } else {
          onOnboardingPageStartingBusiness.selectChildcareRadio(isChildcareForSixOrMore);
          onOnboardingPageStartingBusiness.getChildcareRadio(isChildcareForSixOrMore).should("be.checked");
          onOnboardingPageStartingBusiness
            .getChildcareRadio(!isChildcareForSixOrMore)
            .should("not.be.checked");
        }

        const petCareHousing = industry.industryOnboardingQuestions.isPetCareHousingApplicable
          ? Boolean(randomInt() % 2)
          : undefined;

        if (petCareHousing === undefined) {
          onOnboardingPageStartingBusiness.getPetCareHousingRadio().should("not.exist");
        } else {
          onOnboardingPageStartingBusiness.selectPetCareHousingRadio(petCareHousing);
          onOnboardingPageStartingBusiness.getPetCareHousingRadio(petCareHousing).should("be.checked");
          onOnboardingPageStartingBusiness.getPetCareHousingRadio(!petCareHousing).should("not.be.checked");
        }

        const willSellPetCareItems = industry.industryOnboardingQuestions.willSellPetCareItems
          ? Boolean(randomInt() % 2)
          : undefined;

        if (willSellPetCareItems === undefined) {
          onOnboardingPageStartingBusiness.getWillSellPetcareItemsRadio().should("not.exist");
        } else {
          onOnboardingPageStartingBusiness.selectWillSellPetcareItemsRadio(willSellPetCareItems);
          onOnboardingPageStartingBusiness
            .getWillSellPetcareItemsRadio(willSellPetCareItems)
            .should("be.checked");
          onOnboardingPageStartingBusiness
            .getWillSellPetcareItemsRadio(!willSellPetCareItems)
            .should("not.be.checked");
        }

        onOnboardingPageStartingBusiness.clickNext();
        cy.url().should("include", "dashboard?fromOnboarding=true");
        cy.get('[data-testid="header-link-to-profile"]');
      });
    }
  });

  describe("Mobile", () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.loginByCognitoApi();
    });

    it("Onboarding for All Other Businesses", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");
      onOnboardingPageStartingBusiness.selectIndustryDropdown("generic");

      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard?fromOnboarding=true");
      cy.get('[data-testid="header-link-to-profile"]');
    });
  });
});
