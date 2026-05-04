import { render, screen } from "@testing-library/react";
import { act } from "react";

import { CssTransition } from "@/components/transitions/CssTransition";

describe("CssTransition", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders visible content with transition classes", () => {
    const { asFragment } = render(
      <CssTransition
        className="width-100"
        isVisible
        timeout={100}
        transitionClassName="slide"
        unmountOnExit
      >
        <div>{"Visible content"}</div>
      </CssTransition>,
    );

    expect(screen.getByText("Visible content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="width-100 slide-enter-active"
        >
          <div>
            Visible content
          </div>
        </div>
      </DocumentFragment>
    `);
  });

  it("keeps exiting content mounted until the timeout completes", () => {
    const { asFragment, rerender } = render(
      <CssTransition
        className="width-100"
        isVisible
        timeout={100}
        transitionClassName="slide"
        unmountOnExit
      >
        <div>{"Exiting content"}</div>
      </CssTransition>,
    );

    rerender(
      <CssTransition
        className="width-100"
        isVisible={false}
        timeout={100}
        transitionClassName="slide"
        unmountOnExit
      >
        <div>{"Exiting content"}</div>
      </CssTransition>,
    );

    expect(screen.getByText("Exiting content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="width-100 slide-exit slide-exit-active"
        >
          <div>
            Exiting content
          </div>
        </div>
      </DocumentFragment>
    `);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.queryByText("Exiting content")).not.toBeInTheDocument();
  });

  it("keeps hidden content mounted after the timeout when unmounting is disabled", () => {
    const { rerender } = render(
      <CssTransition
        className="width-100"
        isVisible
        timeout={100}
        transitionClassName="slide"
        unmountOnExit={false}
      >
        <div>{"Persistent content"}</div>
      </CssTransition>,
    );

    rerender(
      <CssTransition
        className="width-100"
        isVisible={false}
        timeout={100}
        transitionClassName="slide"
        unmountOnExit={false}
      >
        <div>{"Persistent content"}</div>
      </CssTransition>,
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByText("Persistent content")).toBeInTheDocument();
  });
});
