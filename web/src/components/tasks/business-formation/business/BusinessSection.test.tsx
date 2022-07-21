import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateMunicipality,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { mockPush } from "@/test/mock/mockRouter";
import { currentUserData, userDataUpdatedNTimes } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  FormationFormData,
  FormationLegalType,
  getCurrentDate,
  getCurrentDateFormatted,
  Municipality,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - BusinessSection", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    municipalities?: Municipality[],
    initialUser?: Partial<BusinessUser>
  ): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(
        formationFormData,
        profileData.legalStructureId as FormationLegalType
      ),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const user = initialUser ? generateUser(initialUser) : generateUser({});
    const page = preparePage(
      generateUserData({ profileData, formationData, user }),
      generateFormationDisplayContent({}),
      municipalities
    );
    await page.submitBusinessNameTab();
    return page;
  };

  it("displays modal when legal structure Edit button clicked", async () => {
    await getPageHelper({}, {});
    expect(
      screen.queryByText(Config.businessFormationDefaults.legalStructureWarningModalHeader)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("edit-legal-structure"));
    expect(
      screen.getByText(Config.businessFormationDefaults.legalStructureWarningModalHeader)
    ).toBeInTheDocument();
  });

  it("routes to profile page when edit legal structure button is clicked", async () => {
    await getPageHelper({}, {});

    fireEvent.click(screen.getByTestId("edit-legal-structure"));
    fireEvent.click(
      within(screen.getByTestId("modal-content")).getByText(
        Config.businessFormationDefaults.legalStructureWarningModalContinueButtonText
      )
    );
    expect(mockPush).toHaveBeenCalledWith("/profile?path=businessFormation");
  });

  it("auto-fills fields from userData if it exists", async () => {
    const page = await getPageHelper(
      { legalStructureId: "limited-liability-company" },
      {
        businessSuffix: "LTD LIABILITY CO",
        businessStartDate: getCurrentDateFormatted("YYYY-MM-DD"),
        businessAddressCity: generateMunicipality({ displayName: "Newark" }),
        businessAddressLine1: "123 main street",
        businessAddressLine2: "suite 102",
        businessAddressState: "NJ",
        businessAddressZipCode: "07601",
        businessPurpose: "some cool purpose",
      },
      undefined,
      {}
    );

    expect(screen.getByText("LTD LIABILITY CO")).toBeInTheDocument();
    expect(page.getInputElementByLabel("Business start date").value).toBe(
      getCurrentDateFormatted("MM/DD/YYYY")
    );
    expect(page.getInputElementByLabel("Business address line1").value).toBe("123 main street");
    expect(page.getInputElementByLabel("Business address line2").value).toBe("suite 102");
    expect(page.getInputElementByLabel("Business address state").value).toBe("NJ");
    expect(page.getInputElementByLabel("Business address zip code").value).toBe("07601");
    expect(page.getInputElementByLabel("Business purpose").value).toBe("some cool purpose");
  });

  it("saves business address city to profile after clicking continue", async () => {
    const page = await getPageHelper({ municipality: generateMunicipality({ displayName: "Newark" }) }, {}, [
      generateMunicipality({ displayName: "Whatever Town" }),
    ]);

    expect((screen.getByLabelText("Business address city") as HTMLInputElement).value).toEqual("Newark");
    page.selectByText("Business address city", "Whatever Town");
    expect((screen.getByLabelText("Business address city") as HTMLInputElement).value).toEqual(
      "Whatever Town"
    );
    await page.submitBusinessTab();
    await waitFor(() => {
      expect(currentUserData().profileData.municipality?.displayName).toEqual("Whatever Town");
    });
    expect(currentUserData().formationData.formationFormData.businessAddressCity?.displayName).toEqual(
      "Whatever Town"
    );
  });

  it("does not save business address city to profile when page is invalid", async () => {
    const page = await getPageHelper({ municipality: generateMunicipality({ displayName: "Newark" }) }, {}, [
      generateMunicipality({ displayName: "Whatever Town" }),
    ]);
    page.selectByText("Business address city", "Whatever Town");
    page.fillText("Business address zip code", "AAAAA");
    await page.submitBusinessTab(false);

    await waitFor(() => {
      expect(currentUserData().profileData.municipality?.displayName).toEqual("Newark");
    });
    expect(currentUserData().formationData.formationFormData.businessAddressCity?.displayName).toEqual(
      "Whatever Town"
    );
  });

  it("does not display dependency alert", async () => {
    await getPageHelper({}, {});
    expect(screen.queryByTestId("dependency-alert")).not.toBeInTheDocument();
  });

  it("goes back to name tab when edit business name button is clicked", async () => {
    await getPageHelper({}, {});
    fireEvent.click(screen.getByTestId("edit-business-name"));
    expect(screen.getByTestId("business-name-section")).toBeInTheDocument();
  });

  it("displays alert and highlights fields when submitting with missing fields", async () => {
    const page = await getPageHelper({}, { businessAddressLine1: "" });
    await page.submitBusinessTab(false);
    expect(
      screen.getByText(Config.businessFormationDefaults.businessAddressLine1ErrorText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
    ).toBeInTheDocument();
    page.fillText("Business address line1", "1234 main street");
    await page.submitBusinessTab();
    expect(
      screen.queryByText(Config.businessFormationDefaults.businessAddressLine1ErrorText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
    ).not.toBeInTheDocument();
  });

  describe("Business purpose", () => {
    it("keeps business purpose closed by default", async () => {
      await getPageHelper({}, { businessPurpose: "" });
      expect(screen.getByText(Config.businessFormationDefaults.businessPurposeTitle)).toBeInTheDocument();
      expect(
        screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("remove business purpose")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Business purpose")).not.toBeInTheDocument();
    });

    it("shows business purpose open if exists", async () => {
      await getPageHelper({}, { businessPurpose: "some purpose" });
      expect(
        screen.queryByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove business purpose")).toBeInTheDocument();
      expect(screen.getByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("opens business purpose when Add button clicked", async () => {
      await getPageHelper({}, { businessPurpose: "" });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));

      expect(
        screen.queryByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove business purpose")).toBeInTheDocument();
      expect(screen.getByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("removes business purpose when Remove button clicked", async () => {
      const page = await getPageHelper({}, { businessPurpose: "some purpose" });
      fireEvent.click(screen.getByLabelText("remove business purpose"));
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.businessPurpose).toEqual("");
    });

    it("updates char count in real time", async () => {
      const page = await getPageHelper({}, { businessPurpose: "" });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
      expect(screen.getByText("0 / 300", { exact: false })).toBeInTheDocument();
      page.fillText("Business purpose", "some purpose");
      const charLength = "some purpose".length;
      expect(screen.getByText(`${charLength} / 300`, { exact: false })).toBeInTheDocument();
    });
  });

  describe("provisions", () => {
    it("keeps provisions closed by default", async () => {
      await getPageHelper({}, { provisions: [] });
      expect(screen.getByText(Config.businessFormationDefaults.provisionsTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText)).toBeInTheDocument();
      expect(screen.queryByLabelText("remove provision")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("provision 0")).not.toBeInTheDocument();
    });

    it("shows provisions open if exists", async () => {
      await getPageHelper({}, { provisions: ["provision1", "provision2"] });
      expect(
        screen.queryByText(Config.businessFormationDefaults.provisionsAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("opens provisions when Add button clicked", async () => {
      await getPageHelper({}, { provisions: [] });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText));

      expect(
        screen.queryByText(Config.businessFormationDefaults.provisionsAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove provision")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
    });

    it("adds more provisions when Add More button clicked", async () => {
      await getPageHelper({}, { provisions: [] });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText));
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      expect(screen.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("removes correct provision when Remove button clicked", async () => {
      const page = await getPageHelper(
        {},
        {
          provisions: ["provision1", "provision2", "provision3"],
        }
      );
      const removeProvision2Button = screen.getAllByLabelText("remove provision")[1];
      fireEvent.click(removeProvision2Button);
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.provisions).toEqual([
        "provision1",
        "provision3",
      ]);
    });

    it("removes empty provisions when moving to next tab", async () => {
      const page = await getPageHelper({}, { provisions: ["provision0"] });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      page.fillText("Provisions 2", "provision2");
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.provisions).toEqual([
        "provision0",
        "provision2",
      ]);
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
      expect(screen.queryAllByLabelText("remove provision")).toHaveLength(2);
    });

    it("updates char count in real time", async () => {
      const page = await getPageHelper({}, { provisions: [] });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText));
      expect(screen.getByText("0 / 3000", { exact: false })).toBeInTheDocument();
      page.fillText("Provisions 0", "some provision");
      const charLength = "some provision".length;
      expect(screen.getByText(`${charLength} / 3000`, { exact: false })).toBeInTheDocument();
    });

    it("does not allow adding more than 10 provisions", async () => {
      const nineProvisions = Array(9).fill("some provision");
      await getPageHelper({}, { provisions: nineProvisions });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      expect(
        screen.queryByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText)
      ).not.toBeInTheDocument();
    });
  });

  describe("Business total stock", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { legalStructureId: "c-corporation" },
        { businessTotalStock: undefined }
      );
      page.fillText("Business total stock", "123");
      await page.submitBusinessTab(true);
      expect(currentUserData().formationData.formationFormData.businessTotalStock).toEqual("123");
    });

    it("trims leading zeroe", async () => {
      const page = await getPageHelper(
        { legalStructureId: "c-corporation" },
        { businessTotalStock: undefined }
      );
      page.fillText("Business total stock", "0123");
      await page.submitBusinessTab(true);
      expect(currentUserData().formationData.formationFormData.businessTotalStock).toEqual("123");
    });
  });

  describe("NJ zipcode validation", () => {
    it("displays error message when non-NJ zipcode is entered in main business address", async () => {
      const page = await getPageHelper({}, { businessAddressZipCode: "" });
      page.fillText("Business address zip code", "22222");

      await page.submitBusinessTab(false);
      await waitFor(() => {
        expect(
          screen.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).toBeInTheDocument();
    });

    it("displays error message when alphabetical zipcode is entered in main business address", async () => {
      const page = await getPageHelper({}, { businessAddressZipCode: "" });
      page.fillText("Business address zip code", "AAAAA");
      await page.submitBusinessTab(false);
      await waitFor(() => {
        expect(
          screen.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).toBeInTheDocument();
    });

    it("passes zipcode validation in main business address", async () => {
      const page = await getPageHelper({}, { businessAddressZipCode: "" });
      page.fillText("Business address zip code", "07001");
      await page.submitBusinessTab(true);
      expect(currentUserData().formationData.formationFormData.businessAddressZipCode).toEqual("07001");
    });
  });

  describe("business start date", () => {
    it("defaults date picker to current date when it has no value", async () => {
      const page = await getPageHelper({}, { businessStartDate: "" });
      expect(screen.getByLabelText("Business start date")).toBeInTheDocument();
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.businessStartDate).toEqual(
        getCurrentDateFormatted("YYYY-MM-DD")
      );
    });

    it("resets date on initial load", async () => {
      await getPageHelper(
        {},
        {
          businessStartDate: getCurrentDate().subtract(1, "day").format("YYYY-MM-DD"),
        }
      );

      expect(screen.getByLabelText("Business start date")).toHaveValue(getCurrentDateFormatted("MM/DD/YYYY"));
    });

    it("validates date on submit", async () => {
      const page = await getPageHelper({}, {});
      page.selectDate(getCurrentDate().subtract(4, "day"));
      await page.submitBusinessTab(false);
      expect(screen.getByText(Config.businessFormationDefaults.startDateErrorText)).toBeInTheDocument();
      expect(
        screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).toBeInTheDocument();
    });
  });

  describe("profile data information", () => {
    it("displays llc legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "limited-liability-company" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.llcText);
    });

    it("displays llp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "limited-liability-partnership" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.llpText);
    });

    it("displays lp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "limited-partnership" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.lpText);
    });

    it("displays sCorp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "s-corporation" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.sCorpText);
    });

    it("displays cCorp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "c-corporation" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.cCorpText);
    });

    it("displays business name from name check section and overrides profile", async () => {
      const page = await getPageHelper({ businessName: "some cool name" }, {});

      fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
      await page.submitBusinessNameTab("another cool name");

      expect(screen.getByText("another cool name", { exact: false })).toBeInTheDocument();
      expect(screen.queryByText("some cool name", { exact: false })).not.toBeInTheDocument();

      expect(
        screen.queryByText(Config.businessFormationDefaults.notSetBusinessNameText, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("displays City (Main Business Address) from profile data", async () => {
      await getPageHelper({ municipality: generateMunicipality({ displayName: "Newark" }) }, {});
      expect((screen.getByLabelText("Business address city") as HTMLInputElement).value).toEqual("Newark");

      expect(
        screen.queryByText(Config.businessFormationDefaults.notSetBusinessAddressCityLabel, {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe("required fields", () => {
    it("Business suffix", async () => {
      const page = await getPageHelper({}, { businessSuffix: undefined });
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Business suffix/);
    });

    it("Withdrawals", async () => {
      const page = await getPageHelper({ legalStructureId: "limited-partnership" }, { withdrawals: "" });
      await page.submitBusinessTab(false);
      expect(screen.getByText(Config.businessFormationDefaults.genericErrorText)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(/Withdrawals/);
    });

    it("Dissolution", async () => {
      const page = await getPageHelper({ legalStructureId: "limited-partnership" }, { dissolution: "" });
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Dissolution/);
    });

    it("Combined Investment", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { combinedInvestment: "" }
      );
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Combined investment/);
    });

    it("Partnership Rights can create Limited Partner", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canCreateLimitedPartner: undefined }
      );
      await page.submitBusinessTab(false);
      expect(screen.getByText(Config.businessFormationDefaults.genericErrorText)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(/Can create limited partner/);
    });

    it("Partnership Rights Limited Partner Terms", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canCreateLimitedPartner: undefined, createLimitedPartnerTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canCreateLimitedPartner-true"));
      await page.submitBusinessTab(false);
      expect(screen.getByText(Config.businessFormationDefaults.genericErrorText)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(/Create limited partner terms/);
    });

    it("Partnership Rights can make distribution", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canMakeDistribution: undefined }
      );
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Can make distribution/);
    });

    it("Partnership Rights make distribution terms", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canMakeDistribution: undefined, makeDistributionTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canMakeDistribution-true"));
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Make distribution terms/);
    });

    it("Partnership Rights can get distribution", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canGetDistribution: undefined }
      );
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Can get distribution/);
    });

    it("Partnership Rights get distribution terms", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canGetDistribution: undefined, getDistributionTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canGetDistribution-true"));
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Get distribution terms/);
    });

    it("Total Shares", async () => {
      const page = await getPageHelper(
        { legalStructureId: "c-corporation" },
        { businessTotalStock: undefined }
      );
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Business total stock/);
      expect(
        screen.getByText(Config.businessFormationDefaults.businessTotalStockErrorText)
      ).toBeInTheDocument();
    });

    it("Business address line1", async () => {
      const page = await getPageHelper({}, { businessAddressLine1: "" });
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Business address line1/);
    });

    it("Business address zip code", async () => {
      const page = await getPageHelper({}, { businessAddressZipCode: "" });
      await page.submitBusinessTab(false);
      expect(screen.getByRole("alert")).toHaveTextContent(/Business address zip code/);
    });

    it("does not require business address line 2", async () => {
      const page = await getPageHelper({}, { businessAddressLine2: "" });
      await page.submitBusinessTab();
      expect(userDataUpdatedNTimes()).toEqual(2);
    });
  });
});
