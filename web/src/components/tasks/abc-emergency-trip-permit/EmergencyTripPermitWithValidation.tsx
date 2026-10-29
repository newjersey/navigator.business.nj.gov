import type { ReactElement } from "react";
import { EmergencyTripPermit } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermit";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";

export const EmergencyTripPermitWithValidation = (): ReactElement => {
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <EmergencyTripPermit />
    </DataFormErrorMapContext.Provider>
  );
};
