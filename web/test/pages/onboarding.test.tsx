/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  act,
  fireEvent,
  render,
  RenderResult,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import React from "react";
import Onboarding from "@/pages/onboarding";
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
  UserData,
} from "@/lib/types/types";
import * as mockUseUserData from "@/test/mock/mockUseUserData";
import * as mockRouter from "@/test/mock/mockRouter";
import { mockUpdate, useMockUserData } from "@/test/mock/mockUseUserData";
import { useMockRouter } from "@/test/mock/mockRouter";
import { getLastCalledWith } from "@/test/helpers";

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("onboarding", () => {
  let subject: RenderResult;
  let emptyUserData: UserData;

  beforeEach(() => {
    jest.resetAllMocks();
    emptyUserData = createEmptyUserData(generateUser({}));
    useMockUserData(emptyUserData);
    useMockRouter({});
    mockUpdate.mockResolvedValue({});
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
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
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
  });

  it("displays page one when a user goes to /onboarding", async () => {
    mockRouter.mockQuery.mockReturnValue({});
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number above the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "5" } });
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number below the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "0" } });
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

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

    useMockUserData(userData);

    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
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
    const promise = Promise.resolve();
    mockUpdate.mockReturnValue(promise);
    useMockUserData(initialUserData);

    const newark = generateMunicipality({ displayName: "Newark" });

    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[newark]} />
    );

    fillText("Business name", "Cool Computers");
    await visitStep2();
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
      },
    });

    selectByValue("Industry", "e-commerce");
    await visitStep3();
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
        industry: "e-commerce",
        homeBasedBusiness: true,
      },
    });

    chooseRadio("general-partnership");
    await visitStep4();
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
        industry: "e-commerce",
        homeBasedBusiness: true,
        legalStructure: "general-partnership",
      },
    });

    selectByText("Location", "Newark");
    clickNext();
    await act(() => promise);
    expect(mockUpdate).toHaveBeenLastCalledWith({
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
    });
    expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("prevents user from moving after Step 3 if you have not selected a legal structure", async () => {
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
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
    const promise = Promise.resolve();
    mockUpdate.mockReturnValue(promise);

    const newark = generateMunicipality({ displayName: "Newark" });

    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[newark]} />
    );

    await visitStep2();
    await visitStep3();
    chooseRadio("general-partnership");
    await visitStep4();
    clickNext();
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_MUNICIPALITY")).toBeInTheDocument();
    selectByText("Location", "Newark");

    clickNext();
    await act(() => promise);
    expect(subject.queryByTestId("error-alert-REQUIRED_MUNICIPALITY")).not.toBeInTheDocument();
  });

  it("removes required fields error when user goes back", async () => {
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    await visitStep2();
    await visitStep3();
    clickNext();
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    clickBack();
    expect(subject.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
  });

  it("is able to go back", async () => {
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );

    fillText("Business name", "Cool Computers");
    await visitStep2();
    clickBack();
    expect(subject.queryByLabelText("Business name")).toBeVisible();
  });

  it("displays industry-specific content for home contractors when selected", async () => {
    const displayContent = createEmptyOnboardingDisplayContent();
    displayContent.industry.specificHomeContractorMd = "Learn more about home contractors!";

    subject = render(<Onboarding displayContent={displayContent} municipalities={[]} />);
    await visitStep2();

    expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
    selectByValue("Industry", "home-contractor");
    expect(subject.queryByText("Learn more about home contractors!")).toBeInTheDocument();
    selectByValue("Industry", "e-commerce");
    expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
  });

  it("displays liquor license question for restaurants when selected", async () => {
    const displayContent = createEmptyOnboardingDisplayContent();
    displayContent.industry.specificLiquorQuestion = {
      contentMd: "Do you need a liquor license?",
      radioButtonYesText: "Yeah",
      radioButtonNoText: "Nah",
    };

    subject = render(<Onboarding displayContent={displayContent} municipalities={[]} />);
    await visitStep2();

    expect(subject.queryByText("Do you need a liquor license?")).not.toBeInTheDocument();
    selectByValue("Industry", "restaurant");
    expect(subject.queryByText("Do you need a liquor license?")).toBeInTheDocument();
    chooseRadio("true");
    await visitStep3();

    expect(mockUseUserData.mockUpdate).toHaveBeenLastCalledWith({
      ...emptyUserData,
      onboardingData: {
        ...emptyUserData.onboardingData,
        industry: "restaurant",
        liquorLicense: true,
      },
    });
  });

  it("displays home-based business question for applicable industries on municipality page", async () => {
    const displayContent = createEmptyOnboardingDisplayContent();
    const promise = Promise.resolve();
    mockUpdate.mockReturnValue(promise);
    const newark = generateMunicipality({ displayName: "Newark" });

    displayContent.industry.specificHomeBasedBusinessQuestion = {
      contentMd: "Are you a home-based business?",
      radioButtonYesText: "Yeah",
      radioButtonNoText: "Nah",
    };

    subject = render(<Onboarding displayContent={displayContent} municipalities={[newark]} />);
    await visitStep2();

    selectByValue("Industry", "home-contractor");
    await visitStep3();
    chooseRadio("general-partnership");
    await visitStep4();
    selectByText("Location", "Newark");

    expect(subject.queryByText("Are you a home-based business?")).toBeInTheDocument();
    chooseRadio("true");

    clickNext();
    await act(() => promise);

    const updatedUserData = getLastCalledWith(mockUpdate)[0] as UserData;
    expect(updatedUserData.onboardingData.homeBasedBusiness).toEqual(true);
  });

  it("does not display home-based business question for non-applicable industries", async () => {
    const displayContent = createEmptyOnboardingDisplayContent();
    displayContent.industry.specificHomeBasedBusinessQuestion.contentMd = "Are you a home-based business?";

    subject = render(<Onboarding displayContent={displayContent} municipalities={[]} />);
    await visitStep2();
    selectByValue("Industry", "restaurant");
    await visitStep3();
    chooseRadio("general-partnership");
    await visitStep4();

    expect(subject.queryByText("Are you a home-based business?")).not.toBeInTheDocument();
  });

  it("sets liquor license back to false if they select a different industry", async () => {
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    await visitStep2();
    selectByValue("Industry", "restaurant");
    chooseRadio("true");

    selectByValue("Industry", "cosmetology");
    await visitStep3();

    expect(mockUseUserData.mockUpdate).toHaveBeenLastCalledWith({
      ...emptyUserData,
      onboardingData: {
        ...emptyUserData.onboardingData,
        industry: "cosmetology",
        liquorLicense: false,
      },
    });
  });

  describe("updates to industry affecting home-based business", () => {
    beforeEach(() => {
      useMockUserData(createEmptyUserData(generateUser({})));
      subject = render(
        <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
      );
    });

    it("sets home-based business back to false if they select a non-applicable industry", async () => {
      await selectInitialIndustry("home-contractor");
      expect(homeBasedBusinessValue()).toEqual(true);
      await reselectNewIndustry("restaurant");
      expect(homeBasedBusinessValue()).toEqual(false);
    });

    it("sets home-based business back to true if they select an applicable industry", async () => {
      await selectInitialIndustry("restaurant");
      expect(homeBasedBusinessValue()).toEqual(false);
      await reselectNewIndustry("e-commerce");
      expect(homeBasedBusinessValue()).toEqual(true);
    });

    it("keeps home-based business value if they select a different but still applicable industry", async () => {
      await selectInitialIndustry("e-commerce");
      expect(homeBasedBusinessValue()).toEqual(true);
      await selectHomeBasedBusiness("false");
      await reselectNewIndustry("home-contractor");
      expect(homeBasedBusinessValue()).toEqual(false);
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

    const homeBasedBusinessValue = (): boolean => {
      const updatedUserData = getLastCalledWith(mockUpdate)[0] as UserData;
      return updatedUserData.onboardingData.homeBasedBusiness;
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

  const getIndustryValue = (): Industry =>
    (subject.queryByTestId("industry") as HTMLInputElement)?.value as Industry;

  const getLegalStructureValue = (): LegalStructure => {
    const checked = subject.container.querySelector(".Mui-checked input") as HTMLInputElement;
    return checked.value as LegalStructure;
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
