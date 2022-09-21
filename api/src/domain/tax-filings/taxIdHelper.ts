import { TaxFiling } from "@shared/taxFiling";
import { TaxFilingResult, TaxIdentifierToIdsRecord } from "src/domain/types";

export const slugifyTaxId = (id: string) => id.trim().replaceAll(" ", "").replaceAll("/", "_").toLowerCase();

export const getTaxIds = (id: string, taxIdentifierToIdsRecord: TaxIdentifierToIdsRecord = {}): string[] => {
  const val = slugifyTaxId(id);
  return taxIdentifierToIdsRecord[val] ?? [val];
};

type TaxIdsToFilingsRecord = Record<string, TaxFiling[]>;

const getTaxIdsToFilingsRecord = (
  result: TaxFilingResult,
  taxIdentifierToIdsRecord?: TaxIdentifierToIdsRecord
): TaxIdsToFilingsRecord => {
  return getTaxIds(result.Id, taxIdentifierToIdsRecord).reduce(
    (accumulator: TaxIdsToFilingsRecord, identifier: string) => {
      accumulator[identifier] = result.Values.map((value) => ({
        identifier,
        dueDate: dateToShortISO(value),
      }));
      return accumulator;
    },
    {}
  );
};

export const flattenDeDupAndConvertTaxFilings = (
  results: TaxFilingResult[],
  taxIdentifierToIdsRecord?: TaxIdentifierToIdsRecord
): TaxFiling[] => {
  const arrayOfFilingsRecords = results.map((result) =>
    getTaxIdsToFilingsRecord(result, taxIdentifierToIdsRecord)
  );
  const deDupedRecordOfTaxFilingArrays = Object.assign({}, ...arrayOfFilingsRecords);
  const arrayOfTaxFilingArrays = Object.values(deDupedRecordOfTaxFilingArrays) as TaxFiling[][];
  return arrayOfTaxFilingArrays.flat();
};

export const dateToShortISO = (date: string) => new Date(date).toISOString().split("T")[0];
