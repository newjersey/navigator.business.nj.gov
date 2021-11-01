import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import React from "react";
import Onboarding from "@/pages/onboarding";
import {
  generateMunicipality,
  generateProfileData as generateProfileData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  createEmptyProfileDisplayContent as createEmptyProfileDisplayContent,
  createEmptyUserData,
  ProfileDisplayContent,
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
import { Municipality } from "@businessnjgovnavigator/shared";

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

describe("onboarding", () => {
  let subject: RenderResult;
  let emptyUserData: UserData;

  beforeEach(() => {
    jest.resetAllMocks();
    emptyUserData = createEmptyUserData(generateUser({}));
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const renderPage = ({
    municipalities,
    displayContent,
    userData,
  }: {
    municipalities?: Municipality[];
    displayContent?: ProfileDisplayContent;
    userData?: UserData;
  }): RenderResult => {
    return render(
      <WithStatefulUserData initialUserData={userData || emptyUserData}>
        <Onboarding
          displayContent={displayContent || createEmptyProfileDisplayContent()}
          municipalities={municipalities || []}
        />
      </WithStatefulUserData>
    );
  };

  it("changes url pathname every time a user goes to a different page", async () => {
    subject = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();

    await visitStep2();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-2")).toBeInTheDocument();

    await visitStep3();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
    chooseRadio("general-partnership");

    await visitStep4();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
  });

  it("displays the specific page when directly visited by a user", async () => {
    useMockRouter({ isReady: true, query: { page: "3" } });
    subject = renderPage({});
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
  });

  it("displays page one when a user goes to /onboarding", async () => {
    mockRouter.mockQuery.mockReturnValue({});
    subject = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number above the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "5" } });
    subject = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number below the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "0" } });
    subject = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessName: "Applebees",
        industryId: "cosmetology",
        legalStructureId: "c-corporation",
        municipality: generateMunicipality({
          displayName: "Newark",
        }),
      }),
    });

    subject = renderPage({ userData });
    expect(getBusinessNameValue()).toEqual("Applebees");

    await visitStep2();
    expect(getIndustryValue()).toEqual("cosmetology");

    await visitStep3();
    expect(getLegalStructureValue()).toEqual("c-corporation");

    await visitStep4();
    expect(getMunicipalityValue()).toEqual("Newark");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    subject = renderPage({ userData: initialUserData, municipalities: [newark] });

    fillText("Business name", "Cool Computers");
    await visitStep2();
    expect(currentUserData().profileData.businessName).toEqual("Cool Computers");

    selectByValue("Industry", "e-commerce");
    await visitStep3();
    expect(currentUserData().profileData.industryId).toEqual("e-commerce");
    expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);

    chooseRadio("general-partnership");
    await visitStep4();
    expect(currentUserData().profileData.legalStructureId).toEqual("general-partnership");

    selectByText("Location", "Newark");
    clickNext();
    await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
    expect(currentUserData()).toEqual({
      ...initialUserData,
      formProgress: "COMPLETED",
      profileData: {
        ...initialUserData.profileData,
        businessName: "Cool Computers",
        industryId: "e-commerce",
        homeBasedBusiness: true,
        legalStructureId: "general-partnership",
        municipality: newark,
      },
    });
  });

  it("builds and sets roadmap after each step", async () => {
    const profileData = generateProfileData({});
    const mockSetRoadmap = jest.fn();

    subject = render(
      withRoadmap(
        <WithStatefulUserData initialUserData={generateUserData({ profileData: profileData })}>
          <Onboarding displayContent={createEmptyProfileDisplayContent()} municipalities={[]} />
        </WithStatefulUserData>,
        undefined,
        undefined,
        mockSetRoadmap
      )
    );

    await visitStep2();
    expect(mockSetRoadmap).toHaveBeenCalledTimes(1);
    await visitStep3();
    expect(mockSetRoadmap).toHaveBeenCalledTimes(2);
    await visitStep4();
    expect(mockSetRoadmap).toHaveBeenCalledTimes(3);

    clickNext();
    await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(4));
  });

  it("prevents user from moving after Step 3 if you have not selected a legal structure", async () => {
    subject = renderPage({});
    await visitStep2();
    await visitStep3();
    clickNext();
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    chooseRadio("general-partnership");
    await visitStep4();
    expect(subject.queryByTestId("error-alert-REQUIRED_MUNICIPALITY")).not.toBeInTheDocument();
  });

  it("prevents user from moving after Step 4 if you have not selected a location", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    subject = renderPage({ municipalities: [newark] });

    await visitStep2();
    await visitStep3();
    chooseRadio("general-partnership");
    await visitStep4();
    clickNext();
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_MUNICIPALITY")).toBeInTheDocument();
    selectByText("Location", "Newark");
    clickNext();
    await waitFor(() =>
      expect(subject.queryByTestId("error-alert-REQUIRED_MUNICIPALITY")).not.toBeInTheDocument()
    );
  });

  it("removes required fields error when user goes back", async () => {
    subject = renderPage({});
    await visitStep2();
    await visitStep3();
    clickNext();
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    clickBack();
    expect(subject.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
  });

  it("is able to go back", async () => {
    subject = renderPage({});
    fillText("Business name", "Cool Computers");
    await visitStep2();
    clickBack();
    expect(subject.queryByLabelText("Business name")).toBeVisible();
  });

  it("displays industry-specific content for home contractors when selected", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificHomeContractorMd = "Learn more about home contractors!";

    subject = renderPage({ displayContent });
    await visitStep2();

    expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
    selectByValue("Industry", "home-contractor");
    expect(subject.queryByText("Learn more about home contractors!")).toBeInTheDocument();

    await waitFor(() => {
      selectByValue("Industry", "e-commerce");
      expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
    });
  });

  it("displays industry-specific content for employment agency when selected", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificEmploymentAgencyMd = "Learn more about employment agencies!";

    subject = renderPage({ displayContent });
    await visitStep2();

    expect(subject.queryByText("Learn more about employment agencies!")).not.toBeInTheDocument();
    selectByValue("Industry", "employment-agency");
    expect(subject.queryByText("Learn more about employment agencies!")).toBeInTheDocument();

    await waitFor(() => {
      selectByValue("Industry", "e-commerce");
      expect(subject.queryByText("Learn more about employment agencies!")).not.toBeInTheDocument();
    });
  });

  it("displays liquor license question for restaurants when selected", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificLiquorQuestion = {
      contentMd: "Do you need a liquor license?",
      radioButtonYesText: "Yeah",
      radioButtonNoText: "Nah",
    };

    subject = renderPage({ displayContent });
    await visitStep2();

    expect(subject.queryByText("Do you need a liquor license?")).not.toBeInTheDocument();
    selectByValue("Industry", "restaurant");
    expect(subject.queryByText("Do you need a liquor license?")).toBeInTheDocument();
    chooseRadio("true");
    await visitStep3();

    expect(currentUserData().profileData.liquorLicense).toEqual(true);
  });

  it("displays home-based business question for applicable industries on municipality page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const displayContent = createEmptyProfileDisplayContent();

    displayContent.industry.specificHomeBasedBusinessQuestion = {
      contentMd: "Are you a home-based business?",
      radioButtonYesText: "Yeah",
      radioButtonNoText: "Nah",
    };

    subject = renderPage({ displayContent, municipalities: [newark] });
    await visitStep2();
    selectByValue("Industry", "home-contractor");
    await visitStep3();
    chooseRadio("general-partnership");
    await visitStep4();
    selectByText("Location", "Newark");

    expect(subject.queryByText("Are you a home-based business?")).toBeInTheDocument();
    chooseRadio("true");

    clickNext();
    await waitFor(() => expect(currentUserData().profileData.homeBasedBusiness).toEqual(true));
  });

  it("does not display home-based business question for non-applicable industries", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificHomeBasedBusinessQuestion.contentMd = "Are you a home-based business?";

    subject = renderPage({ displayContent });
    await visitStep2();
    selectByValue("Industry", "restaurant");
    await visitStep3();
    chooseRadio("general-partnership");
    await visitStep4();

    expect(subject.queryByText("Are you a home-based business?")).not.toBeInTheDocument();
  });

  it("sets liquor license back to false if they select a different industry", async () => {
    subject = renderPage({});
    await visitStep2();
    selectByValue("Industry", "restaurant");
    chooseRadio("true");
    await visitStep3();
    expect(currentUserData().profileData.liquorLicense).toEqual(true);

    clickBack();
    selectByValue("Industry", "cosmetology");
    await visitStep3();
    expect(currentUserData().profileData.liquorLicense).toEqual(false);
  });

  describe("updates to industry affecting home-based business", () => {
    it("sets home-based business back to false if they select a non-applicable industry", async () => {
      subject = renderPage({});
      await selectInitialIndustry("home-contractor");
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
      await reselectNewIndustry("restaurant");
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
    });

    it("sets home-based business back to true if they select an applicable industry", async () => {
      subject = renderPage({});
      await selectInitialIndustry("restaurant");
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
      await reselectNewIndustry("e-commerce");
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
    });

    it("keeps home-based business value if they select a different but still applicable industry", async () => {
      subject = renderPage({});
      await selectInitialIndustry("e-commerce");
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
      await selectHomeBasedBusiness("false");
      await reselectNewIndustry("home-contractor");
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
    });

    const selectInitialIndustry = async (industry: string): Promise<void> => {
      await visitStep2();
      selectByValue("Industry", industry);
      await visitStep3();
      chooseRadio("general-partnership");
    };

    const selectHomeBasedBusiness = async (value: string): Promise<void> => {
      await visitStep4();
      chooseRadio(value);
      clickBack();
    };

    const reselectNewIndustry = async (industry: string): Promise<void> => {
      clickBack();
      selectByValue("Industry", industry);
      await visitStep3();
    };
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

  const chooseRadio = (value: string) => {
    fireEvent.click(subject.getByTestId(value));
  };

  const clickNext = (): void => {
    fireEvent.click(subject.getAllByTestId("next")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getAllByTestId("back")[0]);
  };

  const getBusinessNameValue = (): string =>
    (subject.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getIndustryValue = (): string => (subject.queryByTestId("industryid") as HTMLInputElement)?.value;

  const getLegalStructureValue = (): string => {
    const checked = subject.container.querySelector(".Mui-checked input") as HTMLInputElement;
    return checked.value as string;
  };

  const getMunicipalityValue = (): string =>
    (subject.queryByTestId("municipality") as HTMLInputElement)?.value;

  const visitStep2 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-1"));
  };

  const visitStep3 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-2"));
  };

  const visitStep4 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-3"));
  };
});
