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

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("onboarding form", () => {
  let subject: RenderResult;
  let emptyUserData: UserData;

  beforeEach(() => {
    jest.resetAllMocks();
    emptyUserData = createEmptyUserData(generateUser({}));
    useMockUserData(emptyUserData);
    useMockRouter({});
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      onboardingData: generateOnboardingData({
        businessName: "Applebees",
        industry: "cosmetology",
        legalStructure: "b-corporation",
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
    expect(getLegalStructureValue()).toEqual("b-corporation");

    await visitStep4();
    expect(getMunicipalityValue()).toEqual("Newark");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = generateUserData({});
    const promise = Promise.resolve();
    mockUpdate.mockReturnValue(promise);
    useMockUserData(initialUserData);

    const newark = generateMunicipality({ displayName: "Newark" });

    subject = render(
      <Onboarding
        displayContent={createEmptyOnboardingDisplayContent()}
        municipalities={[newark, initialUserData.onboardingData.municipality!]}
      />
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
        liquorLicense: false,
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
        liquorLicense: false,
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
        liquorLicense: false,
        legalStructure: "general-partnership",
        municipality: newark,
      },
    });
    expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap");
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

  it("sets liquor license back to false if they select a different industry", async () => {
    subject = render(
      <Onboarding displayContent={createEmptyOnboardingDisplayContent()} municipalities={[]} />
    );
    await visitStep2();
    selectByValue("Industry", "restaurant");
    chooseRadio("true");

    selectByValue("Industry", "e-commerce");
    await visitStep3();

    expect(mockUseUserData.mockUpdate).toHaveBeenLastCalledWith({
      ...emptyUserData,
      onboardingData: {
        ...emptyUserData.onboardingData,
        industry: "e-commerce",
        liquorLicense: false,
      },
    });
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
    fireEvent.click(subject.getAllByText("Next")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getAllByText("Back")[0]);
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
    await waitForElementToBeRemoved(() => subject.getByText("Step 1 of 4"));
  };

  const visitStep3 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 2 of 4"));
  };

  const visitStep4 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 3 of 4"));
  };
});
