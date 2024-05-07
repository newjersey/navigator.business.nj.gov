import {
  randomElementFromArray,
  setMobileViewport,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { onOnboardingPageNexusBusiness } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPageNew";
import {
  CarServiceType,
  Industries,
  Industry,
  ResidentialConstructionType,
  carServiceOptions,
  randomInt,
} from "@businessnjgovnavigator/shared/";

const enabledIndustries = Industries.filter((element: Industry) => {
  return element.isEnabled;
});

describe("Onboarding for all industries when out of state nexus business [feature] [all] [group4]", () => {
  describe("Desktop", () => {
    beforeEach(() => {
      cy.loginByCognitoApi();
    });

    for (const industry of enabledIndustries) {
      it(`Onboarding for ${industry.name}`, () => {
        cy.url().should("include", "onboarding?page=1");
        onOnboardingPageNexusBusiness.selectBusinessPersonaRadio("FOREIGN");
        onOnboardingPageNexusBusiness.getBusinessPersonaRadio("FOREIGN").should("be.checked");
        onOnboardingPageNexusBusiness.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPageNexusBusiness.selectEmployeeOrContractorInNJCheckBox();
        onOnboardingPageNexusBusiness.getEmployeeOrContractorInNJCheckbox().should("be.checked");
        onOnboardingPageNexusBusiness.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPageNexusBusiness.selectIndustryDropdown(industry.id);

        const carService = industry.industryOnboardingQuestions.isCarServiceApplicable
          ? randomElementFromArray([...carServiceOptions])
          : undefined;

        if (carService === undefined) {
          onOnboardingPageNexusBusiness.getCarServiceRadio().should("not.exist");
        } else {
          onOnboardingPageNexusBusiness.selectCarServiceRadio(carService);
          onOnboardingPageNexusBusiness.getCarServiceRadio(carService).should("be.checked");

          const otherValues = carServiceOptions.filter((value: CarServiceType) => value !== carService);
          for (const value of otherValues) {
            onOnboardingPageNexusBusiness.getCarServiceRadio(value).should("not.be.checked");
          }
        }
        const isChildcareForSixOrMore = industry.industryOnboardingQuestions.isChildcareForSixOrMore
          ? Boolean(randomInt() % 2)
          : undefined;

        if (isChildcareForSixOrMore === undefined) {
          onOnboardingPageNexusBusiness.getChildcareRadio().should("not.exist");
        } else {
          onOnboardingPageNexusBusiness.selectChildcareRadio(isChildcareForSixOrMore);
          onOnboardingPageNexusBusiness.getChildcareRadio(isChildcareForSixOrMore).should("be.checked");
          onOnboardingPageNexusBusiness.getChildcareRadio(!isChildcareForSixOrMore).should("not.be.checked");
        }

        const petCareHousing = industry.industryOnboardingQuestions.isPetCareHousingApplicable
          ? Boolean(randomInt() % 2)
          : undefined;

        if (petCareHousing === undefined) {
          onOnboardingPageNexusBusiness.getPetCareHousingRadio().should("not.exist");
        } else {
          onOnboardingPageNexusBusiness.selectPetCareHousingRadio(petCareHousing);
          onOnboardingPageNexusBusiness.getPetCareHousingRadio(petCareHousing).should("be.checked");
          onOnboardingPageNexusBusiness.getPetCareHousingRadio(!petCareHousing).should("not.be.checked");
        }

        const willSellPetCareItems = industry.industryOnboardingQuestions.willSellPetCareItems
          ? Boolean(randomInt() % 2)
          : undefined;

        if (willSellPetCareItems === undefined) {
          onOnboardingPageNexusBusiness.getWillSellPetcareItemsRadio().should("not.exist");
        } else {
          onOnboardingPageNexusBusiness.selectWillSellPetcareItemsRadio(willSellPetCareItems);
          onOnboardingPageNexusBusiness
            .getWillSellPetcareItemsRadio(willSellPetCareItems)
            .should("be.checked");
          onOnboardingPageNexusBusiness
            .getWillSellPetcareItemsRadio(!willSellPetCareItems)
            .should("not.be.checked");
        }

        const residentialConstructionTypeApplicable = industry.industryOnboardingQuestions
          .isConstructionTypeApplicable
          ? Boolean(randomInt() % 2)
          : undefined;

        if (residentialConstructionTypeApplicable === undefined) {
          onOnboardingPageNexusBusiness.getConstructionTypeItemsRadio().should("not.exist");
        } else {
          const constructionType = residentialConstructionTypeApplicable
            ? "RESIDENTIAL"
            : "COMMERCIAL_OR_INDUSTRIAL";
          onOnboardingPageNexusBusiness.selectConstructionTypeRadio(constructionType);
          onOnboardingPageNexusBusiness.getConstructionTypeItemsRadio(constructionType).should("be.checked");
          if (residentialConstructionTypeApplicable) {
            onOnboardingPageNexusBusiness.getResidentialConstructionTypeRadio().should("exist");
            const residentialConstructionChoices = [
              "NEW_HOME_CONSTRUCTION",
              "HOME_RENOVATIONS",
              "BOTH",
            ] as ResidentialConstructionType[];
            const randomAnswerIndex = Math.floor(Math.random() * 3);
            const residentialConstructionTypeOption = residentialConstructionChoices[randomAnswerIndex];

            onOnboardingPageNexusBusiness.selectResidentialConstructionTypeRadio(
              residentialConstructionTypeOption
            );
            onOnboardingPageNexusBusiness
              .getResidentialConstructionTypeItemsRadio(residentialConstructionTypeOption)
              .should("be.checked");
          } else {
            onOnboardingPageNexusBusiness.getResidentialConstructionTypeRadio().should("not.exist");
          }
        }

        onOnboardingPageNexusBusiness.clickShowMyGuide();
        cy.url().should("include", "dashboard");
        cy.get('[data-testid="header-link-to-profile"]');
      });
    }
  });

  describe("Mobile", () => {
    beforeEach(() => {
      setMobileViewport();
      cy.loginByCognitoApi();
    });

    it("Onboarding for All Other Businesses", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageNexusBusiness.selectBusinessPersonaRadio("FOREIGN");
      onOnboardingPageNexusBusiness.getBusinessPersonaRadio("FOREIGN").should("be.checked");
      onOnboardingPageNexusBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");
      onOnboardingPageNexusBusiness.selectEmployeeOrContractorInNJCheckBox();
      onOnboardingPageNexusBusiness.getEmployeeOrContractorInNJCheckbox().should("be.checked");
      onOnboardingPageNexusBusiness.clickNext();

      cy.url().should("include", "onboarding?page=3");
      onOnboardingPageNexusBusiness.selectIndustryDropdown("generic");

      onOnboardingPageNexusBusiness.clickNext();
      cy.url().should("include", "dashboard");
      cy.get('[data-testid="header-link-to-profile"]');
    });
  });
});
