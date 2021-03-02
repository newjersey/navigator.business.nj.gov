import { fireEvent, render, RenderResult } from "@testing-library/react";
import Onboarding from "../../pages/onboarding";
import { useRouter } from "next/router";
import React from "react";
import * as useUserModule from "../../lib/data/useUserData";
import { generateUserData } from "../factories";
import { createStatefulMock, generateUseUserDataResponse } from "../helpers";

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
    const userData = generateUserData({});
    mockUseUserData.mockImplementation(createStatefulMock(userData));
    subject = render(<Onboarding />);

    expect(subject.getByLabelText("Email")).toHaveValue(userData.formData.user.email);
    expect(subject.getByLabelText("First name")).toHaveValue(userData.formData.user.firstName);
    expect(subject.getByLabelText("Last name")).toHaveValue(userData.formData.user.lastName);
    fireEvent.click(subject.getByText("Next"));
    expect(subject.getByLabelText("What type of company do you want to start?")).toHaveValue(
      userData.formData.businessType.businessType
    );
  });

  it("steps through each page of the form", () => {
    mockUseUserData.mockImplementation(createStatefulMock());
    subject = render(<Onboarding />);

    fillText(subject.getByLabelText("First name"), "ada");
    fillText(subject.getByLabelText("Last name"), "lovelace");

    fireEvent.click(subject.getByText("Next"));
    fireEvent.change(subject.getByLabelText("What type of company do you want to start?"), {
      target: { value: "restaurant" },
    });

    fireEvent.click(subject.getByText("Next"));
    fillText(subject.getByLabelText("Business name"), "Ada's cool computer company");

    fireEvent.click(subject.getByText("Next"));
    fillText(subject.getByLabelText("Business description"), "Selling computers");

    fireEvent.click(subject.getByText("Next"));
    fireEvent.change(subject.getByLabelText("Business structure"), {
      target: { value: "LLC" },
    });

    fireEvent.click(subject.getByText("Next"));
    fillText(subject.getByLabelText("Zip code"), "11111");

    fireEvent.click(subject.getByText("Next"));
    expect(mockPush).toHaveBeenCalledWith("/roadmaps/restaurant");
  });

  it("updates the user data after each page", () => {
    const initialUserData = generateUserData({});
    const mockUpdate = jest.fn();
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: initialUserData,
        update: mockUpdate,
      })
    );
    subject = render(<Onboarding />);

    fillText(subject.getByLabelText("First name"), "ada");
    fillText(subject.getByLabelText("Last name"), "lovelace");
    fireEvent.click(subject.getByText("Next"));

    expect(mockUpdate).toHaveBeenCalledWith({
      ...initialUserData,
      formData: {
        ...initialUserData.formData,
        user: {
          ...initialUserData.formData.user,
          firstName: "ada",
          lastName: "lovelace",
        },
      },
    });
  });

  it("directs to roadmap based on business type", () => {
    mockUseUserData.mockImplementation(createStatefulMock());
    subject = render(<Onboarding />);

    fireEvent.click(subject.getByText("Next"));
    fireEvent.change(subject.getByLabelText("What type of company do you want to start?"), {
      target: { value: "e-commerce" },
    });

    fireEvent.click(subject.getByText("Next"));
    fireEvent.click(subject.getByText("Next"));
    fireEvent.click(subject.getByText("Next"));
    fireEvent.click(subject.getByText("Next"));
    fireEvent.click(subject.getByText("Next"));

    expect(mockPush).toHaveBeenCalledWith("/roadmaps/e-commerce");
  });

  it("is able to go back", () => {
    mockUseUserData.mockImplementation(createStatefulMock());
    subject = render(<Onboarding />);

    fillText(subject.getByLabelText("First name"), "ada");
    fireEvent.click(subject.getByText("Next"));
    fireEvent.click(subject.getByText("Back"));

    expect(subject.getByLabelText("First name")).toHaveValue("ada");
  });

  const fillText = (element: HTMLElement, text: string) => {
    fireEvent.change(element, { target: { value: text } });
  };
});
