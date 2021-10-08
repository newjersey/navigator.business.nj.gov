import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import React from "react";
import Profile from "@/pages/profile";
import {
  generateMunicipality,
  generateOnboardingData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  createEmptyOnboardingDisplayContent,
  createEmptyUserData,
  Industry,
  LegalStructure,
  Municipality,
  OnboardingDisplayContent,
  UserData,
} from "@/lib/types/types";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { withRoadmap } from "@/test/helpers";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { ProfileDefaults } from "@/display-content/ProfileDefaults";

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

describe("profile", () => {
  let subject: RenderResult;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const renderPage = ({
    municipalities,
    displayContent,
    userData,
  }: {
    municipalities?: Municipality[];
    displayContent?: OnboardingDisplayContent;
    userData?: UserData;
  }): RenderResult => {
    const genericTown =
      userData && userData.onboardingData.municipality
        ? userData.onboardingData.municipality
        : generateMunicipality({ displayName: "GenericTown" });
    return render(
      <WithStatefulUserData
        initialUserData={
          userData ||
          generateUserData({ onboardingData: generateOnboardingData({ municipality: genericTown }) })
        }
      >
        <Profile
          displayContent={displayContent || createEmptyOnboardingDisplayContent()}
          municipalities={municipalities ? [genericTown, ...municipalities] : [genericTown]}
        />
      </WithStatefulUserData>
    );
  };

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      onboardingData: generateOnboardingData({
        businessName: "Applebees",
        industry: "cosmetology",
        legalStructure: "c-corporation",
        municipality: generateMunicipality({
          displayName: "Newark",
        }),
      }),
    });

    subject = renderPage({ userData });
    expect(getBusinessNameValue()).toEqual("Applebees");

    expect(getIndustryValue()).toEqual("cosmetology");

    expect(getLegalStructureValue()).toEqual("c-corporation");

    expect(getMunicipalityValue()).toEqual("Newark");
  });

  it("user is able to save and stays on the page", async () => {
    subject = renderPage({});
    fillText("Business name", "Cool Computers");
    clickSave();
    await waitFor(() => expect(subject.getByTestId("toast-alert-SUCCESS")).toBeInTheDocument());
    await waitFor(() => expect(currentUserData()));
    await waitForElementToBeRemoved(() => subject.getByTestId("toast-alert-SUCCESS"), { timeout: 3000 });
    fillText("Business name", "Cool Computers2");
  });

  it("updates the user data on save", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    subject = renderPage({ userData: initialUserData, municipalities: [newark] });
    fillText("Business name", "Cool Computers");
    selectByText("Location", newark.displayName);
    selectByValue("Industry", "e-commerce");
    selectByValue("Legal structure", "general-partnership");
    clickSave();
    await waitFor(() => expect(subject.getByTestId("toast-alert-SUCCESS")).toBeInTheDocument());
    await waitFor(() =>
      expect(currentUserData()).toEqual({
        ...initialUserData,
        formProgress: "COMPLETED",
        onboardingData: {
          ...initialUserData.onboardingData,
          businessName: "Cool Computers",
          industry: "e-commerce",
          homeBasedBusiness: true,
          legalStructure: "general-partnership",
          municipality: newark,
        },
      })
    );
  });

  it("builds and sets roadmap on save", async () => {
    const onboardingData = generateOnboardingData({});
    const mockSetRoadmap = jest.fn();

    subject = render(
      withRoadmap(
        <WithStatefulUserData initialUserData={generateUserData({ onboardingData })}>
          <Profile displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
        </WithStatefulUserData>,
        undefined,
        mockSetRoadmap
      )
    );
    clickSave();
    await waitFor(() => expect(currentUserData()));
    await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(1));
  });

  it("prevents user from saving if they have not selected a location", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    subject = renderPage({ municipalities: [newark] });
    fillText("Location", "");
    clickSave();
    expect(subject.getByTestId("error-alert-REQUIRED_MUNICIPALITY")).toBeInTheDocument();
    selectByText("Location", newark.displayName);
    await waitFor(() =>
      expect(subject.queryByTestId("error-alert-REQUIRED_MUNICIPALITY")).not.toBeInTheDocument()
    );
  });

  it("user is able to go back to roadmap", async () => {
    subject = renderPage({});
    clickBack();
    await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
  });

  it("prevents user from going back to roadmap if there are unsaved changes", async () => {
    subject = renderPage({});
    fillText("Business name", "Cool Computers");
    clickBack();
    expect(subject.getByText(ProfileDefaults.escapeModalReturn)).toBeInTheDocument();
  });

  it("returns user to profile page from un-saved changes modal", async () => {
    subject = renderPage({});
    fillText("Business name", "Cool Computers");
    clickBack();
    fireEvent.click(subject.getByText(ProfileDefaults.escapeModalEscape));
    fillText("Business name", "Cool Computers2");
  });

  it("returns user to roadmap from un-saved changes modal", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    subject = renderPage({ userData: initialUserData, municipalities: [newark] });
    selectByText("Location", newark.displayName);
    clickBack();
    fireEvent.click(subject.getByText(ProfileDefaults.escapeModalReturn));
    await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
    await waitFor(() => expect(() => currentUserData()).toThrowError());
  });

  const fillText = (label: string, value: string) => {
    fireEvent.change(subject.getByLabelText(label), { target: { value: value } });
  };

  const selectByValue = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const clickSave = (): void => {
    fireEvent.click(subject.getAllByTestId("save")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getAllByTestId("back")[0]);
  };

  const getBusinessNameValue = (): string =>
    (subject.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getIndustryValue = (): Industry =>
    (subject.queryByTestId("industry") as HTMLInputElement)?.value as Industry;

  const getMunicipalityValue = (): string =>
    (subject.queryByTestId("municipality") as HTMLInputElement)?.value;

  const getLegalStructureValue = (): LegalStructure =>
    (subject.queryByTestId("legal-structure") as HTMLInputElement)?.value as LegalStructure;
});
