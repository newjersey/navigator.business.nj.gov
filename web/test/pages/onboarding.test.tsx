import { fireEvent, render, RenderResult, within } from "@testing-library/react";
import Onboarding from "../../pages/onboarding";
import { useRouter } from "next/router";
import React from "react";
import * as useUserModule from "../../lib/data/useUserData";
import { generateOnboardingData, generateUserData } from "../factories";
import { createStatefulMock, generateUseUserDataResponse } from "../helpers";
import { Industry, LegalStructure, OnboardingData } from "../../lib/types/types";

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

  it("prefills form from existing user data", () => {
    const userData = generateUserData({
      onboardingData: generateOnboardingData({
        businessName: "Applebees",
        industry: "cosmetology",
        legalStructure: "b-corporation",
      }),
    });
    mockUseUserData.mockImplementation(createStatefulMock(userData));
    subject = render(<Onboarding />);

    expect(getFormValues().businessName).toEqual("Applebees");
    clickNext();
    expect(getFormValues().industry).toEqual("cosmetology");
    clickNext();
    expect(getFormValues().legalStructure).toEqual("b-corporation");
  });

  it("updates the user data after each form page", () => {
    const initialUserData = generateUserData({});
    const mockUpdate = jest.fn();
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: initialUserData,
        update: mockUpdate,
      })
    );
    subject = render(<Onboarding />);

    fillText("Business name", "Cool Computers");
    clickNext();

    expect(mockUpdate).toHaveBeenLastCalledWith({
      ...initialUserData,
      onboardingData: {
        ...initialUserData.onboardingData,
        businessName: "Cool Computers",
      },
    });

    select("Industry", "E-Commerce");
    clickNext();

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

  it("is able to go back", () => {
    mockUseUserData.mockImplementation(createStatefulMock());
    subject = render(<Onboarding />);

    fillText("Business name", "Cool Computers");
    clickNext();
    clickBack();
    expect(getFormValues().businessName).toEqual("Cool Computers");
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
    fireEvent.click(subject.getByText("Next"));
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getByText("Back"));
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
