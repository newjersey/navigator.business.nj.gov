import { determineForeignBusinessType } from "@/lib/domain-logic/determineForeignBusinessType";

describe("determineForeignBusinessType", () => {
  it("returns undefined when array is empty", () => {
    expect(determineForeignBusinessType([])).toBeUndefined();
  });

  it("returns NEXUS for employeeOrContractorInNJ as highest priority", () => {
    expect(determineForeignBusinessType(["employeeOrContractorInNJ"])).toEqual("NEXUS");

    expect(determineForeignBusinessType(["employeeOrContractorInNJ", "employeesInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["employeeOrContractorInNJ", "transactionsInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["employeeOrContractorInNJ", "revenueInNJ"])).toEqual("NEXUS");
    expect(
      determineForeignBusinessType([
        "employeeOrContractorInNJ",
        "revenueInNJ",
        "transactionsInNJ",
        "employeesInNJ"
      ])
    ).toEqual("NEXUS");
  });

  it("returns NEXUS for officeInNJ as highest priority", () => {
    expect(determineForeignBusinessType(["officeInNJ"])).toEqual("NEXUS");

    expect(determineForeignBusinessType(["officeInNJ", "employeesInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["officeInNJ", "transactionsInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["officeInNJ", "revenueInNJ"])).toEqual("NEXUS");
    expect(
      determineForeignBusinessType(["officeInNJ", "revenueInNJ", "transactionsInNJ", "employeesInNJ"])
    ).toEqual("NEXUS");
  });

  it("returns NEXUS for propertyInNJ as highest priority", () => {
    expect(determineForeignBusinessType(["propertyInNJ"])).toEqual("NEXUS");

    expect(determineForeignBusinessType(["propertyInNJ", "employeesInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["propertyInNJ", "transactionsInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["propertyInNJ", "revenueInNJ"])).toEqual("NEXUS");
    expect(
      determineForeignBusinessType(["propertyInNJ", "revenueInNJ", "transactionsInNJ", "employeesInNJ"])
    ).toEqual("NEXUS");
  });

  it("returns NEXUS for companyOperatedVehiclesInNJ as highest priority", () => {
    expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ"])).toEqual("NEXUS");

    expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ", "employeesInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ", "transactionsInNJ"])).toEqual(
      "NEXUS"
    );
    expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ", "revenueInNJ"])).toEqual("NEXUS");
    expect(
      determineForeignBusinessType([
        "companyOperatedVehiclesInNJ",
        "revenueInNJ",
        "transactionsInNJ",
        "employeesInNJ"
      ])
    ).toEqual("NEXUS");
  });

  it("returns NEXUS for officeInNJ, propertyInNJ, or companyOperatedVehiclesInNJ", () => {
    expect(determineForeignBusinessType(["officeInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["propertyInNJ"])).toEqual("NEXUS");
    expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ"])).toEqual("NEXUS");
    expect(
      determineForeignBusinessType(["officeInNJ", "propertyInNJ", "companyOperatedVehiclesInNJ"])
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

  it("returns none when none and other values are selected", () => {
    expect(determineForeignBusinessType(["none", "revenueInNJ"])).toEqual("NONE");
  });
});
