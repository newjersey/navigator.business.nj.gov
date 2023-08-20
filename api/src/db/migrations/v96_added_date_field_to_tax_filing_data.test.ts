import { v95TaxFilingDataGenerator, v95UserDataGenerator } from "./v95_added_new_tax_calendar_state";
import { migrate_v95_to_v96 } from "./v96_added_date_field_to_tax_filing_data";

const dateNow = Date.now();
const currentDate = new Date(dateNow);
const realDateNow = Date.now.bind(global.Date);

describe("migrate_v95_to_v96", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    const dateNowStub = jest.fn(() => {
      return dateNow;
    });
    global.Date.now = dateNowStub;
  });

  afterEach(() => {
    global.Date.now = realDateNow;
  });

  it("converts the registered field on taxFilingData to the registeredISO Field", () => {
    const v95 = v95UserDataGenerator({ taxFilingData: v95TaxFilingDataGenerator({ registered: true }) });
    const v96 = migrate_v95_to_v96(v95);
    expect(v96).toEqual({
      ...v95,
      taxFilingData: {
        ...v95.taxFilingData,
        registered: undefined,
        registeredISO: currentDate.toISOString(),
      },
      version: 96,
    });
  });
});
