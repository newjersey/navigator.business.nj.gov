/* eslint-disable @typescript-eslint/no-explicit-any */

import { getCost } from "@/components/tasks/business-formation/billing/getCost";
import { getMergedConfig } from "@/contexts/configContext";
import { allFormationLegalTypes, FormationLegalType } from "@businessnjgovnavigator/shared/formationData";

const Config = getMergedConfig();

describe("getCost", () => {
  for (const legalStructureId of allFormationLegalTypes) {
    describe("certified copy of formation", () => {
      it(`uses default cost for ${legalStructureId}`, async () => {
        const certifiedCopyCost = Number.parseInt(
          Config.formation.fields.certifiedCopyOfFormationDocument.cost
        );
        expect(getCost("certifiedCopyOfFormationDocument", legalStructureId)).toEqual(certifiedCopyCost);
      });
    });
  }

  describe("official formation document", () => {
    const overriddenCostIds: FormationLegalType[] = ["nonprofit"];
    const defaultCostIds = allFormationLegalTypes.filter((it) => !overriddenCostIds.includes(it));

    for (const legalStructureId of defaultCostIds) {
      it(`uses default cost for ${legalStructureId}`, async () => {
        const officialFormationCost = Number.parseInt(Config.formation.fields.officialFormationDocument.cost);
        expect(getCost("officialFormationDocument", legalStructureId)).toEqual(officialFormationCost);
      });
    }

    for (const legalStructureId of overriddenCostIds) {
      it(`uses override cost for ${legalStructureId}`, async () => {
        const standingCost = Number.parseInt(
          (Config.formation.fields.officialFormationDocument.overrides as any)[legalStructureId].cost
        );
        expect(getCost("officialFormationDocument", legalStructureId)).toEqual(standingCost);
      });
    }
  });

  describe("certificate of good standing", () => {
    const overriddenCostIds: FormationLegalType[] = [
      "s-corporation",
      "c-corporation",
      "limited-partnership",
      "foreign-nonprofit",
    ];
    const defaultCostIds = allFormationLegalTypes.filter((it) => !overriddenCostIds.includes(it));

    for (const legalStructureId of defaultCostIds) {
      it(`uses default cost for ${legalStructureId}`, async () => {
        const standingCost = Number.parseInt(Config.formation.fields.certificateOfStanding.cost);
        expect(getCost("certificateOfStanding", legalStructureId)).toEqual(standingCost);
      });
    }

    for (const legalStructureId of overriddenCostIds) {
      it(`uses override cost for ${legalStructureId}`, async () => {
        const standingCost = Number.parseInt(
          (Config.formation.fields.certificateOfStanding.overrides as any)[legalStructureId].cost
        );
        expect(getCost("certificateOfStanding", legalStructureId)).toEqual(standingCost);
      });
    }
  });
});
