import { Content } from "@/components/Content";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { getMergedConfig } from "@/contexts/configContext";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { createProfileFieldErrorMap, FlowType } from "@/lib/types/types";
import { capitalizeFirstLetter, kebabSnakeSentenceToCamelCase } from "@/lib/utils/helpers";
import {
  randomFilteredIndustry,
  randomHomeBasedIndustry,
  randomIndustry,
  randomNegativeFilteredIndustry,
  randomNonHomeBasedIndustry,
} from "@/test/factories";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import {
  createEmptyProfileData,
  emptyIndustrySpecificData,
  industrySpecificDataChoices,
  ProfileData,
} from "@businessnjgovnavigator/shared/profileData";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

const Config = getMergedConfig();

describe("<OnboardingIndustry />", () => {
  const renderComponent = (profileData?: ProfileData) => {
    render(
      <WithStatefulProfileData initialData={profileData || createEmptyProfileData()}>
        <OnboardingIndustry onValidation={() => {}} fieldStates={createProfileFieldErrorMap()} />
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
    let profileData: ProfileData;
    EssentialQuestions.map((el) => {
      const validIndustryId = randomFilteredIndustry(el.isQuestionApplicableToIndustry, { isEnabled: true });

      beforeEach(() => {
        const nonValidIndustryId = randomNegativeFilteredIndustry(el.isQuestionApplicableToIndustry);
        profileData = {
          ...createEmptyProfileData(),
          industryId: nonValidIndustryId.id,
        };
      });

      businessPersonas.map((persona) => {
        const choices = industrySpecificDataChoices[el.fieldName];
        const flowConfig = Config.profileDefaults[persona as FlowType];
        const fieldContent = flowConfig[
          el.contentFieldName ?? (el.fieldName as keyof typeof flowConfig)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any;

        const chooseRadioWithContent = (choice: string) => {
          fireEvent.click(
            screen.getByText(
              fieldContent[`radioButton${capitalizeFirstLetter(kebabSnakeSentenceToCamelCase(choice))}Text`]
            )
          );
        };

        it(`displays ${el.contentFieldName ?? el.fieldName} for ${
          validIndustryId.id
        } as a ${persona} when selected`, () => {
          renderComponent(profileData);
          expect(screen.queryByTestId(`industry-specific-${validIndustryId.id}`)).not.toBeInTheDocument();

          selectIndustry(validIndustryId.id);
          expect(screen.getByTestId(`industry-specific-${validIndustryId.id}`)).toContainHTML(
            renderToStaticMarkup(
              Content({
                children: fieldContent.description,
              })
            )
          );

          choices.map((choice) => {
            chooseRadioWithContent(choice.toString());
            expect(currentProfileData()[el.fieldName]).toEqual(choice);
          });
          selectIndustry("generic");
          expect(screen.queryByTestId(`industry-specific-${validIndustryId.id}`)).not.toBeInTheDocument();
        });

        it(`sets ${el.contentFieldName ?? el.fieldName} back to ${
          emptyIndustrySpecificData[el.fieldName]
        } if they select a different industry`, () => {
          renderComponent(profileData);
          selectIndustry(validIndustryId.id);
          chooseRadioWithContent(choices[0].toString());
          expect(currentProfileData()[el.fieldName]).toEqual(choices[0]);
          selectIndustry("generic");
          expect(currentProfileData()[el.fieldName]).toEqual(emptyIndustrySpecificData[el.fieldName]);
        });
      });
    });
  });

  const selectIndustry = (value: string) => {
    fireEvent.mouseDown(screen.getByLabelText("Industry"));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };
});
