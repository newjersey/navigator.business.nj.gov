import { getMergedConfig } from "@/contexts/configContext";
import UnsupportedPage from "@/pages/unsupported";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("Unsupported", () => {
  it("renders the text when navigated to", () => {
    render(<UnsupportedPage />);
    expect(screen.getByText(Config.unsupportedNavigatorUserPage.title)).toBeInTheDocument();
    expect(screen.getByTestId("unsupported-subtitle")).toBeInTheDocument();
  });
});
