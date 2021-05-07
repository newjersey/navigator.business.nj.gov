import { fireEvent, render, waitFor } from "@testing-library/react";
import { ContextualInfoLink } from "./ContextualInfoLink";
import { renderWithContextualInfo } from "@/test/helpers";
import * as FetchContextualInfoModule from "@/lib/async-content-fetchers/fetchContextualInfo";

jest.mock("@/lib/async-content-fetchers/fetchContextualInfo", () => ({
  fetchContextualInfo: jest.fn(),
}));
const mockFetchContextualInfo = (FetchContextualInfoModule as jest.Mocked<typeof FetchContextualInfoModule>)
  .fetchContextualInfo;

describe("<ContextualInfoLink />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("splits the text on a | and displays the first half as a label", () => {
    const subject = render(<ContextualInfoLink>{["legal structure|legal-structure"]}</ContextualInfoLink>);
    expect(subject.queryByText("legal structure")).toBeInTheDocument();
    expect(subject.queryByText("legal-structure")).not.toBeInTheDocument();
  });

  it("sets the contextual info context when clicked", async () => {
    mockFetchContextualInfo.mockResolvedValue("some markdown content");
    const setContent = jest.fn();
    const subject = renderWithContextualInfo(
      <ContextualInfoLink>{["legal structure|legal-structure"]}</ContextualInfoLink>,
      "",
      setContent
    );
    fireEvent.click(subject.getByText("legal structure"));
    await waitFor(() => expect(setContent).toHaveBeenCalledWith("some markdown content"));
  });

  it("caches the content so it does not fetch again", async () => {
    mockFetchContextualInfo.mockResolvedValue("some markdown content");
    const setContent = jest.fn();
    const subject = renderWithContextualInfo(
      <ContextualInfoLink>{["legal structure|legal-structure"]}</ContextualInfoLink>,
      "",
      setContent
    );
    fireEvent.click(subject.getByText("legal structure"));
    await waitFor(() => expect(setContent).toHaveBeenCalledWith("some markdown content"));
    fireEvent.click(subject.getByText("legal structure"));
    expect(mockFetchContextualInfo).toHaveBeenCalledTimes(1);
  });
});
