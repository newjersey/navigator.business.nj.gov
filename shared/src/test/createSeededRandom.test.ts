import { createSeededRandom } from "./createSeededRandom";

describe("createSeededRandom", () => {
  it("preserves the sequence for a recorded seed", () => {
    const random = createSeededRandom({ seed: "replay-seed" });

    expect([random(), random(), random(), random()]).toEqual([
      0.2761438424990994, 0.1032062432208386, 0.8350065643396407, 0.21627748171231675,
    ]);
  });

  it("replays independently across buffer refills", () => {
    const first = createSeededRandom({ seed: "replay-seed" });
    const second = createSeededRandom({ seed: "replay-seed" });
    const other = createSeededRandom({ seed: "another-seed" });
    const firstValues = Array.from({ length: 1100 }, () => first());
    const secondValues = Array.from({ length: 1100 }, () => {
      other();
      return second();
    });

    expect(secondValues).toEqual(firstValues);
    expect(firstValues.every((value) => Number.isFinite(value) && value >= 0 && value < 1)).toBe(
      true,
    );
  });

  it("produces different sequences for different seeds", () => {
    const first = createSeededRandom({ seed: "first" });
    const second = createSeededRandom({ seed: "second" });

    expect([first(), first(), first()]).not.toEqual([second(), second(), second()]);
  });

  it("rejects an empty seed", () => {
    expect(() => createSeededRandom({ seed: "" })).toThrow("Random seed must not be empty");
  });
});
