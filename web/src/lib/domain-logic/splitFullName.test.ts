import { splitFullName } from "@/lib/domain-logic/splitFullName";

describe("splitFullName", () => {
  it("splits on the first space when exists", () => {
    expect(splitFullName("Anne LoVerso")).toEqual({
      firstName: "Anne",
      lastName: "LoVerso",
    });

    expect(splitFullName("Anne Lo Verso")).toEqual({
      firstName: "Anne",
      lastName: "Lo Verso",
    });

    expect(splitFullName("E. J. Kalafarski")).toEqual({
      firstName: "E.",
      lastName: "J. Kalafarski",
    });
  });

  it("uses first name only if no space", () => {
    expect(splitFullName("Mike")).toEqual({
      firstName: "Mike",
      lastName: "",
    });
  });

  it("is empty if name is empty", () => {
    expect(splitFullName("")).toEqual({
      firstName: "",
      lastName: "",
    });
  });

  it("is empty if name is empty", () => {
    expect(splitFullName(undefined)).toEqual({
      firstName: "",
      lastName: "",
    });
  });
});
