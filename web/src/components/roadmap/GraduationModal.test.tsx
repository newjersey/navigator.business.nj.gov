import { GraduationModal } from "@/components/roadmap/GraduationModal";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateProfileData,
  generateTaxFilingData,
  generateUserData,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import { UserData } from "@businessnjgovnavigator/shared/";
import { getCurrentDate, parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { LookupOwnershipTypeById } from "@businessnjgovnavigator/shared/ownership";
import { LookupSectorTypeById } from "@businessnjgovnavigator/shared/sector";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const submitGraduationModal = (): void => {
  fireEvent.click(screen.getByText(Config.roadmapDefaults.graduationModalContinueButtonText));
};

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postGetAnnualFilings: jest.fn(),
}));

describe("Graduation Modal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRouter({});
    setupStatefulUserDataContext();
    mockApi.postGetAnnualFilings.mockImplementation((request) => Promise.resolve(request));
  });

  const renderGraduationModal = (userData: UserData) => {
    render(
      <WithStatefulUserData initialUserData={userData}>
        <GraduationModal open={true} handleClose={() => {}} />
      </WithStatefulUserData>
    );
    const page = createPageHelpers();
    return { page };
  };

  it("switches user to oscar and sends to dashboard", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation: undefined,
        sectorId: undefined,
        industryId: "generic",
        ownershipTypeIds: [],
        existingEmployees: undefined,
      }),
    });

    const { page } = renderGraduationModal(userData);

    const date = getCurrentDate().subtract(1, "month").date(1);
    const dateOfFormation = date.format("YYYY-MM-DD");

    expect(screen.getByTestId("graduation-modal")).toBeInTheDocument();
    page.fillText("Business name", "A Clean Business");
    page.selectDate("Date of formation", date);
    page.selectByValue("Sector", "clean-energy");
    page.selectByValue("Ownership", "veteran-owned");
    page.fillText("Existing employees", "1234567");
    expect(screen.getByText(Config.roadmapDefaults.graduationModalContinueButtonText)).toBeInTheDocument();
    submitGraduationModal();

    await waitFor(() => {
      expect(currentUserData()).toEqual({
        ...userData,
        profileData: {
          ...userData.profileData,
          businessName: "A Clean Business",
          dateOfFormation,
          sectorId: "clean-energy",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
          businessPersona: "OWNING",
        },
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("pre-populates fields with data from profile", async () => {
    const date = getCurrentDate().subtract(1, "month").date(1);
    const dateOfFormation = date.format("YYYY-MM-DD");
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "limited-liability-partnership",
        businessName: "A Test Business",
        dateOfFormation,
        sectorId: "clean-energy",
        industryId: "generic",
        ownershipTypeIds: ["veteran-owned"],
        existingEmployees: "1234567",
      }),
    });

    const { page } = renderGraduationModal(userData);

    expect((screen.getByLabelText("Business name") as HTMLInputElement).value).toEqual("A Test Business");
    expect(page.getDateOfFormationValue()).toEqual(date.format("MM/YYYY"));
    expect(page.getSectorIDValue()).toEqual(LookupSectorTypeById("clean-energy").name);
    expect(screen.queryByLabelText("Ownership")).toHaveTextContent(
      `${LookupOwnershipTypeById("veteran-owned").name}`
    );
    expect((screen.getByLabelText("Existing employees") as HTMLInputElement).value).toEqual("1234567");

    submitGraduationModal();

    await waitFor(() => {
      expect(currentUserData()).toEqual({
        ...userData,
        profileData: {
          ...userData.profileData,
          dateOfFormation,
          businessName: "A Test Business",
          sectorId: "clean-energy",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
          businessPersona: "OWNING",
        },
      });
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("updates filing data", async () => {
    const taxData = generateTaxFilingData({});
    mockApi.postGetAnnualFilings.mockImplementation((userData) =>
      Promise.resolve({ ...userData, taxFilingData: { ...taxData, filings: [] } })
    );
    const date = getCurrentDate().subtract(1, "month").date(1);
    const dateOfFormation = date.format("YYYY-MM-DD");
    const userData = generateUserData({
      taxFilingData: taxData,
      profileData: generateProfileData({
        businessPersona: "OWNING",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation,
        sectorId: "clean-energy",
        industryId: "generic",
        ownershipTypeIds: ["veteran-owned"],
        existingEmployees: "1234567",
      }),
    });

    renderGraduationModal(userData);
    submitGraduationModal();

    await waitFor(() => {
      expect(currentUserData()).toEqual({
        ...userData,
        taxFilingData: { ...taxData, filings: [] },
      });
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("shows sector for generic industry", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: "generic",
        businessPersona: "STARTING",
        sectorId: undefined,
      }),
    });

    renderGraduationModal(userData);

    expect((screen.queryByLabelText("Sector") as HTMLInputElement)?.value).toEqual("Other Services");
  });

  it("does not show sector for non-generic industry", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: "restaurant",
        businessPersona: "STARTING",
        sectorId: undefined,
      }),
    });

    renderGraduationModal(userData);

    expect(screen.queryByLabelText("Sector")).not.toBeInTheDocument();
  });

  it("fires validations when clicking submit", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation: undefined,
        sectorId: undefined,
        industryId: undefined,
        ownershipTypeIds: [],
        existingEmployees: undefined,
      }),
    });

    renderGraduationModal(userData);
    submitGraduationModal();
    expect(userDataWasNotUpdated()).toEqual(true);
    expect(mockPush).not.toHaveBeenCalledWith("/dashboard");
    expect(screen.getByText(Config.profileDefaults.OWNING.dateOfFormation.errorText)).toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults.OWNING.sectorId.errorTextRequired)).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.OWNING.existingEmployees.errorTextRequired)
    ).toBeInTheDocument();
  });

  it("hides date of formation if legal structure does not require public filing", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "general-partnership",
      }),
    });

    renderGraduationModal(userData);

    expect(screen.getByTestId("graduation-modal")).toBeInTheDocument();
    expect(screen.queryByLabelText("Date of formation")).not.toBeInTheDocument();
  });

  it("disables date of formation if formation getFiling success", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
      }),
      formationData: generateFormationData({
        getFilingResponse: generateGetFilingResponse({
          success: true,
        }),
      }),
    });

    const { page } = renderGraduationModal(userData);
    expect(screen.getByLabelText("Date of formation")).toBeDisabled();
    expect(page.getDateOfFormationValue()).toEqual(
      parseDateWithFormat(userData.formationData.formationFormData.businessStartDate, "YYYY-MM-DD").format(
        "MM/YYYY"
      )
    );
  });

  it("does not display businessName if formation getFiling success", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        businessName: "A Test Business 2",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
      }),
      formationData: generateFormationData({
        getFilingResponse: generateGetFilingResponse({
          success: true,
        }),
      }),
    });

    renderGraduationModal(userData);
    expect(screen.queryByTestId("businessName")).not.toBeInTheDocument();
  });

  it("display businessName if formation is not set", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        businessName: "A Test Business 2",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
      }),
    });

    renderGraduationModal(userData);
    expect(screen.getByTestId("businessName")).toBeInTheDocument();
    expect(screen.getByLabelText("Business name")).toBeInTheDocument();
  });
});
