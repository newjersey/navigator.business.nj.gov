import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Intercom } from "./Intercom";

/**
 * jsdom does not execute the textContent of scripts inserted by next/script,
 * so re-append a fresh <script> with the same body to trigger real execution,
 * matching what the browser does for the rendered page.
 */
const runInlineScript = (id: string) => {
  const original = document.body.querySelector<HTMLScriptElement>(`script#${id}`);
  expect(original).not.toBeNull();
  const executable = document.createElement("script");
  executable.textContent = original?.textContent ?? "";
  document.body.append(executable);
  executable.remove();
};

describe("Intercom", () => {
  afterEach(() => {
    document.body.querySelector("#intercom-settings")?.remove();
    document.body.querySelector("#intercom-widget")?.remove();
    for (const node of document.body.querySelectorAll(
      'script[src^="https://widget.intercom.io"]',
    )) {
      node.remove();
    }
    Reflect.deleteProperty(window, "Intercom");
    Reflect.deleteProperty(window, "intercomSettings");
  });

  it("injects the Intercom widget script even when window.load already fired", () => {
    render(<Intercom />);
    runInlineScript("intercom-settings");

    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });

    runInlineScript("intercom-widget");

    expect(document.body.querySelector('script[src^="https://widget.intercom.io"]')).not.toBeNull();
  });
});
