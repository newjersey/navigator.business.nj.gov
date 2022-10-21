import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { generateOpportunity } from "@/test/factories";
import { render, screen } from "@testing-library/react";

describe("OpportunityCard", () => {
  it("renders the name", () => {
    const opportunity = generateOpportunity({ name: "Test Name for Card" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("Test Name for Card")).toBeInTheDocument();
  });

  it("renders the due date when it exists", () => {
    const opportunity = generateOpportunity({ dueDate: "09/01/2030" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("Due:")).toBeInTheDocument();
    expect(screen.getByText("09/01/2030")).toBeInTheDocument();
  });

  it("renders the first-come-first-serve status in capitalized case", () => {
    const opportunity = generateOpportunity({ dueDate: "", status: "first come, first serve" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("First Come, First Serve")).toBeInTheDocument();
  });

  it("renders the rolling-application status in capitalized case", () => {
    const opportunity = generateOpportunity({ dueDate: "", status: "rolling application" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("Rolling Application")).toBeInTheDocument();
  });

  it("does not render due date if status is first come, first serve", () => {
    const opportunity = generateOpportunity({ dueDate: "09/03/30", status: "first come, first serve" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.queryByText("Due:")).not.toBeInTheDocument();
    expect(screen.queryByText("09/03/30")).not.toBeInTheDocument();
    expect(screen.getByText("First Come, First Serve")).toBeInTheDocument();
  });

  it("does not render due date if status is rolling application", () => {
    const opportunity = generateOpportunity({ dueDate: "09/03/30", status: "rolling application" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.queryByText("Due:")).not.toBeInTheDocument();
    expect(screen.queryByText("09/03/30")).not.toBeInTheDocument();
    expect(screen.getByText("Rolling Application")).toBeInTheDocument();
  });

  it("displays full first 150 characters of description", () => {
    const characters = Array(151).fill("a").join("");
    const expectedTextOnPage = `${Array(150).fill("a").join("")}...`;

    const opportunity = generateOpportunity({ contentMd: characters });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText(expectedTextOnPage)).toBeInTheDocument();
  });

  it("truncates markdown without showing characters on page for bold", () => {
    const characters = Array(145).fill("a").join("");
    const boldContent = `${characters} *a bold text*`;

    const opportunity = generateOpportunity({ contentMd: boldContent });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("a bo")).toBeInTheDocument();
  });

  it("truncates markdown without showing characters on page for link", () => {
    const characters = Array(145).fill("a").join("");
    const linkContent = `${characters} [a link text](www.example.com)`;

    const opportunity = generateOpportunity({ contentMd: linkContent });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("a li")).toBeInTheDocument();
  });
});
