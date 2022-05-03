import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateUserData,
} from "@/test/factories";
import {
  generateLLCProfileData,
  RenderedTask,
  renderTask,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { FormationFormData, ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent } from "@testing-library/react";

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
  ): Promise<RenderedTask> => {
    const profileData = generateLLCProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const renderedTask = renderTask(
      generateUserData({
        profileData,
        formationData,
      }),
      generateFormationDisplayContent({})
    );

    await renderedTask.page.submitBusinessNameTab();
    await renderedTask.page.submitBusinessTab();
    await renderedTask.page.submitContactsTab();
    return renderedTask;
  };

  it("displays the first tab when the edit button in the main business section is clicked", async () => {
    const { subject } = await renderSection({}, {});
    fireEvent.click(subject.getByTestId("edit-business-name-section"));
    expect(subject.queryByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the first tab when the edit button in the location section is clicked", async () => {
    const { subject } = await renderSection({}, {});
    fireEvent.click(subject.getByTestId("edit-location-section"));
    expect(subject.queryByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the second tab when the edit button in the registered agent section is clicked", async () => {
    const { subject } = await renderSection({}, {});
    fireEvent.click(subject.getByTestId("edit-registered-agent-section"));
    expect(subject.queryByTestId("business-section")).toBeInTheDocument();
  });

  it("displays the second tab when the edit button in the signatures section is clicked", async () => {
    const { subject } = await renderSection({}, {});
    fireEvent.click(subject.getByTestId("edit-signature-section"));
    expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
  });

  it("displays the second tab when the edit button in the members section is clicked", async () => {
    const { subject } = await renderSection({}, {});
    fireEvent.click(subject.getByTestId("edit-members-section"));
    expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
  });

  it("displays agent number on review tab", async () => {
    const { subject } = await renderSection({}, { agentNumberOrManual: "NUMBER" });
    expect(subject.getByTestId("agent-number")).toBeInTheDocument();
    expect(subject.queryByTestId("agent-manual-entry")).not.toBeInTheDocument();
  });

  it("displays manually entered registered agent info on review tab", async () => {
    const { subject } = await renderSection({}, { agentNumberOrManual: "MANUAL_ENTRY" });
    expect(subject.queryByTestId("agent-number")).not.toBeInTheDocument();
    expect(subject.getByTestId("agent-manual-entry")).toBeInTheDocument();
  });

  it("does not display members section within review tab when members do not exist", async () => {
    const { subject } = await renderSection({}, { members: [] });
    expect(subject.queryByTestId("edit-members-section")).not.toBeInTheDocument();
  });
});
