import { Municipality } from "../types/types";
import { AirtableMunicipality, selectAll } from "../airtable/airtableClient";

export const getAllMunicipalities = async (): Promise<Municipality[]> => {
  const municipalities = await selectAll<AirtableMunicipality>("Municipalities", "Grid view");
  return municipalities.map((municipality) => ({
    displayName: municipality["Town Name"],
    id: municipality.id,
    name: municipality.Municipality,
    county: municipality["County Name"][0],
  }));
};
