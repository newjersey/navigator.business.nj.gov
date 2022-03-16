import { sortFundings } from "@/lib/domain-logic/sortFundings";
import { generateFunding } from "@/test/factories";

describe("sortFundings", () => {
  it("sorts fundings by status first then alphabetically", () => {
    const funding1 = generateFunding({ name: "Bca", status: "deadline" });
    const funding2 = generateFunding({ name: "Abc", status: "deadline" });
    const funding3 = generateFunding({ name: "cba", status: "deadline" });
    const funding4 = generateFunding({ name: "abc", status: "first-come, first-served" });
    const funding5 = generateFunding({ name: "bca", status: "open" });
    const fundings = [funding5, funding2, funding3, funding1, funding4];

    const result = sortFundings(fundings);
    expect(result.length).toEqual(5);
    expect(result).toEqual([funding2, funding1, funding3, funding4, funding5]);
  });
});
