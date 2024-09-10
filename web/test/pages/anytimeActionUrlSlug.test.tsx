import AnytimeActionTaskPage from "@/pages/actions/[anytimeActionTaskUrlSlug]";
import { generateAnytimeActionTask } from "@/test/factories";
import { render, screen } from "@testing-library/react";

describe("anytime action page", () => {
  it("shows the anytime action details", () => {
    const anytimeAction = generateAnytimeActionTask({
      name: "Some Anytime Action Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
      filename: "registry-update-brc-amendment",
      issuingAgency: "some agency",
    });

    render(<AnytimeActionTaskPage anytimeActionTask={anytimeAction} />);

    expect(screen.getByText("Some Anytime Action Name")).toBeInTheDocument();
    expect(screen.getByText("Click here")).toBeInTheDocument();
    expect(screen.getByText("Some content description")).toBeInTheDocument();
    expect(screen.getByText("some agency")).toBeInTheDocument();
  });

  it("shows the anytime action details for state contracting", () => {
    const anytimeAction = generateAnytimeActionTask({
      name: "State contracting task",
      callToActionText: "Click here",
      contentMd: "Some content description",
      filename: "state-contracting-task",
    });

    render(<AnytimeActionTaskPage anytimeActionTask={anytimeAction} />);

    expect(screen.getByText("State contracting task")).toBeInTheDocument();
  });
});
