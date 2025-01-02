/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { getMergedConfig } from "@/contexts/configContext";
import { FormationPageHelpers, useSetupInitialMocks } from "@/test/helpers/helpers-formation";
import {
  FormationFormData,
  FormationIncorporator,
  FormationLegalType,
  FormationMember,
  generateFormationFormData,
  generateFormationIncorporator,
  generateFormationMember,
  generateFormationSigner,
  generateFormationUSAddress
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...vi.requireActual("@mui/material"),
    useMediaQuery: vi.fn(),
  };
}

const Config = getMergedConfig();

vi.mock("@mui/material", () => mockMaterialUI());
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/data-hooks/useDocuments");
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: vi.fn(),
  getCompletedFiling: vi.fn(),
  searchBusinessName: vi.fn(),
}));

describe("Formation - ContactsStep", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSetupInitialMocks();
  });

  describe("when llp", () => {
    const legalStructureId: FormationLegalType = "limited-liability-partnership";

    it("auto-fills fields from userData if it exists", async () => {
      const formationFormData = generateFormationFormData(
        {
          members: undefined,
          signers: [
            generateFormationSigner({
              name: `signer 1`,
              signature: true,
            }),
            generateFormationSigner({
              name: `signer 2`,
              signature: true,
            }),
            generateFormationSigner({
              name: `signer 3`,
              signature: true,
            }),
          ],
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByText(Config.formation.fields.signers.label)).toBeInTheDocument();
      expect(
        screen.getByText(
          Config.formation.fields.signers.overrides["limited-liability-partnership"].description
        )
      ).toBeInTheDocument();

      expect(screen.queryByTestId("addresses-members")).not.toBeInTheDocument();
      expect(page.getInputElementByLabel("Signer 0").value).toBe("signer 1");
      expect(page.getInputElementByLabel("Signer 1").value).toBe("signer 2");
      expect(page.getInputElementByLabel("Signer 2").value).toBe("signer 3");
    });
  });

  describe("when lp", () => {
    const legalStructureId = "limited-partnership";

    it("auto-fills fields from userData if it exists", async () => {
      const formationFormData = generateFormationFormData(
        {
          incorporators: [
            {
              name: "Ava Curie",
              businessLocationType: "US",
              addressCity: "Miami",
              addressLine1: "160 Something Ave",
              addressLine2: "Apt 1",
              addressState: { name: "Florida", shortCode: "FL" },
              addressCountry: "US",
              addressZipCode: "32003",
              title: "General Partner",
              signature: true,
            },
            generateFormationIncorporator({
              signature: false,
              title: "General Partner",
              ...generateFormationUSAddress({}),
            }),
          ],
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.queryByTestId("addresses-members")).not.toBeInTheDocument();

      expect(screen.getByTestId("addresses-incorporators")).toBeInTheDocument();

      expect(screen.getByText(Config.formation.fields.incorporators.label)).toBeInTheDocument();
      expect(
        screen.getByText(
          Config.formation.fields.incorporators.overrides["limited-partnership"].description.split("\n\n")[0]
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          Config.formation.fields.incorporators.overrides["limited-partnership"].description.split("\n\n")[1]
        )
      ).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.incorporators.placeholder)).not.toBeInTheDocument();

      expect(screen.getByText("Ava Curie")).toBeInTheDocument();
      expect(screen.getByText("160 Something Ave", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Apt 1", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Miami", { exact: false })).toBeInTheDocument();
      expect(screen.getByTestId("incorporators-0")).toHaveTextContent("Florida");
      expect(screen.getByText("32003", { exact: false })).toBeInTheDocument();
      expect(page.getSignerBox(0, "incorporators")).toEqual(true);
    });
  });

  describe("when corp", () => {
    const legalStructureId = "s-corporation";

    it("auto-fills fields from userData if it exists", async () => {
      const members: FormationMember[] = [
        {
          name: "Jane Parks",
          addressCity: "New Orleans",
          addressLine1: "1600 Somewhere Drive",
          addressLine2: "PH",
          addressState: { name: "Louisiana", shortCode: "LA" },
          addressCountry: "US",
          businessLocationType: "US",
          addressZipCode: "70032",
        },
      ];
      const incorporators: FormationIncorporator[] = [
        {
          name: "Emily Jones",
          addressCity: "Miami",
          addressLine1: "160 Something Ave",
          addressLine2: "3rd Floor",
          addressState: { name: "Florida", shortCode: "FL" },
          addressCountry: "US",
          addressZipCode: "34997",
          businessLocationType: "US",
          title: "Incorporator",
          signature: true,
        },
      ];
      const formationFormData = generateFormationFormData({ members, incorporators }, { legalStructureId });

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.directors.label)).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.directors.description.split("\n\n")[0])
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.directors.description.split("\n\n")[1])
      ).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.directors.placeholder)).not.toBeInTheDocument();
      expect(screen.getByText(members[0].name)).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressZipCode, { exact: false })).toBeInTheDocument();

      expect(screen.getByTestId("addresses-incorporators")).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.incorporators.label)).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.incorporators.description.split("\n\n")[0])
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.incorporators.description.split("\n\n")[1])
      ).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.incorporators.placeholder)).not.toBeInTheDocument();
      expect(screen.getByText(incorporators[0].name)).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressZipCode, { exact: false })).toBeInTheDocument();
      expect(page.getSignerBox(0, "incorporators")).toEqual(true);
    });
  });

  describe("when nonprofit", () => {
    const legalStructureId = "nonprofit";

    const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
      await page.stepperClickToReviewStep();
      await page.clickSubmit();
      await page.stepperClickToContactsStep();
    };

    it("auto-fills fields from userData if it exists", async () => {
      const members: FormationMember[] = [
        {
          name: "Luke Potter",
          addressCity: "Seattle",
          addressLine1: "989 Broadway",
          addressLine2: "Unit 123",
          addressState: { name: "Washington", shortCode: "WA" },
          addressCountry: "US",
          businessLocationType: "US",
          addressZipCode: "98001",
        },
      ];
      const incorporators: FormationIncorporator[] = [
        {
          name: "Marie Smith",
          addressCity: "Miami",
          addressLine1: "433 Some Place",
          addressLine2: "Unit 4",
          addressState: { name: "Florida", shortCode: "FL" },
          addressCountry: "US",
          addressZipCode: "32003",
          businessLocationType: "US",
          title: "Incorporator",
          signature: true,
        },
      ];
      const formationFormData = generateFormationFormData({ members, incorporators }, { legalStructureId });

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.trustees.label)).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.trustees.description.split("\n\n")[0])
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.trustees.description.split("\n\n")[1])
      ).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.trustees.placeholder)).not.toBeInTheDocument();
      expect(screen.getByText(members[0].name)).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressZipCode, { exact: false })).toBeInTheDocument();

      expect(screen.getByTestId("addresses-incorporators")).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.incorporators.label)).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.incorporators.description.split("\n\n")[0])
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.formation.fields.incorporators.description.split("\n\n")[1])
      ).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.incorporators.placeholder)).not.toBeInTheDocument();
      expect(screen.getByText(incorporators[0].name)).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressZipCode, { exact: false })).toBeInTheDocument();
      expect(page.getSignerBox(0, "incorporators")).toEqual(true);
    });

    it("has an error if there are no trustees", async () => {
      const members = [generateFormationMember({})];
      const incorporators = [generateFormationIncorporator({})];
      const formationFormData = generateFormationFormData({ members, incorporators }, { legalStructureId });
      const page = await getPageHelper({ legalStructureId }, formationFormData);
      await attemptApiSubmission(page);
      expect(screen.getByText(Config.formation.fields.trustees.error)).toBeInTheDocument();
    });

    it("has an error if there are fewer than 3 trustees", async () => {
      const members = [generateFormationMember({}), generateFormationMember({})];
      const incorporators = [generateFormationIncorporator({})];
      const formationFormData = generateFormationFormData({ members, incorporators }, { legalStructureId });
      const page = await getPageHelper({ legalStructureId }, formationFormData);
      await attemptApiSubmission(page);
      expect(screen.getByText(Config.formation.fields.trustees.error)).toBeInTheDocument();
    });

    it("has no error if at least 3 trustees", async () => {
      const members = [generateFormationMember({}), generateFormationMember({}), generateFormationMember({})];
      const incorporators = [generateFormationIncorporator({})];
      const formationFormData = generateFormationFormData({ members, incorporators }, { legalStructureId });
      const page = await getPageHelper({ legalStructureId }, formationFormData);
      await attemptApiSubmission(page);
      expect(screen.queryByText(Config.formation.fields.trustees.error)).not.toBeInTheDocument();
    });
  });

  describe("when llc", () => {
    const legalStructureId = "limited-liability-company";

    it("auto-fills fields from userData if it exists", async () => {
      const members: FormationMember[] = [
        {
          name: "Rosa Thomas",
          addressCity: "Philadephia",
          addressLine1: "1439 Pennsylvania Road",
          addressLine2: "Apt 6B",
          addressState: { name: "Pennsylvania", shortCode: "PA" },
          addressCountry: "US",
          businessLocationType: "US",
          addressZipCode: "19019",
        },
      ];
      const formationFormData = generateFormationFormData(
        {
          members,
          signers: [
            generateFormationSigner({
              name: `signer 1`,
              signature: true,
              title: "Authorized Representative",
            }),
            generateFormationSigner({
              name: `signer 2`,
              signature: true,
              title: "Authorized Representative",
            }),
            generateFormationSigner({
              name: `signer 3`,
              signature: true,
              title: "Authorized Representative",
            }),
          ],
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.members.label)).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.members.placeholder)).not.toBeInTheDocument();
      expect(screen.getByText(members[0].name)).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressZipCode, { exact: false })).toBeInTheDocument();

      expect(screen.getByText(Config.formation.fields.signers.label)).toBeInTheDocument();
      expect(page.getInputElementByLabel("Signer 0").value).toBe("signer 1");
      expect(page.getInputElementByLabel("Signer 1").value).toBe("signer 2");
      expect(page.getInputElementByLabel("Signer 2").value).toBe("signer 3");
    });
  });

  describe("when flc", () => {
    const legalStructureId = "limited-liability-company";
    const businessPersona = "FOREIGN";

    it("auto-fills fields from userData if it exists", async () => {
      const formationFormData: Partial<FormationFormData> = {
        signers: [
          generateFormationSigner({
            name: `signer 1`,
            signature: true,
            title: "Authorized Representative",
          }),
          generateFormationSigner({
            name: `signer 2`,
            signature: true,
            title: "General Partner",
          }),
          generateFormationSigner({
            name: `signer 3`,
            signature: true,
            title: "Authorized Representative",
          }),
        ],
      };
      const page = await getPageHelper({ legalStructureId, businessPersona }, formationFormData);

      expect(screen.getByText(Config.formation.fields.signers.label)).toBeInTheDocument();
      expect(
        screen.getByText(
          Config.formation.fields.signers.overrides["foreign-limited-liability-company"].description
        )
      ).toBeInTheDocument();

      expect(page.getInputElementByLabel("Signer 0").value).toBe("signer 1");
      expect(page.getInputElementByTestId("signer-title-0").value).toBe("Authorized Representative");
      expect(page.getInputElementByLabel("Signer 1").value).toBe("signer 2");
      expect(page.getInputElementByTestId("signer-title-1").value).toBe("General Partner");
      expect(page.getInputElementByLabel("Signer 2").value).toBe("signer 3");
      expect(page.getInputElementByTestId("signer-title-2").value).toBe("Authorized Representative");
    });
  });
});
