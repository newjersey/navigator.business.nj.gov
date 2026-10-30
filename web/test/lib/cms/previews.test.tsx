import fs from "node:fs";
import path from "node:path";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { render, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import * as api from "@/lib/api-client/apiClient";
import { applyTheme } from "@/lib/cms/helpers/applyTheme";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";

jest.mock("@/lib/api-client/apiClient");
jest.mock("@/lib/auth/sessionHelper");

const mockApi = api as jest.Mocked<typeof api>;

const PREVIEWS_DIR = path.join(__dirname, "..", "..", "..", "src", "lib", "cms", "previews");

// Previews that branch on the entry slug; must match collection names in src/pages/mgmt/cms.tsx
const SLUGS_BY_PREVIEW: Record<string, string[]> = {
  "AnytimeActionTaxClearancePreview.tsx": [
    "taxClearanceCertificate-step1",
    "taxClearanceCertificate-step2",
    "taxClearanceCertificate-step3",
    "taxClearanceCertificate-shared",
    "taxClearanceCertificate-download",
  ],
  "CannabisLicensePreview.tsx": [
    "cannabisLicense-1",
    "cannabisLicenseAnnual-2",
    "cannabisLicenseConditional-2",
  ],
  "CannabisPriorityStatusPreview.tsx": ["cannabisPriority-1", "cannabisPriority-2"],
  "CigaretteLicensePreview.tsx": [
    "cigaretteLicense-step1",
    "cigaretteLicense-step2",
    "cigaretteLicense-step3",
    "cigaretteLicense-step4",
    "cigaretteLicense-shared",
  ],
  "PassengerTransportCdlPreview.tsx": [
    "passenger-transport-cdl-tab1",
    "passenger-transport-cdl-tab2",
  ],
};

const previewFileNames = fs
  .readdirSync(PREVIEWS_DIR)
  .filter((fileName) => fileName.endsWith(".tsx"))
  .sort();

const slugAgnosticCases = previewFileNames
  .filter((fileName) => !(fileName in SLUGS_BY_PREVIEW))
  .map((fileName) => ({ fileName, slug: "preview-entry" }));

const slugDrivenCases = previewFileNames
  .filter((fileName) => fileName in SLUGS_BY_PREVIEW)
  .flatMap((fileName) => SLUGS_BY_PREVIEW[fileName].map((slug) => ({ fileName, slug })));

const createPreviewProps = (slug: string): PreviewProps => {
  const data = { slug };
  return {
    entry: {
      getIn: (): Record<string, unknown> => data,
      toJS: (): { slug: string } => data,
    },
    fieldsMetaData: {},
    widgetFor: (): undefined => undefined,
    widgetsFor: (): undefined => undefined,
    getAsset: (): undefined => undefined,
    window: window,
    document: document,
  };
};

const renderPreview = async (fileName: string, slug: string): Promise<HTMLElement> => {
  const previewModule = await import(path.join(PREVIEWS_DIR, fileName));
  const Preview = previewModule.default as (props: PreviewProps) => ReactElement;
  const Themed = applyTheme(Preview);

  const view = render(<Themed {...createPreviewProps(slug)} />);
  // flush effects that kick off async work; setupTests turns act warnings into failures
  await waitFor(() => view.container);

  return view.container;
};

describe("cms previews", () => {
  beforeAll(() => {
    // jsdom does not implement createObjectURL; previews that render a blob need it
    URL.createObjectURL = jest.fn(() => "blob:preview");
    URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    // CigaretteLicenseConfirmationPreview checks payment on mount
    mockApi.cigaretteLicenseConfirmPayment.mockResolvedValue(
      generateUserDataForBusiness(generateBusiness({})),
    );
  });

  it("finds preview components to test", () => {
    expect(previewFileNames.length).toBeGreaterThan(0);
  });

  it.each(slugAgnosticCases)("renders $fileName", async ({ fileName, slug }) => {
    await expect(renderPreview(fileName, slug)).resolves.toBeDefined();
  });

  // Slug-driven previews render nothing when no branch matches, so an empty render
  // means the slug no longer lines up with the preview's branches.
  it.each(slugDrivenCases)("renders $fileName for slug $slug", async ({ fileName, slug }) => {
    const container = await renderPreview(fileName, slug);
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
