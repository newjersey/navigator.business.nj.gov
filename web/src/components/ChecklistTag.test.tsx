import { getMergedConfig } from "@/contexts/configContext";
import { render, screen } from "@testing-library/react";
import { ChecklistTag } from "./ChecklistTag";

const Config = getMergedConfig();

describe("<ChecklistTag />", () => {
  it("renders the Completed tag with the correct text and icon", () => {
    render(<ChecklistTag status="ACTIVE" />);
    expect(screen.getByText(Config.licenseSearchTask.completedStatusText)).toBeInTheDocument();
    expect(screen.getByTestId("check-checklist-tag-icon")).toBeInTheDocument();
  });

  it("renders the Pending tag with the correct text and icon", () => {
    render(<ChecklistTag status="PENDING" />);
    expect(screen.getByText(Config.licenseSearchTask.pendingPermitStatusText)).toBeInTheDocument();
    expect(screen.getByTestId("schedule-checklist-tag-icon")).toBeInTheDocument();
  });

  it("renders the Scheduled tag with the correct text and icon", () => {
    render(<ChecklistTag status="SCHEDULED" />);
    expect(screen.getByText(Config.licenseSearchTask.scheduledStatusText)).toBeInTheDocument();
    expect(screen.getByTestId("event-checklist-tag-icon")).toBeInTheDocument();
  });

  it("renders the Incomplete tag with the correct text and icon", () => {
    render(<ChecklistTag status="INCOMPLETE" />);
    expect(screen.getByText(Config.licenseSearchTask.incompleteStatusText)).toBeInTheDocument();
    expect(screen.getByTestId("close-checklist-tag-icon")).toBeInTheDocument();
  });

  it("renders the Not Applicable tag with the correct text and icon", () => {
    render(<ChecklistTag status="NOT_APPLICABLE" />);
    expect(screen.getByText(Config.licenseSearchTask.notApplicableStatusText)).toBeInTheDocument();
    expect(screen.getByTestId("do-not-disturb-checklist-tag-icon")).toBeInTheDocument();
  });
});
