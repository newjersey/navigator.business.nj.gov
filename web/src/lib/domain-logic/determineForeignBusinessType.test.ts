import { determineForeignBusinessType } from "@/lib/domain-logic/determineForeignBusinessType";

describe("determineForeignBusinessType", () => {
  it("returns undefined when array is empty", () => {
    expect(determineForeignBusinessType([])).toBeUndefined();
  });

  it("returns NEXUS for operationsInNJ as highest priority", () => {
    expect(determineForeignBusinessType(["operationsInNJ"])).toEqual("NEXUS");

    expect(determineForeignBusinessType(["operationsInNJ", "employeesInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["operationsInNJ", "transactionsInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["operationsInNJ", "revenueInNJ"])).toEqual("NEXUS");
    expect(
      determineForeignBusinessType(["operationsInNJ", "revenueInNJ", "transactionsInNJ", "employeesInNJ"])
    ).toEqual("NEXUS");
  });

  it("returns REMOTE_WORKER for employeesInNJ as higher priority over remote_seller (but not nexus)", () => {
    expect(determineForeignBusinessType(["employeesInNJ"])).toEqual("REMOTE_WORKER");

    expect(determineForeignBusinessType(["employeesInNJ", "transactionsInNJ"])).toEqual("REMOTE_WORKER");
    expect(determineForeignBusinessType(["employeesInNJ", "revenueInNJ"])).toEqual("REMOTE_WORKER");
    expect(determineForeignBusinessType(["employeesInNJ", "revenueInNJ", "transactionsInNJ"])).toEqual(
      "REMOTE_WORKER"
    );
  });

  it("returns REMOTE_SELLER for revenueInNJ or transactionsInNJ", () => {
    expect(determineForeignBusinessType(["revenueInNJ"])).toEqual("REMOTE_SELLER");
    expect(determineForeignBusinessType(["transactionsInNJ"])).toEqual("REMOTE_SELLER");
    expect(determineForeignBusinessType(["revenueInNJ", "transactionsInNJ"])).toEqual("REMOTE_SELLER");
  });

  it("returns none when none is selected", () => {
    expect(determineForeignBusinessType(["none"])).toEqual("NONE");
  });
});
