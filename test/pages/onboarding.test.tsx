import { fireEvent, RenderResult } from "@testing-library/react";
import Onboarding from "../../pages/onboarding";
import { useRouter } from "next/router";
import { renderWithFormData } from "../helpers";

jest.mock("next/router");

describe("onboarding form", () => {
  let subject: RenderResult;
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    subject = renderWithFormData(<Onboarding />, {
      user: { email: "ada@lovelace.org" },
    });
  });

  it("prefills form from context", () => {
    expect(subject.getByLabelText("Email")).toHaveValue("ada@lovelace.org");
  });

  it("steps through each page of the form", () => {
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

  it("directs to roadmap based on business type", () => {
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
    fillText(subject.getByLabelText("First name"), "ada");
    fireEvent.click(subject.getByText("Next"));
    fireEvent.click(subject.getByText("Back"));

    expect(subject.getByLabelText("First name")).toHaveValue("ada");
  });

  const fillText = (element: HTMLElement, text: string) => {
    fireEvent.change(element, { target: { value: text } });
  };
});
