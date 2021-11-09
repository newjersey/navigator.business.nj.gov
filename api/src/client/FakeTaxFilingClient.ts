import { TaxFilingClient } from "../domain/types";
import { TaxFiling, TaxFilingData } from "@shared/taxFiling";
import dayjs from "dayjs";

export const FakeTaxFilingClient = (): TaxFilingClient => {
  const fetchForEntityId = (entityId: string): Promise<TaxFilingData> => {
    if (entityId === "0000000000") {
      return Promise.resolve({
        entityIdStatus: "EXISTS_AND_REGISTERED",
        filings: [
          generateTaxFiling({ identifier: "DOMESTIC_ANNUAL_REPORT", dueDate: "2021-11-01" }),
          generateTaxFiling({ identifier: "PASS_THROUGH_ALTERNATIVE_INCOME_TAX", dueDate: "2021-11-16" }),
          generateTaxFiling({ identifier: "TRANSMIT_1095_FORMS", dueDate: "2021-12-01" }),
          generateTaxFiling({ identifier: "SALES_TAX", dueDate: "2022-01-17" }),
          generateTaxFiling({ identifier: "UNEMPLOYMENT", dueDate: "2022-02-17" }),
          generateTaxFiling({ identifier: "PAYROLL", dueDate: "2022-02-17" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-03-09" }),
          generateTaxFiling({ identifier: "PROPERTY_TAX", dueDate: "2022-06-01" }),
        ],
      });
    } else if (entityId === "1111111111") {
      return Promise.resolve({
        entityIdStatus: "EXISTS_AND_REGISTERED",
        filings: [
          generateTaxFiling({ identifier: "SALES_TAX", dueDate: "2022-01-17" }),
          generateTaxFiling({ identifier: "PASS_THROUGH_ALTERNATIVE_INCOME_TAX", dueDate: "2022-02-16" }),
          generateTaxFiling({ identifier: "TRANSMIT_1095_FORMS", dueDate: "2022-03-01" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-04-09" }),
          generateTaxFiling({ identifier: "PROPERTY_TAX", dueDate: "2022-07-01" }),
        ],
      });
    } else if (entityId === "2222222222") {
      return Promise.resolve({
        entityIdStatus: "EXISTS_NOT_REGISTERED",
        filings: [],
      });
    } else {
      return Promise.resolve({
        entityIdStatus: "NOT_FOUND",
        filings: [],
      });
    }
  };

  return {
    fetchForEntityId,
  };
};

const generateTaxFiling = (overrides: Partial<TaxFiling>): TaxFiling => {
  return {
    identifier: `some-identifier-${randomInt()}`,
    dueDate: dayjs().format("YYYY-MM-DD"),
    ...overrides,
  };
};

const randomInt = (length = 8): number =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );
