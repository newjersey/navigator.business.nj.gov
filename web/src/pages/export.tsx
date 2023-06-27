import { CircularIndicator } from "@/components/CircularIndicator";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { TaskBody } from "@/components/TaskBody";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { ROUTES } from "@/lib/domain-logic/routes";
import { exportComponentsAsPDF } from "@/lib/roadmap/exportRoadmapAsPdf";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

const ExportPage = (): ReactElement => {
  const { roadmap } = useRoadmap();
  const [downloadIndicator, setDownloadIndicator] = useState(false);
  const router = useRouter();
  const FEATURE_EXPORT_PDF = process.env.FEATURE_EXPORT_PDF === "true";

  useEffect(() => {
    if (!FEATURE_EXPORT_PDF) router.push(ROUTES.dashboard);
  }, [router, FEATURE_EXPORT_PDF]);

  return (
    <>
      {FEATURE_EXPORT_PDF && roadmap ? (
        <div className={downloadIndicator ? "" : ""}>
          {downloadIndicator ? <CircularIndicator displayText={"Downloading..."} /> : <></>}
          <div className={"margin-top-8 margin-left-8"}>
            <PrimaryButton
              isColor="primary"
              onClick={(): void => {
                exportComponentsAsPDF(
                  roadmap ? ["roadmap", ...roadmap.tasks.map((task) => task.id)] : [],
                  () => setDownloadIndicator(true),
                  () => setDownloadIndicator(false)
                );
              }}
              dataTestId="downloadPdf"
              isLargeButton
            >
              Download PDF
            </PrimaryButton>
          </div>
          <div className={"pdfPageWidthInPx margin-x-8 margin-y-3"}>
            <div id="roadmap" data-testid="roadmap">
              <Roadmap />
            </div>
            {roadmap.tasks.map((task) => (
              <div id={task.id} key={task.id} data-testid={task.id} className={"padding-4"}>
                <TaskBody task={task} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <CircularIndicator />
      )}
    </>
  );
};

export default ExportPage;
