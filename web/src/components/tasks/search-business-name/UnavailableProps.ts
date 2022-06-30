import { NameAvailability } from "@/lib/types/types";

export interface UnavailableProps {
  submittedName: string;
  nameAvailability: NameAvailability;
  resetSearch: () => void;
}
