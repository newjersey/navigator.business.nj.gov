import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import * as FetchContextualInfoModule from "@/lib/async-content-fetchers/fetchContextualInfo";
import { withContextualInfo } from "@/test/helpers/helpers-renderers";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/async-content-fetchers/fetchContextualInfo", () => ({ fetchContextualInfo: vi.fn() }));
const mockFetchContextualInfo = (FetchContextualInfoModule as vi.Mocked<typeof FetchContextualInfoModule>)
  .fetchContextualInfo;

describe("<ContextualInfoLink />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("splits the text on a | and displays the first half as a label", () => {
    render(<ContextualInfoLink>{["legal structure|legal-structure"]}</ContextualInfoLink>);
    expect(screen.getByText("legal structure")).toBeInTheDocument();
    expect(screen.queryByText("legal-structure")).not.toBeInTheDocument();
  });

  it("sets the contextual info context when clicked", async () => {
    mockFetchContextualInfo.mockResolvedValue({
      isVisible: false,
      header: "some header content",
      markdown: "some markdown content",
    });
    const setContent = vi.fn();
    render(
      withContextualInfo(
        <ContextualInfoLink>{["legal structure|legal-structure"]}</ContextualInfoLink>,
        { isVisible: false, header: "", markdown: "" },
        setContent
      )
    );
    fireEvent.click(screen.getByText("legal structure"));
    await waitFor(() => {
      return expect(setContent).toHaveBeenCalledWith({
        isVisible: true,
        header: "some header content",
        markdown: "some markdown content",
      });
    });
  });

  it("caches the content so it does not fetch again", async () => {
    mockFetchContextualInfo.mockResolvedValue({
      isVisible: false,
      header: "some header content",
      markdown: "some markdown content",
    });
    const setContent = vi.fn();
    render(
      withContextualInfo(
        <ContextualInfoLink>{["legal structure|legal-structure"]}</ContextualInfoLink>,
        { isVisible: false, header: "", markdown: "" },
        setContent
      )
    );
    fireEvent.click(screen.getByText("legal structure"));
    await waitFor(() => {
      return expect(setContent).toHaveBeenCalledWith({
        isVisible: true,
        header: "some header content",
        markdown: "some markdown content",
      });
    });
    fireEvent.click(screen.getByText("legal structure"));
    expect(mockFetchContextualInfo).toHaveBeenCalledTimes(1);
  });
});
