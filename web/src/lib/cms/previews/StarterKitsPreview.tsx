import { StarterKitsBody } from "@/components/starter-kits/StarterKitsBody";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { insertIndustryContent, insertRoadmapSteps } from "@/lib/domain-logic/starterKits";
import { generateRoadmap } from "@/test/factories";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { getIndustries, Industry } from "@businessnjgovnavigator/shared/industry";
import { ReactElement } from "react";

const StarterKitsPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const industry = getIndustries()[0] as Industry;
  const roadmap = generateRoadmap({});

  const heroTitle = insertIndustryContent(
    config.starterKits.hero.title,
    industry.id,
    industry.name,
  );

  const solutionsTitle = insertIndustryContent(
    config.starterKits.solutions.title,
    industry.id,
    industry.name,
  );

  const stepsTitle = insertRoadmapSteps(
    insertIndustryContent(config.starterKits.steps.title, industry.id, industry.name),
    roadmap.steps.length,
  );

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <StarterKitsBody
          heroTitle={heroTitle}
          solutionsTitle={solutionsTitle}
          roadmap={roadmap}
          stepsTitle={stepsTitle}
          industry={industry}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default StarterKitsPreview;
