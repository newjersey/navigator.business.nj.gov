import { ProfileSubSection } from "@/components/profile/ProfileSubSection";
import { render, screen } from "@testing-library/react";

describe("ProfileSubSection Component", () => {
  const defaultProps = {
    heading: "Test Heading",
    subText: "Test SubText",
    children: (
      <div role="region" aria-label="content area">
        Test Children
      </div>
    ),
  };

  it("renders heading correctly", () => {
    render(<ProfileSubSection {...defaultProps} />);
    const headingElement = screen.getByRole("heading", { level: 3 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent("Test Heading");
  });

  it("renders subtext correctly", () => {
    render(<ProfileSubSection {...defaultProps} />);
    const subTextContent = screen.getByText("Test SubText");
    expect(subTextContent).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(<ProfileSubSection {...defaultProps} />);
    const childrenElement = screen.getByRole("region", { name: "content area" });
    expect(childrenElement).toBeInTheDocument();
    expect(childrenElement).toHaveTextContent("Test Children");
  });

  it("renders divider by default", () => {
    render(<ProfileSubSection {...defaultProps} />);
    // Using data-testid because the hr element doesn't have good semantic roles
    const divider = screen.getByTestId("profile-sub-section-divider");
    expect(divider).toBeInTheDocument();
  });

  it("hides divider when hideDivider prop is true", () => {
    render(<ProfileSubSection {...defaultProps} hideDivider={true} />);
    // Using data-testid because the hr element doesn't have good semantic roles
    const divider = screen.queryByTestId("profile-sub-section-divider");
    expect(divider).not.toBeInTheDocument();
  });
});
