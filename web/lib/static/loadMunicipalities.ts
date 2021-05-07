import { Municipality } from "@/lib/types/types";
import * as api from "@/lib/api-client/apiClient";

export const loadAllMunicipalities = async (): Promise<Municipality[]> => {
  const municipalities = await api.getMunicipalities();
  return municipalities.map((municipality) => ({
    displayName: municipality.townDisplayName,
    id: municipality.id,
    name: municipality.townName,
    county: municipality.countyName,
  }));
};
