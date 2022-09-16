import { TaxFiling } from "@shared/taxFiling";
import { TaxFilingResults } from "src/domain/types";

export const reformatTaxId = (id: string) => id.trim().replaceAll(" ", "").replaceAll("/", "_").toLowerCase();

export const getTaxIds = (id: string, map: Record<string, string[]> = {}): string[] => {
  const val = reformatTaxId(id);
  return map[val] ?? [val];
};

export const flattenDeDupAndMapTaxFilings = (
  results: TaxFilingResults,
  map?: Record<string, string[]>
): TaxFiling[] =>
  Object.values(
    results?.reduce(
      (accumulator: Record<string, TaxFiling[]>, result) => ({
        ...accumulator,
        ...getTaxIds(result.Id, map).reduce(
          (accumulator: Record<string, TaxFiling[]>, identifier: string) => {
            accumulator[identifier] = result.Values.map((value) => ({
              identifier,
              dueDate: dateToShortISO(value),
            }));
            return accumulator;
          },
          {}
        ),
      }),
      {}
    ) ?? {}
  ).flat() ?? [];

export const dateToShortISO = (date: string) => new Date(date).toISOString().split("T")[0];
