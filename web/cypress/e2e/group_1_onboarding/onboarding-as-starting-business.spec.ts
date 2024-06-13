import {
  carServiceOptions,
  CarServiceType,
  Industries,
  Industry,
  randomInt,
  ResidentialConstructionType,
} from "@businessnjgovnavigator/shared";
import { randomElementFromArray, setMobileViewport } from "../../support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "../../support/page_objects/onboardingPageNew";

const enabledIndustries = Industries.filter((element: Industry) => {
  return element.isEnabled;
});

describe("Onboarding for all industries when starting a business [feature] [all] [group1]", () => {
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

          const otherValues = carServiceOptions.filter((value: CarServiceType) => value !== carService);
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

        const residentialConstructionTypeApplicable = industry.industryOnboardingQuestions
          .isConstructionTypeApplicable
          ? Boolean(randomInt() % 2)
          : undefined;

        if (residentialConstructionTypeApplicable === undefined) {
          onOnboardingPageStartingBusiness.getConstructionTypeItemsRadio().should("not.exist");
        } else {
          const constructionType = residentialConstructionTypeApplicable
            ? "RESIDENTIAL"
            : "COMMERCIAL_OR_INDUSTRIAL";
          onOnboardingPageStartingBusiness.selectConstructionTypeRadio(constructionType);
          onOnboardingPageStartingBusiness
            .getConstructionTypeItemsRadio(constructionType)
            .should("be.checked");
          if (residentialConstructionTypeApplicable) {
            onOnboardingPageStartingBusiness.getResidentialConstructionTypeRadio().should("exist");
            const residentialConstructionChoices = [
              "NEW_HOME_CONSTRUCTION",
              "HOME_RENOVATIONS",
              "BOTH",
            ] as ResidentialConstructionType[];
            const randomAnswerIndex = Math.floor(Math.random() * 3);
            const residentialConstructionTypeOption = residentialConstructionChoices[randomAnswerIndex];

            onOnboardingPageStartingBusiness.selectResidentialConstructionTypeRadio(
              residentialConstructionTypeOption
            );
            onOnboardingPageStartingBusiness
              .getResidentialConstructionTypeItemsRadio(residentialConstructionTypeOption)
              .should("be.checked");
          } else {
            onOnboardingPageStartingBusiness.getResidentialConstructionTypeRadio().should("not.exist");
          }
        }

        onOnboardingPageStartingBusiness.clickShowMyGuide();
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
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");
      onOnboardingPageStartingBusiness.selectIndustryDropdown("generic");

      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard");
      cy.get('[data-testid="header-link-to-profile"]');
    });
  });
});
