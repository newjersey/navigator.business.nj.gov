import { determineForeignBusinessType } from "@/lib/domain-logic/determineForeignBusinessType";

describe("determineForeignBusinessType", () => {
  it("returns undefined when array is empty", () => {
    expect(determineForeignBusinessType([])).toBeUndefined();
  });

  it("returns REMOTE_WORKER when employeesInNJ is selected", () => {
    expect(determineForeignBusinessType(["employeesInNJ"])).toEqual("REMOTE_WORKER");
  });

  it("returns REMOTE_WORKER when both employeesInNJ and transactionsInNJ selected", () => {
    expect(determineForeignBusinessType(["employeesInNJ", "transactionsInNJ"])).toEqual("REMOTE_WORKER");
  });

  it("returns REMOTE_SELLER when revenueInNJ is selected", () => {
    expect(determineForeignBusinessType(["revenueInNJ"])).toEqual("REMOTE_SELLER");
  });

  it("returns REMOTE_SELLER when transactionsInNJ is selected", () => {
    expect(determineForeignBusinessType(["transactionsInNJ"])).toEqual("REMOTE_SELLER");
  });

  it("returns REMOTE_SELLER when both revenueInNJ and transactionsInNJ selected", () => {
    expect(determineForeignBusinessType(["revenueInNJ", "transactionsInNJ"])).toEqual("REMOTE_SELLER");
  });
});
