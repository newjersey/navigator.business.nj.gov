import { getMergedConfig } from "@/contexts/configContext";
import { defaultDisplayDateFormat } from "@/lib/types/types";
import { generateFormationDbaContent, generateTask } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { mockPush } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import {
  FormationFormData,
  ProfileData,
  PublicFilingLegalType,
  businessStructureTaskId,
  castPublicFilingLegalTypeToFormationType,
  defaultDateFormat,
  generateBusiness,
  generateFormationFormData,
  generateMunicipality,
  generateUserData,
  getCurrentDate,
  getCurrentDateFormatted,
  randomElementFromArray,
  randomPublicFilingLegalType,
} from "@businessnjgovnavigator/shared";
import { corpLegalStructures, publicFilingLegalTypes } from "@businessnjgovnavigator/shared/formationData";
import * as materialUi from "@mui/material";
import { fireEvent, screen, within } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - BusinessStep", () => {
  const displayContent = {
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>
  ): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData(initialProfileData);
    const isForeign = initialProfileData.businessPersona === "FOREIGN";
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData, {
        legalStructureId: castPublicFilingLegalTypeToFormationType(
          profileData.legalStructureId as PublicFilingLegalType,
          initialProfileData.businessPersona
        ),
      }),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };
    const page = preparePage({
      business: generateBusiness(generateUserData({}), { profileData, formationData }),
      displayContent,
    });
    if (isForeign) {
      await page.submitNexusBusinessNameStep();
    } else {
      await page.stepperClickToBusinessStep();
    }
    return page;
  };

  it("displays modal when legal structure Edit button clicked", async () => {
    await getPageHelper({}, {});
    expect(screen.queryByText(Config.formation.legalStructure.warningModalHeader)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("edit-legal-structure"));
    expect(screen.getByText(Config.formation.legalStructure.warningModalHeader)).toBeInTheDocument();
  });

  it("displays jurisdiction alert info box", async () => {
    await getPageHelper({}, {});
    expect(
      screen.getByText(markdownToText(Config.formation.fields.addressMunicipality.infoAlert))
    ).toBeInTheDocument();
  });

  it("routes to profile page when edit legal structure button is clicked", async () => {
    useMockRoadmap({
      tasks: [generateTask({ id: businessStructureTaskId, urlSlug: "business-structure-url-slug" })],
    });
    await getPageHelper({}, {});

    fireEvent.click(screen.getByTestId("edit-legal-structure"));
    fireEvent.click(
      within(screen.getByTestId("modal-content")).getByText(
        Config.formation.legalStructure.warningModalContinueButton
      )
    );
    expect(mockPush).toHaveBeenCalledWith("/tasks/business-structure-url-slug");
  });

  it("auto-fills fields from userData if it exists as an LLC", async () => {
    const page = await getPageHelper(
      {
        legalStructureId: "limited-liability-company",
      },
      {
        businessSuffix: "LTD LIABILITY CO",
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
        addressLine1: "123 main street",
        addressLine2: "suite 102",
        addressMunicipality: generateMunicipality({ displayName: "Newark", name: "Newark" }),
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressZipCode: "07601",
        businessPurpose: "some cool purpose",
      }
    );

    expect(screen.getByText("LTD LIABILITY CO")).toBeInTheDocument();
    expect(page.getInputElementByLabel("Business start date").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Address line1").value).toBe("123 main street");
    expect(page.getInputElementByLabel("Address line2").value).toBe("suite 102");
    expect(page.getInputElementByLabel("Address municipality").value).toBe("Newark");
    expect(page.getInputElementByLabel("Address state").value).toBe("NJ");
    expect(page.getInputElementByLabel("Address zip code").value).toBe("07601");
    expect(page.getInputElementByLabel("Business purpose").value).toBe("some cool purpose");
  });

  it("auto-fills fields from userData if it exists as an US-based FLC", async () => {
    const page = await getPageHelper(
      {
        legalStructureId: "limited-liability-company",
        businessPersona: "FOREIGN",
      },
      {
        businessSuffix: "LTD LIABILITY CO",
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
        businessLocationType: "US",
        foreignDateOfFormation: getCurrentDateFormatted(defaultDateFormat),
        foreignStateOfFormation: "Virgin Islands",
        addressLine1: "123 main street",
        addressLine2: "suite 102",
        addressState: { shortCode: "DC", name: "District of Columbia" },
        addressZipCode: "20011",
        addressCity: "Washington",
        businessPurpose: "some cool purpose",
      }
    );

    expect(screen.getByText("LTD LIABILITY CO")).toBeInTheDocument();
    expect(page.getInputElementByLabel("Business start date").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign date of formation").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign state of formation").value).toBe("Virgin Islands");
    expect(page.getInputElementByLabel("Address line1").value).toBe("123 main street");
    expect(page.getInputElementByLabel("Address line2").value).toBe("suite 102");
    expect(page.getInputElementByLabel("Address city").value).toBe("Washington");
    expect(page.getInputElementByLabel("Address state").value).toBe("DC");
    expect(page.getInputElementByLabel("Address zip code").value).toBe("20011");
    expect(page.getInputElementByLabel("Business purpose").value).toBe("some cool purpose");
  });

  it("auto-fills fields from userData if it exists as an INTL-based FLC", async () => {
    const page = await getPageHelper(
      {
        legalStructureId: "limited-liability-company",
        businessPersona: "FOREIGN",
      },
      {
        businessSuffix: "LTD LIABILITY CO",
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
        businessLocationType: "INTL",
        foreignDateOfFormation: getCurrentDateFormatted(defaultDateFormat),
        foreignStateOfFormation: "Virgin Islands",
        addressLine1: "123 main street",
        addressLine2: "suite 102",
        addressProvince: "Bordeaux",
        addressCountry: "FR",
        addressZipCode: "2033011",
        addressCity: "Paris",
        businessPurpose: "some cool purpose",
      }
    );

    expect(screen.getByText("LTD LIABILITY CO")).toBeInTheDocument();
    expect(page.getInputElementByLabel("Business start date").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign date of formation").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign state of formation").value).toBe("Virgin Islands");
    expect(page.getInputElementByLabel("Address line1").value).toBe("123 main street");
    expect(page.getInputElementByLabel("Address line2").value).toBe("suite 102");
    expect(page.getInputElementByLabel("Address country").value).toBe("France");
    expect(page.getInputElementByLabel("Address city").value).toBe("Paris");
    expect(page.getInputElementByLabel("Address province").value).toBe("Bordeaux");
    expect(page.getInputElementByLabel("Address zip code").value).toBe("2033011");
    expect(page.getInputElementByLabel("Business purpose").value).toBe("some cool purpose");
  });

  it("does not display dependency alert", async () => {
    await getPageHelper({}, {});
    expect(screen.queryByTestId("dependency-alert")).not.toBeInTheDocument();
  });

  it("goes back to name step when edit business name button is clicked", async () => {
    await getPageHelper({}, {});
    fireEvent.click(screen.getByTestId("edit-business-name"));
    expect(screen.getByTestId("business-name-step")).toBeInTheDocument();
  });

  describe("Business purpose", () => {
    it("keeps business purpose closed by default", async () => {
      await getPageHelper({}, { businessPurpose: "" });
      expect(screen.getByText(Config.formation.fields.businessPurpose.label)).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.businessPurpose.addButtonText)).toBeInTheDocument();
      expect(screen.queryByLabelText("remove business purpose")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Business purpose")).not.toBeInTheDocument();
    });

    it("shows business purpose open if exists", async () => {
      await getPageHelper({}, { businessPurpose: "some purpose" });
      expect(
        screen.queryByText(Config.formation.fields.businessPurpose.addButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove business purpose")).toBeInTheDocument();
      expect(screen.getByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("opens business purpose when Add button clicked", async () => {
      await getPageHelper({}, { businessPurpose: "" });
      fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
      expect(
        screen.queryByText(Config.formation.fields.businessPurpose.addButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove business purpose")).toBeInTheDocument();
      expect(screen.getByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("removes business purpose when Remove button clicked", async () => {
      const page = await getPageHelper({}, { businessPurpose: "some purpose" });
      fireEvent.click(screen.getByLabelText("remove business purpose"));
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.businessPurpose).toEqual("");
    });

    it("updates char count in real time", async () => {
      const page = await getPageHelper({}, { businessPurpose: "" });
      fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
      expect(screen.getByText("0 / 300", { exact: false })).toBeInTheDocument();
      page.fillText("Business purpose", "some purpose");
      const charLength = "some purpose".length;
      expect(screen.getByText(`${charLength} / 300`, { exact: false })).toBeInTheDocument();
    });
  });

  describe("provisions", () => {
    it("hides provisions when forming as a foreign business and the legalStructureId is not foreign-limited-partnership", async () => {
      await getPageHelper(
        {
          businessPersona: "FOREIGN",
          legalStructureId: randomPublicFilingLegalType((value) => value !== "limited-partnership"),
        },
        { additionalProvisions: [] }
      );
      expect(screen.queryByText(Config.formation.fields.additionalProvisions.label)).not.toBeInTheDocument();
    });

    it("shows provisions when forming as a foreign business and the legalStructureId is foreign-limited-partnership", async () => {
      await getPageHelper(
        {
          businessPersona: "FOREIGN",
          legalStructureId: randomPublicFilingLegalType((value) => value === "limited-partnership"),
        },
        { additionalProvisions: [] }
      );
      expect(screen.getByText(Config.formation.fields.additionalProvisions.label)).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.additionalProvisions.addButtonText)
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("remove provision")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("provision 0")).not.toBeInTheDocument();
    });

    it("keeps provisions closed by default when page loads", async () => {
      await getPageHelper({}, { additionalProvisions: [] });
      expect(screen.getByText(Config.formation.fields.additionalProvisions.label)).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.additionalProvisions.addButtonText)
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("remove provision")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("provision 0")).not.toBeInTheDocument();
    });

    it("shows provisions open if exists", async () => {
      await getPageHelper({}, { additionalProvisions: ["provision1", "provision2"] });
      expect(
        screen.queryByText(Config.formation.fields.additionalProvisions.addButtonText)
      ).not.toBeInTheDocument();
      expect(screen.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("opens provisions when Add button clicked", async () => {
      await getPageHelper({}, { additionalProvisions: [] });
      fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addButtonText));
      expect(
        screen.queryByText(Config.formation.fields.additionalProvisions.addButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove provision")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
    });

    it("adds more provisions when Add More button clicked", async () => {
      await getPageHelper({}, { additionalProvisions: [] });
      fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addButtonText));
      fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addAnotherButtonText));
      expect(screen.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("removes correct provision when Remove button clicked", async () => {
      const page = await getPageHelper(
        {},
        {
          additionalProvisions: ["provision1", "provision2", "provision3"],
        }
      );
      const removeProvision2Button = screen.getAllByLabelText("remove provision")[1];
      fireEvent.click(removeProvision2Button);
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.additionalProvisions).toEqual([
        "provision1",
        "provision3",
      ]);
    });

    it("updates char count in real time", async () => {
      const page = await getPageHelper({}, { additionalProvisions: [] });
      fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addButtonText));
      expect(screen.getByText("0 / 3000", { exact: false })).toBeInTheDocument();
      page.fillText("Provisions 0", "some provision");
      const charLength = "some provision".length;
      expect(screen.getByText(`${charLength} / 3000`, { exact: false })).toBeInTheDocument();
    });

    it("does not allow adding more than 10 provisions", async () => {
      const nineProvisions = Array(9).fill("some provision");
      await getPageHelper({}, { additionalProvisions: nineProvisions });
      fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addAnotherButtonText));
      expect(
        screen.queryByText(Config.formation.fields.additionalProvisions.addAnotherButtonText)
      ).not.toBeInTheDocument();
    });
  });

  describe("Foreign state of formation", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignStateOfFormation: undefined }
      );
      expect(
        screen.getByText(markdownToText(Config.formation.fields.foreignStateOfFormation.label))
      ).toBeInTheDocument();
      page.fillText("Foreign state of formation", "Virgin Islands");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.foreignStateOfFormation).toEqual(
        "Virgin Islands"
      );
    });

    it("does not include New Jersey in the foreign state of formation dropdown", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignStateOfFormation: undefined }
      );

      const listBox = await page.getListBoxForInputElementByTestId("foreignStateOfFormation");

      expect(within(listBox).queryByText("New Jersey")).not.toBeInTheDocument();
      expect(within(listBox).getByText("Ohio")).toBeInTheDocument();
    });

    it("includes 'Outside of the USA' in the foreign state of formation dropdown", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignStateOfFormation: undefined }
      );

      const listBox = await page.getListBoxForInputElementByTestId("foreignStateOfFormation");

      expect(within(listBox).getByText("Outside of the USA")).toBeInTheDocument();
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignStateOfFormation: undefined }
      );
      page.fillText("Foreign state of formation", "test");
      expect(screen.getByText(Config.formation.fields.foreignStateOfFormation.error)).toBeInTheDocument();
    });
  });

  describe("Foreign Certificate of Good Standing", () => {
    for (const legalStructureId of ["c-corporation", "s-corporation", "nonprofit"]) {
      it(`should render for foreign ${legalStructureId}`, async () => {
        await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, {});
        expect(screen.getByTestId("foreign-certificate-of-good-standing-header")).toBeInTheDocument();
      });
    }

    for (const legalStructureId of [
      "limited-liability-partnership",
      "limited-liability-company",
      "limited-partnership",
    ]) {
      it(`should not render for foreign ${legalStructureId}`, async () => {
        await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, {});
        expect(screen.queryByTestId("foreign-certificate-of-good-standing-header")).not.toBeInTheDocument();
      });
    }

    for (const legalStructureId of publicFilingLegalTypes) {
      it(`should not render for ${legalStructureId}`, async () => {
        await getPageHelper({ businessPersona: "OWNING", legalStructureId }, {});
        expect(screen.queryByTestId("foreign-certificate-of-good-standing-header")).not.toBeInTheDocument();
      });
    }
  });

  describe("Will Practice Law", () => {
    for (const legalStructureId of corpLegalStructures) {
      it(`should render for foreign ${legalStructureId}`, async () => {
        await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, {});
        expect(screen.getByText(Config.formation.fields.willPracticeLaw.label)).toBeInTheDocument();
      });
    }

    for (const legalStructureId of [
      "limited-liability-partnership",
      "limited-liability-company",
      "limited-partnership",
      "nonprofit",
    ]) {
      it(`should not render for foreign ${legalStructureId}`, async () => {
        await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, {});
        expect(screen.queryByText(Config.formation.fields.willPracticeLaw.label)).not.toBeInTheDocument();
      });
    }

    for (const legalStructureId of publicFilingLegalTypes) {
      it(`should not render for ${legalStructureId}`, async () => {
        await getPageHelper({ businessPersona: "OWNING", legalStructureId }, {});
        expect(screen.queryByText(Config.formation.fields.willPracticeLaw.label)).not.toBeInTheDocument();
      });
    }

    describe("Business Designator", () => {
      describe("Business Designator secondary label foreign corporation", () => {
        it.each(["c-corporation", "s-corporation", "nonprofit"])(
          `Shows secondary label foreign corporation when persona is foreign and legal structure is %s`,
          async (legalStructureId) => {
            await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, {});
            expect(
              screen.getByText(Config.formation.fields.businessSuffix.labelSecondaryTextForeignCorporation)
            ).toBeInTheDocument();
          }
        );
      });

      describe("Business Designator Options based on Will Practice Law Answer", () => {
        it.each(corpLegalStructures)(
          "Shows PA and PC options for Business Designator when Will You Practice Law is Yes",
          async (legalStructureId) => {
            await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, { willPracticeLaw: true });

            expect(screen.queryByText("P.C.")).not.toBeInTheDocument();
            expect(screen.queryByText("P.A.")).not.toBeInTheDocument();

            await userEvent.click(screen.getByTestId("business-suffix-main"));
            expect(screen.getByText("P.C.")).toBeInTheDocument();
            expect(screen.getByText("P.A.")).toBeInTheDocument();
          }
        );

        it.each(corpLegalStructures)(
          "Does not show PA and PC options for Business Designator when Will You Practice Law is No",
          async (legalStructureId) => {
            await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, { willPracticeLaw: false });
            expect(screen.queryByText("P.C.")).not.toBeInTheDocument();
            expect(screen.queryByText("P.A.")).not.toBeInTheDocument();

            await userEvent.click(screen.getByTestId("business-suffix-main"));

            expect(screen.queryByText("P.C.")).not.toBeInTheDocument();
            expect(screen.queryByText("P.A.")).not.toBeInTheDocument();
          }
        );

        it.each(corpLegalStructures)(
          "Does not show PA and PC options for Business Designator when Will You Practice Law is Undefined",
          async (legalStructureId) => {
            await getPageHelper(
              { businessPersona: "FOREIGN", legalStructureId },
              { willPracticeLaw: undefined }
            );
            expect(screen.queryByText("P.C.")).not.toBeInTheDocument();
            expect(screen.queryByText("P.A.")).not.toBeInTheDocument();

            await userEvent.click(screen.getByTestId("business-suffix-main"));

            expect(screen.queryByText("P.C.")).not.toBeInTheDocument();
            expect(screen.queryByText("P.A.")).not.toBeInTheDocument();
          }
        );

        it.each(corpLegalStructures)(
          "Displays an Alert when selecting an option for the Will you practice law question to tell the user Business Designator options have changed",
          async (legalStructureId) => {
            await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, {});
            expect(
              screen.queryByText(Config.formation.fields.businessSuffix.optionsUpdatedSnackbarAlert)
            ).not.toBeInTheDocument();
            fireEvent.click(screen.getByTestId("willPracticeLaw-true"));
            expect(
              screen.getByText(Config.formation.fields.businessSuffix.optionsUpdatedSnackbarAlert)
            ).toBeInTheDocument();
          }
        );

        it.each(corpLegalStructures)(
          "clears Business Designator if Will you practice law question is changed and Business designator is selected",
          async (legalStructureId) => {
            await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, { willPracticeLaw: true });
            await userEvent.click(screen.getByTestId("business-suffix-main"));
            await userEvent.click(screen.getByText("P.C."));
            expect(screen.getByTestId("business-suffix-main")).toHaveTextContent("P.C.");
            fireEvent.click(screen.getByTestId("willPracticeLaw-false"));
            expect(screen.getByTestId("business-suffix-main")).toBeEmptyDOMElement();
          }
        );
      });
    });
  });

  describe("Business location type radio buttons", () => {
    it("switches between location types", async () => {
      await getPageHelper({ businessPersona: "FOREIGN" }, { businessLocationType: "US" });
      fireEvent.click(screen.getByTestId("address-radio-intl"));
      expect(screen.getByLabelText("Address country")).toBeInTheDocument();
    });

    it("resets address data on switch", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { businessLocationType: "US" });
      page.fillText("Address line1", "test12345");
      fireEvent.click(screen.getByTestId("address-radio-intl"));
      expect(screen.queryByText("test12345")).not.toBeInTheDocument();
    });
  });

  describe("Address country", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address country", "Canada");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.addressCountry).toEqual("CA");
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address country", "test");
      expect(screen.getByText(Config.formation.fields.addressCountry.error)).toBeInTheDocument();
    });
  });

  describe("Address province", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressProvince: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address province", "Quebec");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.addressProvince).toEqual("Quebec");
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address province", "");
      expect(screen.getByText(Config.formation.fields.addressProvince.error)).toBeInTheDocument();
    });
  });

  describe("Address city", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { addressCity: undefined });
      page.fillText("Address city", "Quebec");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.addressCity).toEqual("Quebec");
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { addressCity: undefined });
      page.fillText("Address city", "");
      expect(screen.getByText(Config.formation.fields.addressCity.error)).toBeInTheDocument();
    });
  });

  describe("Address state", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressState: undefined, businessLocationType: "US" }
      );
      page.fillText("Address state", "AL");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.addressState).toEqual({
        name: "Alabama",
        shortCode: "AL",
      });
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressState: undefined, businessLocationType: "US" }
      );
      page.fillText("Address state", "");
      expect(screen.getByText(Config.formation.fields.addressState.error)).toBeInTheDocument();
    });
  });

  describe("Business total stock", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { legalStructureId: "c-corporation" },
        { businessTotalStock: undefined }
      );
      page.fillText("Business total stock", "123");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.businessTotalStock).toEqual("123");
    });

    it("trims leading zeros", async () => {
      const page = await getPageHelper(
        { legalStructureId: "c-corporation" },
        { businessTotalStock: undefined }
      );
      page.fillText("Business total stock", "0123");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.businessTotalStock).toEqual("123");
    });
  });

  describe("US zipCode validation", () => {
    it("displays error message when less than 5 characters are entered", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "2222");
      expect(screen.getByText(Config.formation.fields.addressZipCode.foreign.errorUS)).toBeInTheDocument();
    });

    it("displays error message when non-numeric zipCode is entered", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "AAAAA");
      expect(screen.getByText(Config.formation.fields.addressZipCode.foreign.errorUS)).toBeInTheDocument();
    });

    it("passes zipCode validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "01752");
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.addressZipCode).toEqual("01752");
    });

    it("limits zipCode to 5-digits in length", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "01752345");
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.addressZipCode).toEqual("01752");
    });
  });

  describe("INTL postal code validation", () => {
    it("displays error message when no characters are entered", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "INTL" }
      );
      page.fillText("Address zip code", "");
      expect(screen.getByText(Config.formation.fields.addressZipCode.foreign.errorIntl)).toBeInTheDocument();
    });

    it("passes 11-digit postal code validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "INTL" }
      );
      page.fillText("Address zip code", "12345678912");
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.addressZipCode).toEqual("12345678912");
    });

    it("limits postal code vto  11-digit digits in length", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "INTL" }
      );
      page.fillText("Address zip code", "12345678912345");
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.addressZipCode).toEqual("12345678912");
    });
  });

  describe("Foreign date of formation", () => {
    const fieldLabel = "Foreign date of formation";

    it("shows error when there is an invalid date", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignDateOfFormation: undefined }
      );
      page.fillText(fieldLabel, "12/23");
      expect(screen.getByText(Config.formation.fields.foreignDateOfFormation.error)).toBeInTheDocument();
    });

    it("saves an inputted date", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignDateOfFormation: undefined }
      );
      page.selectDate(getCurrentDate(), fieldLabel);
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.foreignDateOfFormation).toEqual(
        getCurrentDateFormatted(defaultDateFormat)
      );
    });
  });

  describe("business start date", () => {
    const fieldLabel = "Business start date";

    it("defaults date picker to current date when it has no value", async () => {
      const page = await getPageHelper({}, { businessStartDate: "" });
      expect(screen.getByLabelText("Business start date")).toBeInTheDocument();
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.businessStartDate).toEqual(
        getCurrentDateFormatted(defaultDateFormat)
      );
    });

    it("resets date on initial load", async () => {
      const yesterday = getCurrentDate().subtract(1, "day").format(defaultDateFormat);
      await getPageHelper({}, { businessStartDate: yesterday });
      expect(screen.getByLabelText("Business start date")).toHaveValue(
        getCurrentDateFormatted(defaultDisplayDateFormat)
      );
    });

    describe("businessStartDate validation", () => {
      describe("90 day limit", () => {
        corpLegalStructures.map((legalStructureId) =>
          describe(`${legalStructureId}`, () => {
            it("shows validation error past date limit", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().add(91, "day"), fieldLabel);
              expect(
                screen.getByText(Config.formation.fields.businessStartDate.error90Days)
              ).toBeInTheDocument();
            });

            it("shows validation error for previous date", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
              expect(
                screen.getByText(Config.formation.fields.businessStartDate.error90Days)
              ).toBeInTheDocument();
            });

            it("does not show validation error", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().add(89, "day"), fieldLabel);
              expect(
                screen.queryByText(Config.formation.fields.businessStartDate.error90Days)
              ).not.toBeInTheDocument();
            });
          })
        );
      });

      describe("30 day limit for limited-partnership", () => {
        it("shows validation error past date limit", async () => {
          const page = await getPageHelper({ legalStructureId: "limited-partnership" }, {});
          page.selectDate(getCurrentDate().add(31, "day"), fieldLabel);
          expect(screen.getByText(Config.formation.fields.businessStartDate.error30Days)).toBeInTheDocument();
        });

        it("shows validation error for previous date", async () => {
          const page = await getPageHelper({ legalStructureId: "limited-partnership" }, {});
          page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
          expect(screen.getByText(Config.formation.fields.businessStartDate.error30Days)).toBeInTheDocument();
        });

        it("does not show validation error", async () => {
          const page = await getPageHelper({ legalStructureId: "limited-partnership" }, {});
          page.selectDate(getCurrentDate().add(29, "day"), fieldLabel);
          expect(
            screen.queryByText(Config.formation.fields.businessStartDate.error30Days)
          ).not.toBeInTheDocument();
        });
      });

      describe("future date", () => {
        const legalStructureIds = ["limited-liability-company", "limited-liability-partnership"];
        legalStructureIds.map((legalStructureId) =>
          describe(`${legalStructureId}`, () => {
            it("shows validation error", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
              expect(
                screen.getByText(Config.formation.fields.businessStartDate.errorFuture)
              ).toBeInTheDocument();
            });

            it("does not show validation error", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().add(120, "day"), fieldLabel);
              expect(
                screen.queryByText(Config.formation.fields.businessStartDate.errorFuture)
              ).not.toBeInTheDocument();
            });
          })
        );
      });

      describe("current date", () => {
        const legalStructureIds = ["limited-liability-company"];
        const businessPersona = "FOREIGN";
        legalStructureIds.map((legalStructureId) =>
          describe(`${legalStructureId}`, () => {
            it("shows field as disabled", async () => {
              await getPageHelper({ legalStructureId, businessPersona }, {});
              expect(screen.getByLabelText("Business start date")).toBeDisabled();
            });

            it("reset to current date", async () => {
              await getPageHelper(
                { legalStructureId, businessPersona },
                { businessStartDate: getCurrentDate().subtract(4, "day").format(defaultDisplayDateFormat) }
              );
              expect(screen.getByLabelText("Business start date")).toHaveValue(
                getCurrentDate().format(defaultDisplayDateFormat)
              );
            });
          })
        );
      });
    });
  });

  describe("profile data information", () => {
    it.each(publicFilingLegalTypes)(
      "displays domestic legal structure label for %s",
      async (legalStructureId) => {
        await getPageHelper({ legalStructureId, businessPersona: "STARTING" }, {});
        const displayLegalStructure = screen.getByTestId("legal-structure");
        expect(displayLegalStructure).toHaveTextContent(
          Config.formation.legalStructure.domesticLabels[legalStructureId]
        );
      }
    );

    it.each(publicFilingLegalTypes)(
      "displays foreign legal structure label for %s",
      async (legalStructureId) => {
        await getPageHelper({ legalStructureId, businessPersona: "FOREIGN" }, {});
        const displayLegalStructure = screen.getByTestId("legal-structure");
        expect(displayLegalStructure).toHaveTextContent(
          Config.formation.legalStructure.foreignLabels[legalStructureId]
        );
      }
    );

    it("displays business name from name check step and overrides profile", async () => {
      const page = await getPageHelper({ businessName: "some cool name" }, {});

      fireEvent.click(screen.getByText(Config.formation.general.previousButtonText));
      await page.fillAndSubmitBusinessNameStep("another cool name");

      expect(screen.getByText("another cool name", { exact: false })).toBeInTheDocument();
      expect(screen.queryByText("some cool name", { exact: false })).not.toBeInTheDocument();

      expect(screen.queryByText(Config.formation.general.notEntered)).not.toBeInTheDocument();
    });

    it("displays City (Main Address) from profile data", async () => {
      await getPageHelper(
        {
          businessPersona: "STARTING",
        },
        { addressMunicipality: generateMunicipality({ displayName: "Newark", name: "Newark" }) }
      );
      expect((screen.getByLabelText("Address municipality") as HTMLInputElement).value).toEqual("Newark");
    });
  });

  describe("nonprofit veteran question", () => {
    it("shows veteran question for nonprofit legal type", async () => {
      await getPageHelper({ legalStructureId: "nonprofit" }, {});
      expect(screen.getByLabelText("Is veteran nonprofit")).toBeInTheDocument();
    });

    it("does not show veteran question for legal types that are not nonprofit", async () => {
      const legalTypesNotNonprofit = publicFilingLegalTypes.filter((it) => it !== "nonprofit");
      await getPageHelper({ legalStructureId: randomElementFromArray(legalTypesNotNonprofit) }, {});
      expect(screen.queryByLabelText("Is veteran nonprofit")).not.toBeInTheDocument();
    });

    it("saves data to formationData", async () => {
      const page = await getPageHelper({ legalStructureId: "nonprofit" }, { isVeteranNonprofit: undefined });
      page.chooseRadio("isVeteranNonprofit-true");
      await page.submitBusinessStep(true);
      expect(currentBusiness().formationData.formationFormData.isVeteranNonprofit).toEqual(true);
    });
  });

  describe("nonprofit provisions", () => {
    it("shows nonprofit provisions for nonprofit legal type", async () => {
      await getPageHelper({ legalStructureId: "nonprofit" }, {});
      expect(screen.getByLabelText("Has nonprofit board members")).toBeInTheDocument();
    });

    it("does not show nonprofit provisions for foreign nonprofit legal type", async () => {
      await getPageHelper({ legalStructureId: "nonprofit", businessPersona: "FOREIGN" }, {});
      expect(screen.queryByLabelText("Has nonprofit board members")).not.toBeInTheDocument();
    });

    it("does not show nonprofit provisions for legal types that are not nonprofit", async () => {
      const legalTypesNotNonprofit = publicFilingLegalTypes.filter((it) => it !== "nonprofit");
      await getPageHelper({ legalStructureId: randomElementFromArray(legalTypesNotNonprofit) }, {});
      expect(screen.queryByLabelText("Has nonprofit board members")).not.toBeInTheDocument();
    });
  });

  describe("required fields", () => {
    const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
      await page.stepperClickToReviewStep();
      await page.clickSubmit();
      await page.stepperClickToBusinessStep();
    };

    it("displays Business Suffix error label when Business Suffix is undefined", async () => {
      const page = await getPageHelper({}, { businessSuffix: undefined });
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.businessSuffix.label
      );
    });

    it("displays Withdrawals error label when Withdrawals is empty", async () => {
      const page = await getPageHelper({ legalStructureId: "limited-partnership" }, { withdrawals: "" });
      await attemptApiSubmission(page);
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
      expect(screen.getByTestId("alert-error")).toHaveTextContent(Config.formation.fields.withdrawals.label);
    });

    it("displays Dissolution error label when Dissolution is empty", async () => {
      const page = await getPageHelper({ legalStructureId: "limited-partnership" }, { dissolution: "" });
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(Config.formation.fields.dissolution.label);
    });

    it("displays Combined Investment error label when Combined Investment is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { combinedInvestment: "" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.combinedInvestment.label
      );
    });

    it("displays error label when Partnership Rights can create Limited Partner is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canCreateLimitedPartner: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.formation.fields.canCreateLimitedPartner.label
      );
    });

    it("displays error label when Partnership Rights Limited Partner Terms is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canCreateLimitedPartner: true, createLimitedPartnerTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canCreateLimitedPartner-true"));
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.createLimitedPartnerTerms.label
      );
    });

    it("displays error label when Partnership Rights can make distribution is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canMakeDistribution: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.formation.fields.canMakeDistribution.label
      );
    });

    it("displays error label when Partnership Rights make distribution terms is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canMakeDistribution: true, makeDistributionTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canMakeDistribution-true"));
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.makeDistributionTerms.label
      );
    });

    it("displays error label when Partnership Rights can get distribution is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canGetDistribution: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.formation.fields.canGetDistribution.label
      );
    });

    it("displays error label when Partnership Rights get distribution terms is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canGetDistribution: true, getDistributionTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canGetDistribution-true"));
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.getDistributionTerms.label
      );
    });

    it("displays error label when Total Shares is empty", async () => {
      const page = await getPageHelper({ legalStructureId: "c-corporation" }, { businessTotalStock: "" });
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.businessTotalStock.label
      );
      expect(screen.getByText(Config.formation.fields.businessTotalStock.error)).toBeInTheDocument();
    });

    it("displays error label when Foreign Date of Formation is undefined", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignDateOfFormation: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.foreignDateOfFormation.label
      );
      expect(screen.getByText(Config.formation.fields.foreignDateOfFormation.error)).toBeInTheDocument();
    });

    it("displays error label when Foreign State of Formation is undefined", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
        { foreignStateOfFormation: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.foreignStateOfFormation.label
      );
      expect(screen.getByText(Config.formation.fields.foreignStateOfFormation.error)).toBeInTheDocument();
    });

    it("displays error label when Address line1 is empty", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { addressLine1: "" });
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(Config.formation.fields.addressLine1.label);
    });

    it("displays error label when Address zip code is empty", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { addressZipCode: "" });
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.addressZipCode.label
      );
    });

    it("displays error label when Address province is undefined", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressProvince: undefined, businessLocationType: "INTL" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.addressProvince.label
      );
    });

    it("displays error label when Address country is undefined", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.addressCountry.label
      );
    });

    it("displays error label when Address city is undefined", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCity: undefined, businessLocationType: "INTL" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(Config.formation.fields.addressCity.label);
    });

    it("displays error label when Address state is undefined", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressState: undefined, businessLocationType: "US" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(Config.formation.fields.addressState.label);
    });

    it("displays error label when isVeteranNonprofit is undefined", async () => {
      const page = await getPageHelper({ legalStructureId: "nonprofit" }, { isVeteranNonprofit: undefined });
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.isVeteranNonprofit.label
      );
      expect(screen.getByText(Config.formation.fields.isVeteranNonprofit.error)).toBeInTheDocument();
    });

    it("displays error label when hasNonprofitBoardMembers is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        { hasNonprofitBoardMembers: undefined, legalType: "nonprofit" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.hasNonprofitBoardMembers.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitBoardMemberQualificationsSpecified is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitBoardMemberQualificationsSpecified: undefined,
          legalType: "nonprofit",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitBoardMemberQualificationsSpecified.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitBoardMemberQualificationsTerms is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitBoardMemberQualificationsSpecified: "IN_FORM",
          nonprofitBoardMemberQualificationsTerms: "",
          legalType: "nonprofit",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitBoardMemberQualificationsTerms.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitBoardMemberRightsSpecified is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitBoardMemberRightsSpecified: undefined,
          legalType: "nonprofit",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitBoardMemberRightsSpecified.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitBoardMemberRightsTerms is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitBoardMemberRightsSpecified: "IN_FORM",
          legalType: "nonprofit",
          nonprofitBoardMemberRightsTerms: "",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitBoardMemberRightsSpecified.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitTrusteesMethodSpecified is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitTrusteesMethodSpecified: undefined,
          legalType: "nonprofit",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitTrusteesMethodSpecified.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitTrusteesMethodTerms is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitTrusteesMethodSpecified: "IN_FORM",
          nonprofitTrusteesMethodTerms: "",
          legalType: "nonprofit",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitTrusteesMethodTerms.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitAssetDistributionSpecified is undefined", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitAssetDistributionSpecified: undefined,
          legalType: "nonprofit",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitAssetDistributionSpecified.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });

    it("displays error label when nonprofitAssetDistributionTerms is empty", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitAssetDistributionSpecified: "IN_FORM",
          nonprofitAssetDistributionTerms: "",
          legalType: "nonprofit",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        Config.formation.fields.nonprofitAssetDistributionTerms.label
      );
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();
    });
  });
});
