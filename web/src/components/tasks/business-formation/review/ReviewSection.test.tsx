import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateUserData,
} from "@/test/factories";
import { generateLLCProfileData, preparePage, useSetupInitialMocks } from "@/test/helpers-formation";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFormData, ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";

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

describe("Formation - ReviewSection", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const renderSection = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>
  ) => {
    const profileData = generateLLCProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const page = preparePage(
      generateUserData({
        profileData,
        formationData,
      }),
      generateFormationDisplayContent({})
    );

    await page.submitBusinessNameTab();
    await page.submitBusinessTab();
    await page.submitContactsTab();
  };

  it("displays the first tab when the edit button in the main business section is clicked", async () => {
    await renderSection({}, {});
    fireEvent.click(screen.getByTestId("edit-business-name-section"));
    expect(screen.getByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the first tab when the edit button in the location section is clicked", async () => {
    await renderSection({}, {});
    fireEvent.click(screen.getByTestId("edit-location-section"));
    expect(screen.getByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the first tab when the edit button in the registered agent section is clicked", async () => {
    await renderSection({}, {});
    fireEvent.click(screen.getByTestId("edit-registered-agent-section"));
    expect(screen.getByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the first tab when the edit button in the business purpose section is clicked", async () => {
    await renderSection({}, { businessPurpose: "some purpose" });
    fireEvent.click(screen.getByTestId("edit-business-purpose"));
    expect(screen.getByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the first tab when the edit button in the provisions section is clicked", async () => {
    await renderSection({}, { provisions: ["some provision"] });
    fireEvent.click(screen.getByTestId("edit-provisions"));
    expect(screen.getByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the second tab when the edit button in the signatures section is clicked", async () => {
    await renderSection({}, {});
    fireEvent.click(screen.getByTestId("edit-signature-section"));
    expect(screen.getByTestId("contacts-section")).toBeInTheDocument();
  });

  it("displays the second tab when the edit button in the members section is clicked", async () => {
    await renderSection({}, {});
    fireEvent.click(screen.getByTestId("edit-members-section"));
    expect(screen.getByTestId("contacts-section")).toBeInTheDocument();
  });

  it("displays agent number on review tab", async () => {
    await renderSection({}, { agentNumberOrManual: "NUMBER" });
    expect(screen.getByTestId("agent-number")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-manual-entry")).not.toBeInTheDocument();
  });

  it("displays manually entered registered agent info on review tab", async () => {
    await renderSection({}, { agentNumberOrManual: "MANUAL_ENTRY" });
    expect(screen.queryByTestId("agent-number")).not.toBeInTheDocument();
    expect(screen.getByTestId("agent-manual-entry")).toBeInTheDocument();
  });

  it("does not display members section within review tab when members do not exist", async () => {
    await renderSection({}, { members: [] });
    expect(screen.queryByTestId("edit-members-section")).not.toBeInTheDocument();
  });

  it("displays business purpose on review tab", async () => {
    await renderSection({}, { businessPurpose: "some cool purpose" });
    expect(screen.getByTestId("business-purpose")).toBeInTheDocument();
    expect(screen.getByText("some cool purpose")).toBeInTheDocument();
  });

  it("does not display business purpose within review tab when purpose does not exist", async () => {
    await renderSection({}, { businessPurpose: "" });
    expect(screen.queryByTestId("business-purpose")).not.toBeInTheDocument();
  });

  it("displays provisions on review tab", async () => {
    await renderSection({}, { provisions: ["provision1", "provision2"] });
    expect(screen.getByTestId("provisions")).toBeInTheDocument();
    expect(screen.getByText("provision1")).toBeInTheDocument();
    expect(screen.getByText("provision2")).toBeInTheDocument();
    expect(
      screen.getAllByText(Config.businessFormationDefaults.reviewPageProvisionsSubheader, { exact: false })
    ).toHaveLength(2);
  });

  it("does not display provisions within review tab when they are empty", async () => {
    await renderSection({}, { provisions: [] });
    expect(screen.queryByTestId("provisions")).not.toBeInTheDocument();
  });
});
