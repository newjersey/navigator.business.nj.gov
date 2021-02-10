import { fireEvent, RenderResult } from "@testing-library/react";
import Onboarding from "../../pages/onboarding";
import { useRouter } from "next/router";
import { renderWithUser } from "../helpers";
import { generateUser } from "../factories";
import { BusinessUser } from "../../lib/types";

jest.mock("next/router");

describe("onboarding form", () => {
  let subject: RenderResult;
  let mockPush: jest.Mock;
  let currentUser: BusinessUser;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    currentUser = generateUser({});
    subject = renderWithUser(<Onboarding />, currentUser, jest.fn());
  });

  it("prefills email from the signed-in user", () => {
    expect(subject.getByLabelText("Email")).toHaveValue(currentUser.email);
  });

  it("steps through each page of the form", () => {
    fillText(subject.getByLabelText("First name"), "ada");
    fillText(subject.getByLabelText("Last name"), "lovelace");

    fireEvent.click(subject.getByText("Next"));
    fireEvent.change(
      subject.getByLabelText("What type of company do you want to start?"),
      { target: { value: "restaurant" } }
    );

    fireEvent.click(subject.getByText("Next"));
    fillText(
      subject.getByLabelText("Business name"),
      "Ada's cool computer company"
    );

    fireEvent.click(subject.getByText("Next"));
    fillText(
      subject.getByLabelText("Business description"),
      "Selling computers"
    );

    fireEvent.click(subject.getByText("Next"));
    fireEvent.change(subject.getByLabelText("Business structure"), {
      target: { value: "LLC" },
    });

    fireEvent.click(subject.getByText("Next"));
    fillText(subject.getByLabelText("Zip code"), "11111");

    fireEvent.click(subject.getByText("Next"));
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
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
