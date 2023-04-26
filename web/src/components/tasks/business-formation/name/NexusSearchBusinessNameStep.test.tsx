import { NexusSearchBusinessNameStep } from "@/components/tasks/business-formation/name/NexusSearchBusinessNameStep";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { generateProfileData, generateUserData } from "@/test/factories";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import {
  dbaInputField,
  fillText,
  mockSearchReturnValue,
  searchAndGetValue,
} from "@/test/helpers/helpersSearchBusinessName";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared/index";
import { generateFormationData } from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ searchBusinessName: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const Config = getMergedConfig();

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      business_formation_search_existing_name_again: {
        click: {
          refresh_name_search_field: jest.fn(),
        },
      },
      business_formation_dba_name_search_field: {
        appears: {
          dba_name_search_field_appears: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<NexusSearchBusinessNameStep />", () => {
  const initialUserData = generateUserData({
    formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    profileData: generateProfileData({
      businessName: "",
      nexusDbaName: "",
      needsNexusDbaName: false,
    }),
  });

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const renderTask = (userData?: UserData): void => {
    render(
      <WithStatefulUserData initialUserData={userData || initialUserData}>
        <NexusSearchBusinessNameStep />
      </WithStatefulUserData>
    );
  };

  it("lets you click to search again when unavailable", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(screen.queryByLabelText("Search business name")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    expect(
      mockAnalytics.event.business_formation_search_existing_name_again.click.refresh_name_search_field
    ).toHaveBeenCalled();
    expect(screen.getByLabelText("Search business name")).toBeInTheDocument();
  });

  it("sets nexusDbaName as empty and needsDbaName as false in profile when search again comes back as available", async () => {
    renderTask();
    fillText("some unavailable name");
    await searchAndGetValue({ status: "UNAVAILABLE" });

    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    fillText("My Cool Business");
    await searchAndGetValue({ status: "AVAILABLE" });

    expect(currentUserData().profileData.nexusDbaName).toEqual("");
    expect(currentUserData().profileData.needsNexusDbaName).toEqual(false);
    expect(currentUserData().profileData.businessName).toEqual("My Cool Business");
  });

  it("sets businessName in formationFormData on submit", async () => {
    renderTask();
    fillText("some unavailable name");
    await searchAndGetValue({ status: "UNAVAILABLE" });

    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    fillText("My Cool Business");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(currentUserData().formationData.formationFormData.businessName).toEqual("My Cool Business");
  });

  it("sets needsDbaName in profile to true when unavailable", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(currentUserData().profileData.nexusDbaName).toEqual("");
    expect(currentUserData().profileData.needsNexusDbaName).toEqual(true);
    expect(currentUserData().profileData.businessName).toEqual("My Cool Business");
  });

  it("does not save business name if designator error", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "DESIGNATOR_ERROR" });
    expect(userDataWasNotUpdated()).toEqual(true);
  });

  it("shows DBA name when unavailable", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(screen.getByText(markdownToText(Config.nexusNameSearch.dbaNameHeader))).toBeInTheDocument();
    expect(screen.getByText(Config.nexusNameSearch.dbaNameSearchSubmitButton)).toBeInTheDocument();
    expect(
      mockAnalytics.event.business_formation_dba_name_search_field.appears.dba_name_search_field_appears
    ).toHaveBeenCalled();
  });

  it("shows DBA search immediately if needsDbaName is true", async () => {
    useMockUserData({
      profileData: generateProfileData({
        businessName: "some cool name",
        needsNexusDbaName: true,
      }),
    });
    mockSearchReturnValue({ status: "UNAVAILABLE" });
    renderTask();
    await waitFor(() => {
      expect(screen.getByText(markdownToText(Config.nexusNameSearch.dbaNameHeader))).toBeInTheDocument();
    });
  });

  it("does not show DBA search immediately if it is needsNexusDbaName is false in profile", () => {
    useMockUserData({
      profileData: generateProfileData({
        businessName: "some cool name",
        needsNexusDbaName: false,
      }),
    });
    renderTask();
    expect(screen.queryByText(markdownToText(Config.nexusNameSearch.dbaNameHeader))).not.toBeInTheDocument();
  });

  it("does not overwrite existing DBA name when doing initial search", async () => {
    useMockUserData({
      profileData: generateProfileData({
        businessName: "some cool name",
        nexusDbaName: "existing dba name",
        needsNexusDbaName: true,
      }),
    });
    mockSearchReturnValue({ status: "UNAVAILABLE" });
    renderTask();
    await waitFor(() => {
      expect((dbaInputField() as HTMLInputElement).value).toEqual("existing dba name");
    });
  });

  describe("on DBA search", () => {
    const setupForDBA = async (): Promise<void> => {
      renderTask();
      fillText("My Cool Business");
      await searchAndGetValue({ status: "UNAVAILABLE" });
    };

    it("saves DBA name to profile on successful search", async () => {
      await setupForDBA();
      fillText("My Cool DBA Name", { dba: true });
      await searchAndGetValue({ status: "AVAILABLE" }, { dba: true });
      expect(currentUserData().profileData.nexusDbaName).toEqual("My Cool DBA Name");
    });

    it("does not save DBA name to profile on unsuccessful search", async () => {
      await setupForDBA();
      fillText("My Cool DBA Name", { dba: true });
      await searchAndGetValue({ status: "UNAVAILABLE" }, { dba: true });
      expect(currentUserData().profileData.nexusDbaName).toEqual("");
    });
  });
});
