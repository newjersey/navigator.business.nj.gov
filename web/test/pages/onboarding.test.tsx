import {
  act,
  fireEvent,
  render,
  RenderResult,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import Onboarding from "../../pages/onboarding";
import { useRouter } from "next/router";
import React from "react";
import * as useUserModule from "../../lib/data/useUserData";
import { generateOnboardingData, generateUserData } from "../factories";
import { generateUseUserDataResponse } from "../helpers";
import {
  createEmptyOnboardingDisplayContent,
  Industry,
  LegalStructure,
  OnboardingData,
} from "../../lib/types/types";

jest.mock("next/router");

jest.mock("../../lib/data/useUserData", () => ({
  useUserData: jest.fn(),
}));
const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

describe("onboarding form", () => {
  let subject: RenderResult;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      onboardingData: generateOnboardingData({
        businessName: "Applebees",
        industry: "cosmetology",
        legalStructure: "b-corporation",
      }),
    });

    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData,
        update: jest.fn().mockResolvedValue({}),
      })
    );

    subject = render(<Onboarding displayContent={createEmptyOnboardingDisplayContent()} />);

    expect(getFormValues().businessName).toEqual("Applebees");
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 1 of 3"));
    expect(getFormValues().industry).toEqual("cosmetology");
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 2 of 3"));
    expect(getFormValues().legalStructure).toEqual("b-corporation");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = generateUserData({});
    const promise = Promise.resolve();
    const mockUpdate = jest.fn(() => promise);

    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: initialUserData,
        update: mockUpdate,
      })
    );

    subject = render(<Onboarding displayContent={createEmptyOnboardingDisplayContent()} />);

    fillText("Business name", "Cool Computers");
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 1 of 3"));
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
      },
    });

    select("Industry", "E-Commerce");
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 2 of 3"));
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
        industry: "e-commerce",
      },
    });

    select("Legal structure", "General Partnership");
    clickNext();
    await act(() => promise);
    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      formProgress: "COMPLETED",
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
        industry: "e-commerce",
        legalStructure: "general-partnership",
      },
    });
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("is able to go back", async () => {
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        update: jest.fn().mockResolvedValue({}),
      })
    );
    subject = render(<Onboarding displayContent={createEmptyOnboardingDisplayContent()} />);

    fillText("Business name", "Cool Computers");
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByText("Step 1 of 3"));

    clickBack();
    expect(subject.queryByLabelText("Business name")).toBeVisible();
  });

  const fillText = (label: string, value: string) => {
    fireEvent.change(subject.getByLabelText(label), { target: { value: value } });
  };

  const select = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const clickNext = (): void => {
    fireEvent.click(subject.getAllByText("Next")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getAllByText("Back")[0]);
  };

  const getFormValues = (): OnboardingData => {
    const businessName = (subject.queryByLabelText("Business name") as HTMLInputElement)?.value;
    const industry = (subject.queryByTestId("industry") as HTMLInputElement)?.value as Industry;
    const legalStructure = (subject.queryByTestId("legal-structure") as HTMLInputElement)
      ?.value as LegalStructure;

    return {
      businessName,
      industry,
      legalStructure,
    };
  };
});
