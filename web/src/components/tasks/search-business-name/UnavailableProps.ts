import { NameAvailability } from "@businessnjgovnavigator/shared/businessNameSearch";

export interface UnavailableProps {
  submittedName: string;
  nameAvailability: NameAvailability;
  resetSearch: () => void;
}
