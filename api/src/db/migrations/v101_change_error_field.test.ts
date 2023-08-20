import { v100TaxFilingDataGenerator, v100UserDataGenerator } from "./v100_add_updated_timestamp";
import { migrate_v100_to_v101 } from "./v101_change_error_field";

describe("migrate_v100_to_v101", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  it("changes Business Name to businessName for tax filing error field", () => {
    const v100 = v100UserDataGenerator({
      taxFilingData: v100TaxFilingDataGenerator({ errorField: "Business Name" }),
    });
    const v101 = migrate_v100_to_v101(v100);
    expect(v101).toEqual({
      ...v100,
      taxFilingData: { ...v100.taxFilingData, errorField: "businessName" },
      version: 101,
    });
  });

  it("changes Taxpayer ID  to form failure for tax filing error field", () => {
    const v100 = v100UserDataGenerator({
      taxFilingData: v100TaxFilingDataGenerator({ errorField: "Taxpayer ID" }),
    });
    const v101 = migrate_v100_to_v101(v100);
    expect(v101).toEqual({
      ...v100,
      taxFilingData: { ...v100.taxFilingData, errorField: "formFailure" },
      version: 101,
    });
  });

  it("doesn't make any changes if errorField is undefined", () => {
    const v100 = v100UserDataGenerator({
      taxFilingData: v100TaxFilingDataGenerator({ errorField: undefined }),
    });
    const v101 = migrate_v100_to_v101(v100);
    expect(v101).toEqual({
      ...v100,
      version: 101,
    });
  });
});
