import { splitAndBoldSearchText } from "@/lib/utils/splitAndBoldSearchText";
import { render, screen } from "@testing-library/react";

describe("splitAndBoldSearchText", () => {
  it("properly displays the found text as bold", () => {
    render(splitAndBoldSearchText("food truck", "truck"));
    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByTestId("span-bold")).toHaveTextContent("truck");
  });

  it("properly displays the text as not bold when not found", () => {
    render(splitAndBoldSearchText("food truck", "firm"));
    expect(screen.queryByTestId("span-bold")).not.toBeInTheDocument();
    expect(screen.getByText("food truck")).toBeInTheDocument();
  });
});
