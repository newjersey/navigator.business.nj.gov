import { TaxFilingClient } from "../domain/types";
import { TaxFiling, TaxFilingData } from "@shared/taxFiling";
import dayjs from "dayjs";

export const FakeTaxFilingClient = (): TaxFilingClient => {
  const fetchForEntityId = (entityId: string): Promise<TaxFilingData> => {
    if (entityId === "0000000000") {
      return Promise.resolve({
        entityIdStatus: "EXISTS_AND_REGISTERED",
        filings: [
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2021-12-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-01-31" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-01-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-02-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-03-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-04-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-05-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-06-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-07-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-08-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-09-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-10-03" }),
        ],
      });
    } else if (entityId === "1111111111") {
      return Promise.resolve({
        entityIdStatus: "EXISTS_AND_REGISTERED",
        filings: [
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2021-12-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-01-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-02-03" }),
          generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-02-01" }),
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
