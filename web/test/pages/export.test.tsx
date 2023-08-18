import { ROUTES } from "@/lib/domain-logic/routes";
import { exportComponentsAsPDF } from "@/lib/roadmap/exportRoadmapAsPdf";
import ExportPage from "@/pages/export";
import { generateStep, generateTask } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/exportRoadmapAsPdf", () => ({ exportComponentsAsPDF: jest.fn() }));

const mockExportComponentsAsPDF = exportComponentsAsPDF as jest.Mocked<typeof exportComponentsAsPDF>;

describe("Export page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockRoadmap({
      steps: [
        generateStep({
          stepNumber: 1
        }),
        generateStep({
          stepNumber: 2
        })
      ],
      tasks: [
        generateTask({ stepNumber: 1, id: "one" }),
        generateTask({ stepNumber: 1, id: "two" }),
        generateTask({ stepNumber: 2, id: "three" }),
        generateTask({ stepNumber: 2, id: "four" })
      ]
    });
  });

  it("renders download button", () => {
    render(<ExportPage />);
    expect(screen.getByTestId("downloadPdf")).toBeInTheDocument();
  });

  it("renders roadmap", () => {
    render(<ExportPage />);
    expect(screen.getByTestId("one")).toBeInTheDocument();
    expect(screen.getByTestId("two")).toBeInTheDocument();
    expect(screen.getByTestId("three")).toBeInTheDocument();
    expect(screen.getByTestId("four")).toBeInTheDocument();
  });

  it("calls exportComponentsAsPDF on button click", () => {
    render(<ExportPage />);
    expect(mockExportComponentsAsPDF).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("downloadPdf"));
    expect(mockExportComponentsAsPDF).toHaveBeenCalledTimes(1);
    expect(mockExportComponentsAsPDF).toHaveBeenCalledWith({
      componentIds: ["roadmap", "one", "two", "three", "four"],
      prePdfProcessingCallback: expect.any(Function),
      postPdfProcessingCallback: expect.any(Function)
    });
  });

  describe("FEATURE_EXPORT_PDF is false", () => {
    const envVariablesCopy = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...envVariablesCopy, FEATURE_EXPORT_PDF: "false" };
    });

    afterEach(() => {
      process.env = envVariablesCopy;
    });

    it("routes to dashboard", () => {
      render(<ExportPage />);
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });
});
