import { CircularIndicator } from "@/components/CircularIndicator";
import { TaskBody } from "@/components/TaskBody";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { exportComponentsAsPDF } from "@/lib/roadmap/exportRoadmapAsPdf";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

const ExportPage = (): ReactElement => {
  const { business } = useUserData();
  const { roadmap } = useRoadmap();
  const [downloadIndicator, setDownloadIndicator] = useState(false);
  const router = useRouter();
  const FEATURE_EXPORT_PDF = process.env.FEATURE_EXPORT_PDF === "true";
  const { Config } = useConfig();

  useEffect(() => {
    if (!FEATURE_EXPORT_PDF) router.push(ROUTES.dashboard);
  }, [router, FEATURE_EXPORT_PDF]);

  if (!FEATURE_EXPORT_PDF || !roadmap || !business) return <CircularIndicator />;

  return (
    <div className={downloadIndicator ? "" : ""}>
      {downloadIndicator ? <CircularIndicator displayText={"Downloading..."} /> : <></>}
      <div className={"margin-top-8 margin-left-8"}>
        <PrimaryButton
          isColor="primary"
          onClick={(): void => {
            exportComponentsAsPDF({
              componentIds: roadmap ? ["roadmap", ...roadmap.tasks.map((task) => task.id)] : [],
              prePdfProcessingCallback: () => setDownloadIndicator(true),
              postPdfProcessingCallback: () => setDownloadIndicator(false),
            });
          }}
          dataTestId="downloadPdf"
          isLargeButton
        >
          {Config.exportPdf.downloadButtonText}
        </PrimaryButton>
      </div>
      <div className={"pdfPageWidthInPx margin-x-8 margin-y-3"}>
        <div id="roadmap" data-testid="roadmap">
          <Roadmap />
        </div>
        {roadmap.tasks.map((task) => (
          <div id={task.id} key={task.id} data-testid={task.id} className={"padding-4"}>
            <TaskBody task={task} roadmap={roadmap} business={business} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportPage;
