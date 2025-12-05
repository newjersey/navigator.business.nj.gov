import { findMatchInLabelAndBlock } from "./helpers";

describe("findMatchInLabelAndBlock", () => {
  it("finds matches on label and string blocks as expected", async () => {
    const term = "taxes";
    const stringBlockText = [
      "a pharse with taxes inside of it or something like that whatever I don't care",
    ];
    const match = {
      filename: "filename",
      displayTitle: "displayTitle",
      snippets: [],
    };

    let modifiedMatch = findMatchInLabelAndBlock(stringBlockText, term, match);
    expect(modifiedMatch).toMatchObject({
      filename: "filename",
      displayTitle: "displayTitle",
      snippets: ["a pharse with taxes inside of it or something like that whatever I do"],
    });

    const labelBlock = [
      {
        content: "some kind of labeled content involving taxes or some such nonsense or what",
        label: "a label",
      },
    ];

    modifiedMatch = findMatchInLabelAndBlock(labelBlock, term, match);
    expect(modifiedMatch).toMatchObject({
      filename: "filename",
      displayTitle: "displayTitle",
      snippets: [
        "a pharse with taxes inside of it or something like that whatever I do",
        "a label: some kind of labeled content involving taxes or some such nonsense or what",
      ],
    });
  });

  // should probably have a test doing this in a fixture with all multiple cases in label and body to make sure it captures both twice.
  // not here but in the test for the function for the actually matching funciton itself
});
