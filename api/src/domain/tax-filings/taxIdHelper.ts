import { TaxFilingCalendarEvent } from "@shared/calendarEvent";
import { TaxFilingResult, TaxIdentifierToIdsRecord } from "src/domain/types";

export const slugifyTaxId = (id: string): string => {
  return id.trim().replaceAll(" ", "").replaceAll("/", "_").toLowerCase();
};

export const getTaxIds = (id: string, taxIdentifierToIdsRecord: TaxIdentifierToIdsRecord = {}): string[] => {
  const val = slugifyTaxId(id);
  return taxIdentifierToIdsRecord[val] ?? [val];
};

type TaxIdsToFilingsRecord = Record<string, TaxFilingCalendarEvent[]>;

const getTaxIdsToFilingsRecord = (
  result: TaxFilingResult,
  taxIdentifierToIdsRecord?: TaxIdentifierToIdsRecord
): TaxIdsToFilingsRecord => {
  return getTaxIds(result.Id, taxIdentifierToIdsRecord).reduce(
    (accumulator: TaxIdsToFilingsRecord, identifier: string) => {
      accumulator[identifier] = result.Values.map((value) => {
        return {
          identifier,
          dueDate: dateToShortISO(value),
          calendarEventType: "TAX-FILING",
        };
      });
      return accumulator;
    },
    {}
  );
};

export const flattenDeDupAndConvertTaxFilings = (
  results: TaxFilingResult[],
  taxIdentifierToIdsRecord?: TaxIdentifierToIdsRecord
): TaxFilingCalendarEvent[] => {
  const arrayOfFilingsRecords = results.map((result) => {
    return getTaxIdsToFilingsRecord(result, taxIdentifierToIdsRecord);
  });
  const deDupedRecordOfTaxFilingArrays = Object.assign({}, ...arrayOfFilingsRecords);
  const arrayOfTaxFilingArrays = Object.values(deDupedRecordOfTaxFilingArrays) as TaxFilingCalendarEvent[][];
  return arrayOfTaxFilingArrays.flat();
};

export const dateToShortISO = (date: string): string => {
  return new Date(date).toISOString().split("T")[0];
};
