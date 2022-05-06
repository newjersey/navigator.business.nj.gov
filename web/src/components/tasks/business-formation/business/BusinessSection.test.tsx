import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateMunicipality,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  generateLLCProfileData,
  RenderedTask,
  renderTask,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { mockPush } from "@/test/mock/mockRouter";
import { currentUserData, userDataUpdatedNTimes } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  FormationFormData,
  getCurrentDate,
  getCurrentDateFormatted,
  Municipality,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, waitFor, within } from "@testing-library/react";

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
    process.env.FEATURE_BUSINESS_PURPOSE = "true";
  });

  const renderSection = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    municipalities?: Municipality[],
    initialUser?: Partial<BusinessUser>
  ): Promise<RenderedTask> => {
    const profileData = generateLLCProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const user = initialUser ? generateUser(initialUser) : generateUser({});
    const renderedTask = renderTask(
      generateUserData({ profileData, formationData, user }),
      generateFormationDisplayContent({}),
      municipalities
    );
    await renderedTask.page.submitBusinessNameTab();
    return renderedTask;
  };

  it("displays modal when legal structure Edit button clicked", async () => {
    const { subject } = await renderSection({}, {});
    expect(
      subject.queryByText(Config.businessFormationDefaults.legalStructureWarningModalHeader)
    ).not.toBeInTheDocument();
    fireEvent.click(subject.getByTestId("edit-legal-structure"));
    expect(
      subject.queryByText(Config.businessFormationDefaults.legalStructureWarningModalHeader)
    ).toBeInTheDocument();
  });

  it("routes to profile page when edit legal structure button is clicked", async () => {
    const { subject } = await renderSection({}, {});

    fireEvent.click(subject.getByTestId("edit-legal-structure"));
    fireEvent.click(
      within(subject.getByTestId("modal-content")).getByText(
        Config.businessFormationDefaults.legalStructureWarningModalContinueButtonText
      )
    );
    expect(mockPush).toHaveBeenCalledWith("/profile?path=businessFormation");
  });

  it("auto-fills fields from userData if it exists", async () => {
    const formationData = generateFormationFormData({
      businessSuffix: "LTD LIABILITY CO",
      businessStartDate: getCurrentDateFormatted("YYYY-MM-DD"),
      businessAddressCity: generateMunicipality({ displayName: "Newark" }),
      businessAddressLine1: "123 main street",
      businessAddressLine2: "suite 102",
      businessAddressState: "NJ",
      businessAddressZipCode: "07601",
      businessPurpose: "some cool purpose",
    });

    const { subject, page } = await renderSection({}, formationData);

    expect(subject.getByText("LTD LIABILITY CO")).toBeInTheDocument();
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
    const { subject, page } = await renderSection(
      { municipality: generateMunicipality({ displayName: "Newark" }) },
      {},
      [generateMunicipality({ displayName: "Whatever Town" })]
    );

    expect((subject.getByLabelText("Business address city") as HTMLInputElement).value).toEqual("Newark");
    page.selectByText("Business address city", "Whatever Town");
    expect((subject.getByLabelText("Business address city") as HTMLInputElement).value).toEqual(
      "Whatever Town"
    );
    await page.submitBusinessTab();
    await waitFor(() => {
      expect(currentUserData().profileData.municipality?.displayName).toEqual("Whatever Town");
      expect(currentUserData().formationData.formationFormData.businessAddressCity?.displayName).toEqual(
        "Whatever Town"
      );
    });
  });

  it("does not save business address city to profile when page is invalid", async () => {
    const { page } = await renderSection(
      { municipality: generateMunicipality({ displayName: "Newark" }) },
      {},
      [generateMunicipality({ displayName: "Whatever Town" })]
    );
    page.selectByText("Business address city", "Whatever Town");
    page.fillText("Business address zip code", "AAAAA");
    await page.submitBusinessTab(false);

    await waitFor(() => {
      expect(currentUserData().profileData.municipality?.displayName).toEqual("Newark");
      expect(currentUserData().formationData.formationFormData.businessAddressCity?.displayName).toEqual(
        "Whatever Town"
      );
    });
  });

  it("does not display dependency alert", async () => {
    const { subject } = await renderSection({}, {});
    expect(subject.queryByTestId("dependency-alert")).not.toBeInTheDocument();
  });

  it("goes back to name tab when edit business name button is clicked", async () => {
    const { subject } = await renderSection({}, {});
    fireEvent.click(subject.getByTestId("edit-business-name"));
    expect(subject.queryByTestId("business-name-section")).toBeInTheDocument();
  });

  it("displays alert and highlights fields when submitting with missing fields", async () => {
    const { subject, page } = await renderSection({}, { businessAddressLine1: "" });
    await page.submitBusinessTab(false);
    expect(
      subject.getByText(Config.businessFormationDefaults.businessAddressLine1ErrorText)
    ).toBeInTheDocument();
    expect(
      subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
    ).toBeInTheDocument();
    page.fillText("Business address line1", "1234 main street");
    await page.submitBusinessTab();
    expect(
      subject.queryByText(Config.businessFormationDefaults.businessAddressLine1ErrorText)
    ).not.toBeInTheDocument();
    expect(
      subject.queryByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
    ).not.toBeInTheDocument();
  });

  describe("Business purpose", () => {
    it("keeps business purpose closed by default", async () => {
      const { subject } = await renderSection({}, { businessPurpose: "" });
      expect(subject.queryByText(Config.businessFormationDefaults.businessPurposeTitle)).toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).toBeInTheDocument();
      expect(subject.queryByLabelText("remove business purpose")).not.toBeInTheDocument();
      expect(subject.queryByLabelText("Business purpose")).not.toBeInTheDocument();
    });

    it("shows business purpose open if exists", async () => {
      const { subject } = await renderSection({}, { businessPurpose: "some purpose" });
      expect(
        subject.queryByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).not.toBeInTheDocument();
      expect(subject.queryByLabelText("remove business purpose")).toBeInTheDocument();
      expect(subject.queryByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("opens business purpose when Add button clicked", async () => {
      const { subject } = await renderSection({}, { businessPurpose: "" });
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));

      expect(
        subject.queryByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).not.toBeInTheDocument();
      expect(subject.queryByLabelText("remove business purpose")).toBeInTheDocument();
      expect(subject.queryByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("removes business purpose when Remove button clicked", async () => {
      const { subject, page } = await renderSection({}, { businessPurpose: "some purpose" });
      fireEvent.click(subject.getByLabelText("remove business purpose"));
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.businessPurpose).toEqual("");
    });

    it("updates char count in real time", async () => {
      const { subject, page } = await renderSection({}, { businessPurpose: "" });
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
      expect(subject.getByText("0 / 300", { exact: false })).toBeInTheDocument();
      page.fillText("Business purpose", "some purpose");
      const charLength = "some purpose".length;
      expect(subject.getByText(`${charLength} / 300`, { exact: false })).toBeInTheDocument();
    });
  });

  describe("provisions", () => {
    it("keeps provisions closed by default", async () => {
      const { subject } = await renderSection({}, { provisions: [] });
      expect(subject.queryByText(Config.businessFormationDefaults.provisionsTitle)).toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.provisionsAddButtonText)
      ).toBeInTheDocument();
      expect(subject.queryAllByLabelText("remove provision")).toHaveLength(0);
      expect(subject.queryByLabelText("provision 0")).not.toBeInTheDocument();
    });

    it("shows provisions open if exists", async () => {
      const { subject } = await renderSection({}, { provisions: ["provision1", "provision2"] });
      expect(
        subject.queryByText(Config.businessFormationDefaults.provisionsAddButtonText)
      ).not.toBeInTheDocument();
      expect(subject.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(subject.queryByLabelText("Provisions 0")).toBeInTheDocument();
      expect(subject.queryByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("opens provisions when Add button clicked", async () => {
      const { subject } = await renderSection({}, { provisions: [] });
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.provisionsAddButtonText));

      expect(
        subject.queryByText(Config.businessFormationDefaults.provisionsAddButtonText)
      ).not.toBeInTheDocument();
      expect(subject.queryAllByLabelText("remove provision")).toHaveLength(1);
      expect(subject.queryByLabelText("Provisions 0")).toBeInTheDocument();
    });

    it("adds more provisions when Add More button clicked", async () => {
      const { subject } = await renderSection({}, { provisions: [] });
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.provisionsAddButtonText));
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      expect(subject.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(subject.queryByLabelText("Provisions 0")).toBeInTheDocument();
      expect(subject.queryByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("removes correct provision when Remove button clicked", async () => {
      const { subject, page } = await renderSection(
        {},
        {
          provisions: ["provision1", "provision2", "provision3"],
        }
      );
      const removeProvision2Button = subject.getAllByLabelText("remove provision")[1];
      fireEvent.click(removeProvision2Button);
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.provisions).toEqual([
        "provision1",
        "provision3",
      ]);
    });

    it("removes empty provisions when moving to next tab", async () => {
      const { subject, page } = await renderSection({}, { provisions: ["provision0"] });
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      page.fillText("Provisions 2", "provision2");
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.provisions).toEqual([
        "provision0",
        "provision2",
      ]);
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.previousButtonText));
      expect(subject.queryAllByLabelText("remove provision")).toHaveLength(2);
    });

    it("updates char count in real time", async () => {
      const { subject, page } = await renderSection({}, { provisions: [] });
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.provisionsAddButtonText));
      expect(subject.getByText("0 / 3000", { exact: false })).toBeInTheDocument();
      page.fillText("Provisions 0", "some provision");
      const charLength = "some provision".length;
      expect(subject.getByText(`${charLength} / 3000`, { exact: false })).toBeInTheDocument();
    });

    it("does not allow adding more than 10 provisions", async () => {
      const nineProvisions = Array(9).fill("some provision");
      const { subject } = await renderSection({}, { provisions: nineProvisions });
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      expect(
        subject.queryByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText)
      ).not.toBeInTheDocument();
    });
  });

  describe("NJ zipcode validation", () => {
    it("displays error message when non-NJ zipcode is entered in main business address", async () => {
      const { subject, page } = await renderSection({}, { businessAddressZipCode: "" });
      page.fillText("Business address zip code", "22222");

      await page.submitBusinessTab(false);
      await waitFor(() => {
        expect(
          subject.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
        ).toBeInTheDocument();
        expect(
          subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
      });
    });

    it("displays error message when alphabetical zipcode is entered in main business address", async () => {
      const { subject, page } = await renderSection({}, { businessAddressZipCode: "" });
      page.fillText("Business address zip code", "AAAAA");
      await page.submitBusinessTab(false);
      await waitFor(() => {
        expect(
          subject.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
        ).toBeInTheDocument();
        expect(
          subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
      });
    });

    it("passes zipcode validation in main business address", async () => {
      const { page } = await renderSection({}, { businessAddressZipCode: "" });
      page.fillText("Business address zip code", "07001");
      await page.submitBusinessTab(true);
    });
  });

  describe("business start date", () => {
    it("defaults date picker to current date when it has no value", async () => {
      const { subject, page } = await renderSection({}, { businessStartDate: "" });
      expect(subject.getByLabelText("Business start date")).toBeInTheDocument();
      await page.submitBusinessTab();
      expect(currentUserData().formationData.formationFormData.businessStartDate).toEqual(
        getCurrentDateFormatted("YYYY-MM-DD")
      );
    });

    it("resets date on initial load", async () => {
      const { subject } = await renderSection(
        {},
        {
          businessStartDate: getCurrentDate().subtract(1, "day").format("YYYY-MM-DD"),
        }
      );

      expect(subject.getByLabelText("Business start date")).toHaveValue(
        getCurrentDateFormatted("MM/DD/YYYY")
      );
    });

    it("validates date on submit", async () => {
      const { subject, page } = await renderSection({}, {});
      page.selectDate(getCurrentDate().subtract(4, "day"));
      await page.submitBusinessTab(false);
      expect(subject.getByText(Config.businessFormationDefaults.startDateErrorText)).toBeInTheDocument();
      expect(
        subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).toBeInTheDocument();
    });
  });

  describe("profile data information", () => {
    it("displays legal structure from profile data", async () => {
      const { subject } = await renderSection({}, {});
      const displayLegalStructure = subject.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.llcText);
    });

    it("displays business name from name check section and overrides profile", async () => {
      const { subject, page } = await renderSection({ businessName: "some cool name" }, {});

      fireEvent.click(subject.getByText(Config.businessFormationDefaults.previousButtonText));
      await page.submitBusinessNameTab("another cool name");

      expect(subject.getByText("another cool name", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("some cool name", { exact: false })).not.toBeInTheDocument();

      expect(
        subject.queryByText(Config.businessFormationDefaults.notSetBusinessNameText, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("displays City (Main Business Address) from profile data", async () => {
      const { subject } = await renderSection(
        { municipality: generateMunicipality({ displayName: "Newark" }) },
        {}
      );
      expect((subject.getByLabelText("Business address city") as HTMLInputElement).value).toEqual("Newark");

      expect(
        subject.queryByText(Config.businessFormationDefaults.notSetBusinessAddressCityLabel, {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe("required fields", () => {
    it("Business suffix", async () => {
      const { subject, page } = await renderSection({}, { businessSuffix: undefined });
      await page.submitBusinessTab(false);
      expect(subject.getByRole("alert")).toHaveTextContent(/Business suffix/);
    });

    it("Business address line1", async () => {
      const { subject, page } = await renderSection({}, { businessAddressLine1: "" });
      await page.submitBusinessTab(false);
      expect(subject.getByRole("alert")).toHaveTextContent(/Business address line1/);
    });

    it("Business address zip code", async () => {
      const { subject, page } = await renderSection({}, { businessAddressZipCode: "" });
      await page.submitBusinessTab(false);
      expect(subject.getByRole("alert")).toHaveTextContent(/Business address zip code/);
    });

    it("does not require business address line 2", async () => {
      const { page } = await renderSection({}, { businessAddressLine2: "" });
      await page.submitBusinessTab();
      expect(userDataUpdatedNTimes()).toEqual(2);
    });
  });
});
