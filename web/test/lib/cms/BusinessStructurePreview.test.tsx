import { applyTheme } from "@/lib/cms/helpers/applyTheme";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import BusinessStructurePreview from "@/lib/cms/previews/BusinessStructurePreview";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient");
jest.mock("@/lib/auth/sessionHelper");

const ThemedPreview = applyTheme(BusinessStructurePreview);

const createPreviewProps = (slug: string, data: Record<string, unknown>): PreviewProps => {
  return {
    entry: {
      getIn: (): Record<string, unknown> => data,
      toJS: (): { slug: string } => ({ slug }),
    },
    fieldsMetaData: {},
    widgetFor: (): undefined => undefined,
    widgetsFor: (): undefined => undefined,
    getAsset: (): undefined => undefined,
    window: window,
    document: document,
  };
};

describe("BusinessStructurePreview", () => {
  it("shows edited radio copy and both business structure groups", async () => {
    const editedLabel = "Edited structure label";
    const editedDescription = "Edited structure description";
    const data = {
      profileDefaults: {
        fields: {
          legalStructureId: {
            default: {
              optionLabels: { "limited-partnership": editedLabel },
              optionContent: { "limited-partnership": editedDescription },
            },
          },
        },
      },
    };

    render(<ThemedPreview {...createPreviewProps("business-structure-radio-options", data)} />);

    expect(await screen.findByText(editedLabel)).toBeInTheDocument();
    expect(screen.getByText(editedDescription)).toBeInTheDocument();
    expect(screen.getByTestId("other-business-structures-header")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getAllByTestId("business-structure-task")).toHaveLength(1);
    expect(
      screen.queryByText(getMergedConfig().taskDefaults.loadingTaskDependencies),
    ).not.toBeInTheDocument();
  });

  it("keeps both task states in the selection component preview", () => {
    render(<ThemedPreview {...createPreviewProps("business-structure-selection", {})} />);

    expect(screen.getAllByTestId("business-structure-task")).toHaveLength(2);
    expect(
      screen.queryByText(getMergedConfig().taskDefaults.loadingTaskDependencies),
    ).not.toBeInTheDocument();
  });
});
