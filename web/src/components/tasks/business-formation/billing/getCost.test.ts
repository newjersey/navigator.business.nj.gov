/* eslint-disable @typescript-eslint/no-explicit-any */

import { getCost } from "@/components/tasks/business-formation/billing/getCost";
import { getMergedConfig } from "@/contexts/configContext";
import { FormationLegalType } from "@businessnjgovnavigator/shared/formationData";

const Config = getMergedConfig();

describe("getCost", () => {
  const defaultCostIds: FormationLegalType[] = ["limited-liability-company", "limited-liability-partnership"];
  const overriddenCostIds: FormationLegalType[] = ["s-corporation", "c-corporation", "limited-partnership"];
  const allLegalTypes = [...defaultCostIds, ...overriddenCostIds];

  for (const legalStructureId of allLegalTypes) {
    describe("official formation document", () => {
      it(`uses default cost for ${legalStructureId}`, async () => {
        const officialFormationCost = Number.parseInt(Config.formation.fields.officialFormationDocument.cost);
        expect(getCost("officialFormationDocument", legalStructureId)).toEqual(officialFormationCost);
      });
    });

    describe("certified copy of formation", () => {
      it(`uses default cost for ${legalStructureId}`, async () => {
        const certifiedCopyCost = Number.parseInt(
          Config.formation.fields.certifiedCopyOfFormationDocument.cost,
        );
        expect(getCost("certifiedCopyOfFormationDocument", legalStructureId)).toEqual(certifiedCopyCost);
      });
    });
  }

  describe("certificate of good standing", () => {
    for (const legalStructureId of defaultCostIds) {
      it(`uses default cost for ${legalStructureId}`, async () => {
        const standingCost = Number.parseInt(Config.formation.fields.certificateOfStanding.cost);
        expect(getCost("certificateOfStanding", legalStructureId)).toEqual(standingCost);
      });
    }

    for (const legalStructureId of overriddenCostIds) {
      it(`uses override cost for ${legalStructureId}`, async () => {
        const standingCost = Number.parseInt(
          (Config.formation.fields.certificateOfStanding.overrides as any)[legalStructureId].cost,
        );
        expect(getCost("certificateOfStanding", legalStructureId)).toEqual(standingCost);
      });
    }
  });
});
