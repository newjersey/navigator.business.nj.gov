import { describe, expect, it } from "vitest";
import { stripContentDirectives, stripContextualInfoIds } from "./stripContentDirectives";

describe("stripContextualInfoIds", () => {
  it("reduces a contextual-info span to its plain-text label", () => {
    expect(stripContextualInfoIds("Contact your `Local Enforcing Agency (LEA)|lea` today.")).toBe(
      "Contact your Local Enforcing Agency (LEA) today.",
    );
  });

  it("strips every span in the text", () => {
    expect(
      stripContextualInfoIds("`pesticide|pesticide` and `animal facilities|animal-facilities`"),
    ).toBe("pesticide and animal facilities");
  });

  it("leaves ordinary code spans untouched", () => {
    expect(stripContextualInfoIds("Run `yarn build` first.")).toBe("Run `yarn build` first.");
  });
});

describe("stripContentDirectives", () => {
  it("leaves plain markdown untouched", () => {
    const md = "You need a license to operate.\n\n- One\n- Two";
    expect(stripContentDirectives(md)).toBe(md);
  });

  it("unwraps an infoAlert directive, keeping the inner content", () => {
    const md = [
      ":::infoAlert",
      "**Keep in mind:** applications with missing documents are delayed.",
      ":::",
      "",
      "You need an A-901 license to transport waste.",
    ].join("\n");

    const result = stripContentDirectives(md);
    expect(result).not.toContain(":::");
    expect(result).toContain("**Keep in mind:** applications with missing documents are delayed.");
    expect(result).toContain("You need an A-901 license to transport waste.");
  });

  it("unwraps a largeCallout directive that carries an attribute block", () => {
    const md = [
      ':::largeCallout{ showHeader="true" headerText="Keep in mind:" calloutType="informational" }',
      "",
      "* A Motor Vehicle Commission EIN is required first.",
      "",
      ":::",
      "",
      "Your business vehicles must have a valid registration.",
    ].join("\n");

    const result = stripContentDirectives(md);
    expect(result).not.toContain(":::");
    expect(result).not.toContain("largeCallout");
    expect(result).not.toContain('headerText="Keep in mind:"');
    expect(result).toContain("* A Motor Vehicle Commission EIN is required first.");
    expect(result).toContain("Your business vehicles must have a valid registration.");
  });

  it("strips contextual-info-link ids and their code-span backticks, leaving plain text", () => {
    const md = "Contact the `Local Enforcing Agency (LEA)|lea` in your town.";
    expect(stripContentDirectives(md)).toBe(
      "Contact the Local Enforcing Agency (LEA) in your town.",
    );
  });

  it("handles multiple directives in one document", () => {
    const md = [
      ":::infoAlert",
      "First note.",
      ":::",
      "",
      "Body text.",
      "",
      ":::note",
      "Second note.",
      ":::",
    ].join("\n");

    const result = stripContentDirectives(md);
    expect(result).not.toContain(":::");
    expect(result).toContain("First note.");
    expect(result).toContain("Body text.");
    expect(result).toContain("Second note.");
  });
});
