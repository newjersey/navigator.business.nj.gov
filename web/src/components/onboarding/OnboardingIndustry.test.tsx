import { Content } from "@/components/Content";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { getMergedConfig } from "@/contexts/configContext";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { capitalizeFirstLetter, kebabSnakeSentenceToCamelCase } from "@/lib/utils/cases-helpers";
import {
  randomHomeBasedIndustry,
  randomNegativeFilteredIndustry,
  randomNonHomeBasedIndustry,
} from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { generateProfileData, randomFilteredIndustry, randomIndustry } from "@businessnjgovnavigator/shared";
import {
  createEmptyProfileData,
  emptyIndustrySpecificData,
  industrySpecificDataChoices,
  ProfileData,
} from "@businessnjgovnavigator/shared/profileData";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

const Config = getMergedConfig();
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<OnboardingIndustry />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const renderComponent = (profileData?: ProfileData): void => {
    render(
      <WithStatefulProfileData initialData={profileData || createEmptyProfileData()}>
        <OnboardingIndustry />
      </WithStatefulProfileData>
    );
  };

  it("displays industry-specific content for home contractors when selected", () => {
    renderComponent();
    expect(screen.queryByTestId("industry-specific-home-contractor")).not.toBeInTheDocument();

    selectIndustry("home-contractor");
    expect(screen.getByTestId("industry-specific-home-contractor")).toBeInTheDocument();

    selectIndustry("e-commerce");
    expect(screen.queryByTestId("industry-specific-home-contractor")).not.toBeInTheDocument();
  });

  it("displays industry-specific content for employment agency when selected", () => {
    renderComponent();
    expect(screen.queryByTestId("industry-specific-employment-agency")).not.toBeInTheDocument();

    selectIndustry("employment-agency");
    expect(screen.getByTestId("industry-specific-employment-agency")).toBeInTheDocument();

    selectIndustry("e-commerce");
    expect(screen.queryByTestId("industry-specific-employment-agency")).not.toBeInTheDocument();
  });

  describe("updates to industry affecting home-based business", () => {
    it("sets home-based business to false if they select an non-applicable industry", async () => {
      renderComponent();
      selectIndustry(randomNonHomeBasedIndustry());
      expect(currentProfileData().homeBasedBusiness).toEqual(false);
    });

    it("sets home-based business to undefined if they select an applicable industry", async () => {
      renderComponent();
      selectIndustry(randomHomeBasedIndustry());
      expect(currentProfileData().homeBasedBusiness).toEqual(undefined);
    });
  });

  it("sets default sector for industry", async () => {
    renderComponent();
    const industry = randomIndustry();
    selectIndustry(industry.id);
    expect(currentProfileData().sectorId).toEqual(industry.defaultSectorId);
    selectIndustry("generic");
    expect(currentProfileData().sectorId).toEqual("other-services");
  });

  describe("essential questions", () => {
    it("defaults cannabis license type to CONDITIONAL", () => {
      renderComponent();
      selectIndustry("cannabis");
      expect(currentProfileData().cannabisLicenseType).toEqual("CONDITIONAL");
    });

    const businessPersonas = ["STARTING", "FOREIGN"];
    EssentialQuestions.map((el) => {
      const validIndustryId = randomFilteredIndustry(el.isQuestionApplicableToIndustry, { isEnabled: true });
      const nonValidIndustryId = randomNegativeFilteredIndustry(el.isQuestionApplicableToIndustry);

      businessPersonas.map((persona) => {
        const choices = industrySpecificDataChoices[el.fieldName];
        const flowConfig = Config.profileDefaults.fields;
        const fieldContent = Config.profileDefaults.fields[
          el.fieldName as keyof typeof flowConfig
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ].default as any;

        const chooseRadioWithContent = (div: HTMLElement, choice: string): void => {
          fireEvent.click(
            within(div).getByText(
              fieldContent[`radioButton${capitalizeFirstLetter(kebabSnakeSentenceToCamelCase(choice))}Text`]
            )
          );
        };

        it(`displays ${el.fieldName} for ${validIndustryId.id} as a ${persona} when industry is changed from a previous industry of ${nonValidIndustryId.id}`, () => {
          const profileData = {
            ...createEmptyProfileData(),
            industryId: nonValidIndustryId.id,
          };
          renderComponent(profileData);
          expect(
            screen.queryByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`)
          ).not.toBeInTheDocument();

          selectIndustry(validIndustryId.id);
          expect(screen.getByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`)).toContainHTML(
            renderToStaticMarkup(
              Content({
                children: fieldContent.description,
              })
            )
          );
          choices.map((choice) => {
            chooseRadioWithContent(
              screen.getByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`),
              choice.toString()
            );
            expect(currentProfileData()[el.fieldName]).toEqual(choice);
          });
          selectIndustry("generic");
          expect(
            screen.queryByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`)
          ).not.toBeInTheDocument();
        });

        it(`sets ${el.fieldName} back to ${
          emptyIndustrySpecificData[el.fieldName]
        } if they select a different industry`, () => {
          const profileData = {
            ...createEmptyProfileData(),
            industryId: nonValidIndustryId.id,
          };
          renderComponent(profileData);
          selectIndustry(validIndustryId.id);
          const nonDefaultChoice = (choices as (string | boolean)[]).find((val) => {
            return val !== emptyIndustrySpecificData[el.fieldName];
          });
          chooseRadioWithContent(
            screen.getByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`),
            nonDefaultChoice?.toString() ?? ""
          );
          expect(currentProfileData()[el.fieldName]).toEqual(nonDefaultChoice);
          selectIndustry("generic");
          expect(currentProfileData()[el.fieldName]).toEqual(emptyIndustrySpecificData[el.fieldName]);
        });
      });
    });
  });

  it("resets NAICs code in userdata when industry is changed", () => {
    renderComponent(generateProfileData({ industryId: "home-contractor", naicsCode: "111111" }));
    selectIndustry("e-commerce");
    expect(currentProfileData().naicsCode).toEqual("");
  });

  const selectIndustry = (value: string): void => {
    fireEvent.mouseDown(screen.getByLabelText("Industry"));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };
});
