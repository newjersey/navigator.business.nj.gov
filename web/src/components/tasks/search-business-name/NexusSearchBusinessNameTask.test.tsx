import { NexusSearchBusinessNameTask } from "@/components/tasks/search-business-name/NexusSearchBusinessNameTask";
import { getMergedConfig } from "@/contexts/configContext";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
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
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ searchBusinessName: jest.fn() }));

const Config = getMergedConfig();

describe("<NexusSearchBusinessNameTask />", () => {
  const initialUserData = generateUserData({
    profileData: generateProfileData({
      businessName: "",
      nexusDbaName: undefined,
    }),
  });

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const renderTask = (userData?: UserData) => {
    render(
      <WithStatefulUserData initialUserData={userData || initialUserData}>
        <NexusSearchBusinessNameTask task={generateTask({})} />
      </WithStatefulUserData>
    );
  };

  it("lets you click to search again when unavailable", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(screen.queryByLabelText("Search business name")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    expect(screen.getByLabelText("Search business name")).toBeInTheDocument();
  });

  it("sets DBA name in profile as undefined when search again comes back as available", async () => {
    renderTask();
    fillText("some unavailable name");
    await searchAndGetValue({ status: "UNAVAILABLE" });

    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    fillText("My Cool Business");
    await searchAndGetValue({ status: "AVAILABLE" });

    expect(currentUserData().profileData.nexusDbaName).toBeUndefined();
    expect(currentUserData().profileData.businessName).toEqual("My Cool Business");
  });

  it("sets DBA name in profile to empty when unavailable", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(currentUserData().profileData.nexusDbaName).toEqual("");
    expect(currentUserData().profileData.businessName).toEqual("My Cool Business");
  });

  it("does not save business name if designator error", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "DESIGNATOR" });
    expect(userDataWasNotUpdated()).toEqual(true);
  });

  it("shows DBA name when unavailable", async () => {
    renderTask();
    fillText("My Cool Business");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(screen.getByText(markdownToText(Config.nexusNameSearch.dbaNameHeader))).toBeInTheDocument();
    expect(screen.getByPlaceholderText(Config.nexusNameSearch.dbaNameSearchPlaceholder)).toBeInTheDocument();
    expect(screen.getByText(Config.nexusNameSearch.dbaNameSearchSubmitButton)).toBeInTheDocument();
  });

  it("shows DBA search immediately if it is not undefined in profile", async () => {
    useMockUserData({
      profileData: generateProfileData({
        businessName: "some cool name",
        nexusDbaName: "",
      }),
    });
    mockSearchReturnValue({ status: "UNAVAILABLE" });
    renderTask();
    await waitFor(() => {
      expect(screen.getByText(markdownToText(Config.nexusNameSearch.dbaNameHeader))).toBeInTheDocument();
    });
  });

  it("does not show DBA search immediately if it is undefined in profile", () => {
    useMockUserData({
      profileData: generateProfileData({
        businessName: "some cool name",
        nexusDbaName: undefined,
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
      }),
    });
    mockSearchReturnValue({ status: "UNAVAILABLE" });
    renderTask();
    await waitFor(() => {
      expect((dbaInputField() as HTMLInputElement).value).toEqual("existing dba name");
    });
  });

  describe("on DBA search", () => {
    const setupForDBA = async () => {
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
