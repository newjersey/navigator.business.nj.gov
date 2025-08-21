import { Content } from "@/components/Content";
import { Industry } from "@/components/data-fields/Industry";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { capitalizeFirstLetter, kebabSnakeSentenceToCamelCase } from "@/lib/utils/cases-helpers";
import {
  randomHomeBasedIndustry,
  randomNegativeFilteredIndustry,
  randomNonHomeBasedIndustry,
} from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import {
  filterRandomIndustry,
  generateProfileData,
  randomIndustry,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  createEmptyProfileData,
  emptyIndustrySpecificData,
  industrySpecificDataChoices,
  ProfileData,
} from "@businessnjgovnavigator/shared/profileData";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import userEvent from "@testing-library/user-event";

const Config = getMergedConfig();
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<Industry />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const renderComponent = (profileData?: ProfileData): void => {
    render(
      <WithStatefulProfileData initialData={profileData || createEmptyProfileData()}>
        <Industry />
      </WithStatefulProfileData>,
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
    const nonConditionalEssentialQuestions = EssentialQuestions.filter((eq) => {
      return (
        eq.fieldName !== "residentialConstructionType" &&
        eq.fieldName !== "employmentPlacementType" &&
        eq.fieldName !== "hasThreeOrMoreRentalUnits" &&
        eq.fieldName !== "publicWorksContractor"
      );
    });

    nonConditionalEssentialQuestions.map((el) => {
      const validIndustryId = filterRandomIndustry(el.isQuestionApplicableToIndustry);
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
              fieldContent[
                `radioButton${capitalizeFirstLetter(kebabSnakeSentenceToCamelCase(choice))}Text`
              ],
            ),
          );
        };

        it(`displays ${el.fieldName} for ${validIndustryId.id} as a ${persona} when industry is changed from a previous industry of ${nonValidIndustryId.id}`, () => {
          const profileData = {
            ...createEmptyProfileData(),
            industryId: nonValidIndustryId.id,
          };
          renderComponent(profileData);
          expect(
            screen.queryByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`),
          ).not.toBeInTheDocument();

          selectIndustry(validIndustryId.id);
          expect(
            screen.getByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`),
          ).toContainHTML(
            renderToStaticMarkup(
              Content({
                children: fieldContent.description,
              }),
            ),
          );
          choices.map((choice) => {
            chooseRadioWithContent(
              screen.getByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`),
              choice.toString(),
            );
            expect(currentProfileData()[el.fieldName]).toEqual(choice);
          });
          selectIndustry("generic");
          expect(
            screen.queryByTestId(`industry-specific-${validIndustryId.id}-${el.fieldName}`),
          ).not.toBeInTheDocument();
        });

        it(`sets ${el.fieldName} as a ${persona} back to ${
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
            nonDefaultChoice?.toString() ?? "",
          );
          expect(currentProfileData()[el.fieldName]).toEqual(nonDefaultChoice);
          selectIndustry("generic");
          expect(currentProfileData()[el.fieldName]).toEqual(
            emptyIndustrySpecificData[el.fieldName],
          );
        });

        it(`displays FieldLabelProfile for ${validIndustryId.id} as a ${persona} when onboardingFieldLabel is false for ${el.fieldName}`, () => {
          render(
            <WithStatefulProfileData
              initialData={generateProfileData({ industryId: validIndustryId.id })}
            >
              <Industry onboardingFieldLabel={false} />
            </WithStatefulProfileData>,
          );
          expect(screen.getAllByTestId("FieldLabelProfile")[0]).toBeInTheDocument();
        });

        it(`displays FieldLabelOnboarding for ${validIndustryId.id} as a ${persona} when onboardingFieldLabel is true for ${el.fieldName}`, () => {
          render(
            <WithStatefulProfileData
              initialData={generateProfileData({ industryId: validIndustryId.id })}
            >
              <Industry onboardingFieldLabel={true} />
            </WithStatefulProfileData>,
          );
          expect(screen.getAllByTestId("FieldLabelOnboarding")[0]).toBeInTheDocument();
        });
      });
    });

    describe("conditional essential questions", () => {
      it("shows residentialConstructionType question if constructionType `residential` was selected", () => {
        renderComponent();
        selectIndustry("commercial-construction");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(
          screen.getByTestId("industry-specific-commercial-construction-constructionType"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId(
            "industry-specific-commercial-construction-residentialConstructionType",
          ),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Residential"));
        expect(
          screen.getByTestId("industry-specific-commercial-construction-constructionType"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(
            "industry-specific-commercial-construction-residentialConstructionType",
          ),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Commercial or Industrial"));
        expect(
          screen.getByTestId("industry-specific-commercial-construction-constructionType"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId(
            "industry-specific-commercial-construction-residentialConstructionType",
          ),
        ).not.toBeInTheDocument();
      });

      it("shows residentialConstructionType question if constructionType `BOTH` was selected", () => {
        renderComponent();
        selectIndustry("commercial-construction");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(
          screen.queryByTestId(
            "industry-specific-commercial-construction-residentialConstructionType",
          ),
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByDisplayValue("BOTH"));
        expect(
          screen.getByTestId(
            "industry-specific-commercial-construction-residentialConstructionType",
          ),
        ).toBeInTheDocument();
        expect(currentProfileData().constructionType).toEqual("BOTH");
      });

      it("resets constructionType and residentialConstructionType if industry changes", () => {
        renderComponent();
        selectIndustry("commercial-construction");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(currentProfileData().residentialConstructionType).toEqual(undefined);
        expect(
          screen.getByTestId("industry-specific-commercial-construction-constructionType"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId(
            "industry-specific-commercial-construction-residentialConstructionType",
          ),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Residential"));
        fireEvent.click(screen.getByLabelText("New home construction"));
        expect(currentProfileData().constructionType).toEqual("RESIDENTIAL");
        expect(currentProfileData().residentialConstructionType).toEqual("NEW_HOME_CONSTRUCTION");

        selectIndustry("petcare");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(currentProfileData().residentialConstructionType).toEqual(undefined);
      });

      it("shows publicWorksContractor question if constructionType `COMMERCIAL_OR_INDUSTRIAL` was selected", async () => {
        renderComponent();
        const user = userEvent.setup();
        selectIndustry("commercial-construction");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(
          screen.queryByTestId("industry-specific-commercial-construction-publicWorksContractor"),
        ).not.toBeInTheDocument();
        const firstEssentialQuestion = screen.getByDisplayValue("COMMERCIAL_OR_INDUSTRIAL");
        await user.click(firstEssentialQuestion);
        expect(
          screen.getByTestId("industry-specific-commercial-construction-publicWorksContractor"),
        ).toBeInTheDocument();
        expect(currentProfileData().constructionType).toEqual("COMMERCIAL_OR_INDUSTRIAL");
      });

      it("shows publicWorksContractor question if constructionType `BOTH` was selected", async () => {
        renderComponent();
        const user = userEvent.setup();
        selectIndustry("commercial-construction");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(
          screen.queryByTestId("industry-specific-commercial-construction-publicWorksContractor"),
        ).not.toBeInTheDocument();
        await user.click(screen.getByDisplayValue("BOTH"));
        expect(
          screen.getByTestId("industry-specific-commercial-construction-publicWorksContractor"),
        ).toBeInTheDocument();
        expect(currentProfileData().constructionType).toEqual("BOTH");
      });

      it("resets constructionType and publicWorksContractor if industry changes", async () => {
        renderComponent();
        const user = userEvent.setup();
        selectIndustry("commercial-construction");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(currentProfileData().publicWorksContractor).toEqual(undefined);
        expect(
          screen.getByTestId("industry-specific-commercial-construction-constructionType"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId("industry-specific-commercial-construction-publicWorksContractor"),
        ).not.toBeInTheDocument();

        const firstEssentialQuestion = screen.getByDisplayValue("COMMERCIAL_OR_INDUSTRIAL");
        await user.click(firstEssentialQuestion);
        const secondEssentialQuestion = screen.getByDisplayValue("true");
        await user.click(secondEssentialQuestion);

        expect(currentProfileData().constructionType).toEqual("COMMERCIAL_OR_INDUSTRIAL");
        expect(currentProfileData().publicWorksContractor).toEqual(true);

        selectIndustry("petcare");
        expect(currentProfileData().constructionType).toEqual(undefined);
        expect(currentProfileData().publicWorksContractor).toEqual(undefined);
      });

      it("profile data correctly updates when employment placement question is selected `employers` and selects `temporary` for employmentPlacementType", () => {
        renderComponent();
        selectIndustry("employment-agency");
        expect(
          screen.getByTestId("industry-specific-employment-agency-employmentPersonnelServiceType"),
        ).toBeInTheDocument();
        expect(currentProfileData().employmentPersonnelServiceType).toBe(undefined);
        expect(currentProfileData().employmentPlacementType).toBe(undefined);

        fireEvent.click(screen.getByLabelText("Employers"));
        expect(
          screen.getByTestId("industry-specific-employment-agency-employmentPlacementType"),
        ).toBeInTheDocument();
        expect(currentProfileData().employmentPersonnelServiceType).toEqual("EMPLOYERS");

        fireEvent.click(screen.getByLabelText("Temporary"));
        expect(currentProfileData().employmentPlacementType).toEqual("TEMPORARY");
      });

      it("does not show placement question if employmentPersonnelServiceType `job seekers` is selected", () => {
        renderComponent();
        selectIndustry("employment-agency");
        expect(
          screen.getByTestId("industry-specific-employment-agency-employmentPersonnelServiceType"),
        ).toBeInTheDocument();
        expect(currentProfileData().employmentPersonnelServiceType).toEqual(undefined);
        expect(currentProfileData().employmentPlacementType).toEqual(undefined);

        fireEvent.click(screen.getByLabelText("Job Seekers"));
        expect(
          screen.queryByTestId("industry-specific-employment-agency-employmentPlacementType"),
        ).not.toBeInTheDocument();
        expect(currentProfileData().employmentPersonnelServiceType).toEqual("JOB_SEEKERS");
        expect(currentProfileData().employmentPlacementType).toEqual(undefined);
      });

      it("resets employmentPersonnelServiceType and employmentPlacementType if industry changes", () => {
        renderComponent();
        selectIndustry("employment-agency");
        expect(
          screen.getByTestId("industry-specific-employment-agency-employmentPersonnelServiceType"),
        ).toBeInTheDocument();
        expect(currentProfileData().employmentPersonnelServiceType).toEqual(undefined);
        expect(currentProfileData().employmentPlacementType).toEqual(undefined);

        fireEvent.click(screen.getByLabelText("Employers"));
        expect(currentProfileData().employmentPersonnelServiceType).toEqual("EMPLOYERS");
        expect(currentProfileData().employmentPlacementType).toBe(undefined);
        expect(
          screen.getByTestId("industry-specific-employment-agency-employmentPlacementType"),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText("Temporary"));
        expect(currentProfileData().employmentPlacementType).toEqual("TEMPORARY");

        selectIndustry("petcare");
        expect(currentProfileData().employmentPersonnelServiceType).toEqual(undefined);
        expect(currentProfileData().employmentPlacementType).toEqual(undefined);
      });

      it("shows hasThreeOrMoreRentalUnits question if 'long term' or 'BOTH' was selected", () => {
        renderComponent();
        selectIndustry("residential-landlord");
        expect(currentProfileData().propertyLeaseType).toEqual(undefined);
        expect(
          screen.getByTestId("industry-specific-residential-landlord-propertyLeaseType"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId("industry-specific-residential-landlord-hasThreeOrMoreRentalUnits"),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Long Term"));
        expect(
          screen.getByTestId("industry-specific-residential-landlord-propertyLeaseType"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("industry-specific-residential-landlord-hasThreeOrMoreRentalUnits"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Both"));
        expect(
          screen.getByTestId("industry-specific-residential-landlord-propertyLeaseType"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("industry-specific-residential-landlord-hasThreeOrMoreRentalUnits"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Short Term"));
        expect(
          screen.getByTestId("industry-specific-residential-landlord-propertyLeaseType"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId("industry-specific-residential-landlord-hasThreeOrMoreRentalUnits"),
        ).not.toBeInTheDocument();
      });

      it("resets propertyLeaseType and hasThreeOrMoreRentalUnits if industry changes", () => {
        renderComponent();
        selectIndustry("residential-landlord");
        expect(
          screen.getByTestId("industry-specific-residential-landlord-propertyLeaseType"),
        ).toBeInTheDocument();
        expect(currentProfileData().propertyLeaseType).toEqual(undefined);
        expect(currentProfileData().hasThreeOrMoreRentalUnits).toEqual(undefined);

        fireEvent.click(screen.getByLabelText("Long Term"));
        expect(currentProfileData().propertyLeaseType).toEqual("LONG_TERM_RENTAL");
        expect(currentProfileData().hasThreeOrMoreRentalUnits).toBe(undefined);
        expect(
          screen.getByTestId("industry-specific-residential-landlord-hasThreeOrMoreRentalUnits"),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText("Yes"));
        expect(currentProfileData().hasThreeOrMoreRentalUnits).toEqual(true);

        selectIndustry("petcare");
        expect(currentProfileData().propertyLeaseType).toEqual(undefined);
        expect(currentProfileData().hasThreeOrMoreRentalUnits).toEqual(undefined);
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
