import { NavBar } from "@/components/navbar/NavBar";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { Card } from "@/components/starter-kits/Card";
import { StepInfo } from "@/components/starter-kits/StepInfo";
import { getMergedConfig } from "@/contexts/configContext";
import { insertIndustryContent, insertRoadmapSteps } from "@/lib/domain-logic/starterKitsContentModifiers";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { Roadmap, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getAllStarterKitUrls, STARTER_KITS_GENERIC_SLUG, StarterKitsUrl } from "@/lib/utils/starterKits";
import type { Industry } from "@businessnjgovnavigator/shared";
import {
  createEmptyProfileData,
  LookupIndustryById,
  ProfileData,
} from "@businessnjgovnavigator/shared/index";
import type { GetStaticPathsResult } from "next";
import type { ReactElement } from "react";

interface Props {
  noAuth: boolean;
  roadmap: Roadmap;
  industry: Industry;
}

const industrySpecificStarterKitsLink = (industryId: string): void => {
  const url = new URL(window.location.toString());
  url.pathname = "onboarding";
  url.searchParams.set("industry", industryId);
  window.location.href = url.toString();
};

const StarterKitsPage = (props: Props): ReactElement => {
  const Config = getMergedConfig();

  const getTaskNamesForStep = (tasks: Task[], step: number): string[] => {
    return tasks.filter((task) => task.stepNumber === step).map((task) => task.name);
  };

  const heroTitle = insertIndustryContent(
    Config.starterKits.hero.title,
    props.industry.id,
    props.industry.name
  );

  const solutionsTitle = insertIndustryContent(
    Config.starterKits.solutions.title,
    props.industry.id,
    props.industry.name
  );

  const stepsTitle = insertRoadmapSteps(
    insertIndustryContent(Config.starterKits.steps.title, props.industry.id, props.industry.name),
    String(props.roadmap.steps.length)
  );

  return (
    <PageSkeleton landingPage={true}>
      <NavBar isSeoStarterKit={true} />
      <main className="desktop:grid-container-widescreen desktop:padding-x-7">
        <section
          aria-label="Introduction"
          className="bg-cool-extra-light window-width-shadow-cool-extra-light flex flex-justify padding-y-4 desktop:padding-y-8 padding-x-2 desktop:padding-x-0"
        >
          <div className={"text-center desktop:text-left desktop:grid-col-5"}>
            <Heading level={1} styleVariant="h1Large" className="display-only-desktop">
              {heroTitle}
              <br />
            </Heading>
            <Heading level={1} className="display-none-desktop">
              {heroTitle}
              <br />
            </Heading>
            <div className="text-base-darkest font-sans-md margin-bottom-3">
              {Config.starterKits.hero.subtitle}
            </div>
            <PrimaryButton
              isColor={"secondary-vivid-dark"}
              onClick={() => {
                analytics.event.starter_kit_landing.click.start_now_button();
                industrySpecificStarterKitsLink(props.industry.id);
              }}
              isRightMarginRemoved={true}
              isLargeButton={true}
            >
              {Config.starterKits.hero.ctaButton}
            </PrimaryButton>
          </div>

          <div className="desktop:grid-col-6 desktop:display-block display-none">
            <img className="width-100" src="/img/seo-img-main.webp" alt="" role="presentation" />
          </div>
        </section>
        <section
          aria-label="Solutions"
          className={
            "display-flex flex-column gap-5 padding-y-5 desktop:padding-y-10 padding-x-2 desktop:padding-x-0 grid-wrapper"
          }
        >
          <div className="title-section">
            <Heading level={2}>{solutionsTitle}</Heading>
            <p className="font-sans-md">{Config.starterKits.solutions.subtitle}</p>
          </div>
          <div className="display-flex flex-column gap-2 cards-section">
            <Card
              iconFilename="check-circle-icon-blue"
              title={Config.starterKits.solutions.card1.title}
              description={Config.starterKits.solutions.card1.body}
            />
            <Card
              iconFilename="dollar-circle-icon-purple"
              title={Config.starterKits.solutions.card2.title}
              description={Config.starterKits.solutions.card2.body}
            />
            <Card
              iconFilename="id-badge-circle-icon-green"
              title={Config.starterKits.solutions.card3.title}
              description={Config.starterKits.solutions.card3.body}
            />
          </div>
          <div className="flex-align-self-stretch">
            <PrimaryButton
              isColor="primary"
              onClick={() => {
                analytics.event.starter_kit_landing.click.get_my_starter_kit_button();
                industrySpecificStarterKitsLink(props.industry.id);
              }}
              isRightMarginRemoved={true}
              isLargeButton={true}
            >
              {Config.starterKits.solutions.ctaButton}
            </PrimaryButton>
          </div>
        </section>
        <section
          aria-label="Example Roadmap"
          className="display-flex flex-column gap-4 margin-x-2 desktop:margin-x-neg-4 bg-cool-extra-light radius-lg margin-bottom-3 padding-x-2 padding-y-5 desktop:padding-y-10 desktop:padding-x-5"
        >
          <div className="padding-x-2 display-flex flex-column flex-justify gap-5 flex-align-center">
            <div className="border-top-1 border-secondary-vivid-dark width-8" />
            <Heading level={2}>{stepsTitle}</Heading>
          </div>
          <div className="display-flex flex-column desktop:flex-row gap-4 padding-x-2 desktop:padding-x-0">
            {props.roadmap.steps.map((step) => (
              <StepInfo
                step={step}
                taskNames={getTaskNamesForStep(props.roadmap.tasks, step.stepNumber)}
                key={step.stepNumber}
              />
            ))}
          </div>
          <div className="flex-align-self-stretch desktop:flex-align-self-center tablet:flex-align-self-center">
            <PrimaryButton
              isColor={"secondary-vivid-dark"}
              onClick={() => {
                analytics.event.starter_kit_landing.click.get_my_starter_kit_button_footer();
                industrySpecificStarterKitsLink(props.industry.id);
              }}
              isRightMarginRemoved={true}
              isLargeButton={true}
            >
              {Config.starterKits.steps.ctaButton}
            </PrimaryButton>
          </div>
        </section>
      </main>
    </PageSkeleton>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<StarterKitsUrl> => {
  const paths = getAllStarterKitUrls();

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({ params }: { params: StarterKitsUrl }): Promise<{ props: Props }> => {
  let industry;
  if (params.starterKitsUrl === STARTER_KITS_GENERIC_SLUG) {
    industry = LookupIndustryById("generic");
  } else {
    industry = LookupIndustryById(params.starterKitsUrl);
  }

  const emptyProfileData = createEmptyProfileData();
  const newProfileData: ProfileData = {
    ...emptyProfileData,
    businessPersona: "STARTING",
    industryId: industry.id,
    legalStructureId: "limited-liability-company",
  };
  const roadmap = await buildUserRoadmap(newProfileData);

  return {
    props: { noAuth: true, roadmap, industry },
  };
};

export default StarterKitsPage;
