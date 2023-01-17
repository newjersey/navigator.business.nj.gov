/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { displayContent, getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { useSetupInitialMocks } from "@/test/helpers/helpers-formation";
import {
  FormationFormData,
  FormationIncorporator,
  FormationLegalType,
  FormationMember,
  generateFormationFormData,
  generateFormationIncorporator,
  generateFormationSigner,
  generateFormationUSAddress,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - ContactsStep", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
              name: "Donald Whatever",
              businessLocationType: "US",
              addressCity: "Miami",
              addressLine1: "160 Something Ave NW",
              addressLine2: "Office of Whatever",
              addressState: { name: "Florida", shortCode: "FL" },
              addressCountry: "US",
              addressZipCode: "20501",
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

      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText("Donald Whatever")).toBeInTheDocument();
      expect(screen.getByText("160 Something Ave NW", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Office of Whatever", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Miami", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Florida", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("20501", { exact: false })).toBeInTheDocument();
      expect(page.getSignerBox(0, "incorporators")).toEqual(true);
    });
  });

  describe("when corp", () => {
    const legalStructureId = "s-corporation";

    it("auto-fills fields from userData if it exists", async () => {
      const members: FormationMember[] = [
        {
          name: "Joe Biden",
          addressCity: "Washington",
          addressLine1: "1600 Pennsylvania Ave NW",
          addressLine2: "Office of the President",
          addressState: { name: "District of Columbia", shortCode: "DC" },
          addressCountry: "US",
          businessLocationType: "US",
          addressZipCode: "20500",
        },
      ];
      const incorporators: FormationIncorporator[] = [
        {
          name: "Donald Whatever",
          addressCity: "Miami",
          addressLine1: "160 Something Ave NW",
          addressLine2: "Office of Whatever",
          addressState: { name: "Florida", shortCode: "FL" },
          addressCountry: "US",
          addressZipCode: "20501",
          businessLocationType: "US",
          title: "Incorporator",
          signature: true,
        },
      ];
      const formationFormData = generateFormationFormData(
        {
          members,
          incorporators,
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText(members[0].name)).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressZipCode, { exact: false })).toBeInTheDocument();

      expect(screen.getByTestId("addresses-incorporators")).toBeInTheDocument();
      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText(incorporators[0].name)).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressZipCode, { exact: false })).toBeInTheDocument();
      expect(page.getSignerBox(0, "incorporators")).toEqual(true);
    });
  });

  describe("when llc", () => {
    const legalStructureId = "limited-liability-company";

    it("auto-fills fields from userData if it exists", async () => {
      const members: FormationMember[] = [
        {
          name: "Joe Biden",
          addressCity: "Washington",
          addressLine1: "1600 Pennsylvania Ave NW",
          addressLine2: "Office of the President",
          addressState: { name: "District of Columbia", shortCode: "DC" },
          addressCountry: "US",
          businessLocationType: "US",
          addressZipCode: "20500",
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
      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText(members[0].name)).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressZipCode, { exact: false })).toBeInTheDocument();
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
      // screen.debug(undefined, Infinity);
      expect(page.getInputElementByLabel("Signer 0").value).toBe("signer 1");
      expect(page.getInputElementByTestId("signer-title-0").value).toBe("Authorized Representative");
      expect(page.getInputElementByLabel("Signer 1").value).toBe("signer 2");
      expect(page.getInputElementByTestId("signer-title-1").value).toBe("General Partner");
      expect(page.getInputElementByLabel("Signer 2").value).toBe("signer 3");
      expect(page.getInputElementByTestId("signer-title-2").value).toBe("Authorized Representative");
    });
  });
});
