/* eslint-disable @typescript-eslint/no-explicit-any */

import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MatchCollection } from "@/components/search/MatchCollection";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { searchCertifications } from "@/lib/search/searchCertifications";
import { searchConfig } from "@/lib/search/searchConfig";
import { searchContextualInfo } from "@/lib/search/searchContextualInfo";
import { searchFundings } from "@/lib/search/searchFundings";
import { searchIndustries } from "@/lib/search/searchIndustries";
import { searchLicenseEvents } from "@/lib/search/searchLicenseEvents";
import { searchNonEssentialQuestions } from "@/lib/search/searchNonEssentialQuestions";
import { searchPostOnboarding } from "@/lib/search/searchPostOnboarding";
import { searchSidebarCards } from "@/lib/search/searchSidebarCards";
import { searchSteps } from "@/lib/search/searchSteps";
import { searchTasks } from "@/lib/search/searchTasks";
import { searchTaxFilings } from "@/lib/search/searchTaxFilings";
import { searchWebflowLicenses } from "@/lib/search/searchWebflowLicenses";
import { GroupedConfigMatch, Match } from "@/lib/search/typesForSearch";
import { getNetlifyConfig } from "@/lib/static/admin/getNetlifyConfig";
import { loadAllArchivedCertifications, loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadCmsConfig } from "@/lib/static/loadCmsConfig";
import { loadAllArchivedContextualInfo, loadAllContextualInfo } from "@/lib/static/loadContextualInfo";
import { loadRoadmapSideBarDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFilings } from "@/lib/static/loadFilings";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadAllLicenses } from "@/lib/static/loadLicenses";
import { loadAllPostOnboarding } from "@/lib/static/loadPostOnboarding";
import { loadAllLicenseTasks, loadAllTasksOnly } from "@/lib/static/loadTasks";
import { loadAllWebflowLicenses } from "@/lib/static/loadWebflowLicenses";
import {
  Certification,
  ContextualInfoFile,
  Filing,
  Funding,
  LicenseEvent,
  NonEssentialQuestion,
  PostOnboardingFile,
  RoadmapDisplayContent,
  SidebarCardContent,
  Step,
  Task,
  WebflowLicense
} from "@/lib/types/types";
import NonEssentialQuestions from "@businessnjgovnavigator/content/roadmaps/nonEssentialQuestions.json";
import ForeignSteps from "@businessnjgovnavigator/content/roadmaps/steps-foreign.json";
import Steps from "@businessnjgovnavigator/content/roadmaps/steps.json";
import { Industries } from "@businessnjgovnavigator/shared";
import { TextField } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ChangeEvent, KeyboardEvent, ReactElement, useState } from "react";

interface Props {
  netlifyConfig: any;
  noAuth: boolean;
  tasks: Task[];
  licenseTasks: Task[];
  certifications: Certification[];
  archivedCertifications: Certification[];
  fundings: Funding[];
  webflowLicenses: WebflowLicense[];
  filings: Filing[];
  roadmapDisplayContent: RoadmapDisplayContent;
  contextualInfo: ContextualInfoFile[];
  archivedContextualInfo: ContextualInfoFile[];
  postOnboarding: PostOnboardingFile[];
  licenseEvents: LicenseEvent[];
  cmsConfig: any;
}

const SearchContentPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [taskMatches, setTaskMatches] = useState<Match[]>([]);
  const [licenseTaskMatches, setLicenseTaskMatches] = useState<Match[]>([]);
  const [certMatches, setCertMatches] = useState<Match[]>([]);
  const [certArchiveMatches, setCertArchiveMatches] = useState<Match[]>([]);
  const [fundingMatches, setFundingMatches] = useState<Match[]>([]);
  const [industryMatches, setIndustryMatches] = useState<Match[]>([]);
  const [stepsMatches, setStepsMatches] = useState<Match[]>([]);
  const [nonEssentialQuestionsMatches, setNonEssentialQuestionsMatches] = useState<Match[]>([]);
  const [webflowLicenseMatches, setWebflowLicenseMatches] = useState<Match[]>([]);
  const [filingMatches, setFilingMatches] = useState<Match[]>([]);
  const [sidebarCardMatches, setSidebarCardMatches] = useState<Match[]>([]);
  const [contextualInfoMatches, setContextualInfoMatches] = useState<Match[]>([]);
  const [archivedContextualInfoMatches, setArchivedContextualInfoMatches] = useState<Match[]>([]);
  const [postOnboardingMatches, setPostOnboardingMatches] = useState<Match[]>([]);
  const [licenseEventMatches, setLicenseEventMatches] = useState<Match[]>([]);
  const [groupedConfigMatches, setGroupedConfigMatches] = useState<GroupedConfigMatch[]>([]);

  const { Config } = useConfig();

  const sidebarCards: SidebarCardContent[] = Object.values(props.roadmapDisplayContent.sidebarDisplayContent);

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>, submit: () => void): void => {
    if (event.code === "Enter") {
      submit();
    }
  };

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
    setHasSearched(false);
  };

  const onSearchSubmit = (): void => {
    const lowercaseTerm = searchTerm.toLowerCase();
    setGroupedConfigMatches(searchConfig(Config, lowercaseTerm, props.cmsConfig));

    setTaskMatches(searchTasks(props.tasks, lowercaseTerm));
    setLicenseTaskMatches(searchTasks(props.licenseTasks, lowercaseTerm));
    setCertMatches(searchCertifications(props.certifications, lowercaseTerm));
    setCertArchiveMatches(searchCertifications(props.archivedCertifications, lowercaseTerm));
    setFundingMatches(searchFundings(props.fundings, lowercaseTerm));
    setIndustryMatches(searchIndustries(Industries, lowercaseTerm));

    const defaultStepsMatches = searchSteps(Steps.steps as Step[], lowercaseTerm, { filename: "Steps" });
    const foreignStepsMatches = searchSteps(ForeignSteps.steps as Step[], lowercaseTerm, {
      filename: "Steps - Dakota"
    });
    setStepsMatches([...defaultStepsMatches, ...foreignStepsMatches]);

    setNonEssentialQuestionsMatches(
      searchNonEssentialQuestions(
        NonEssentialQuestions.nonEssentialQuestionsArray as NonEssentialQuestion[],
        lowercaseTerm
      )
    );

    setWebflowLicenseMatches(searchWebflowLicenses(props.webflowLicenses, lowercaseTerm));
    setFilingMatches(searchTaxFilings(props.filings, lowercaseTerm));
    setSidebarCardMatches(searchSidebarCards(sidebarCards, lowercaseTerm));
    setContextualInfoMatches(searchContextualInfo(props.contextualInfo, lowercaseTerm));
    setArchivedContextualInfoMatches(searchContextualInfo(props.archivedContextualInfo, lowercaseTerm));
    setPostOnboardingMatches(searchPostOnboarding(props.postOnboarding, lowercaseTerm));
    setLicenseEventMatches(searchLicenseEvents(props.licenseEvents, lowercaseTerm));
    setHasSearched(true);
  };

  const noMatches = (): boolean => {
    return (
      hasSearched &&
      [
        ...taskMatches,
        ...licenseTaskMatches,
        ...certMatches,
        ...certArchiveMatches,
        ...fundingMatches,
        ...industryMatches,
        ...stepsMatches,
        ...nonEssentialQuestionsMatches,
        ...filingMatches,
        ...licenseEventMatches,
        ...sidebarCardMatches,
        ...webflowLicenseMatches,
        ...archivedContextualInfoMatches,
        ...contextualInfoMatches,
        ...groupedConfigMatches
      ].length === 0
    );
  };

  const taskCollection = {
    "Tasks - All": taskMatches,
    "License Tasks (Navigator with Webflow mappings)": licenseTaskMatches,
    "Webflow Licenses": webflowLicenseMatches
  };

  const certCollection = {
    "Cert Opps - Content": certMatches,
    "Cert Opps - Archive": certArchiveMatches
  };

  const fundingCollection = {
    "Fund Opps - Content": fundingMatches
  };

  const roadmapsCollection = {
    "Roadmaps - Settings": stepsMatches,
    "Roadmaps - Non Essential Question": nonEssentialQuestionsMatches
  };

  const calendarCollection = {
    "Taxes Filings - All": filingMatches,
    "License Expiration / Renewal Events": licenseEventMatches
  };

  const dashboardCollection = {
    "Sidebar Cards Content": sidebarCardMatches
  };

  const miscCollection = {
    "Contextual Information": contextualInfoMatches,
    "Post Onboarding Content": postOnboardingMatches
  };

  const authedView = (
    <div>
      <h1>Search in CMS</h1>
      <label htmlFor="search">Search Exact Text</label>
      <TextField
        name="search"
        variant="outlined"
        type="text"
        value={searchTerm}
        onChange={handleSearchInput}
        onKeyPress={(event): void => handleKeyPress(event, onSearchSubmit)}
        inputProps={{ id: "search" }}
      />
      <button onClick={onSearchSubmit} className="usa-button margin-top-2 margin-bottom-4">
        Submit
      </button>
      {noMatches() && <div>No matches.</div>}
      <MatchCollection
        matchedCollections={{ "Biz Form - Config": [] }}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection matchedCollections={certCollection} groupedConfigMatches={groupedConfigMatches} />
      <MatchCollection matchedCollections={fundingCollection} groupedConfigMatches={groupedConfigMatches} />
      <MatchCollection matchedCollections={roadmapsCollection} groupedConfigMatches={groupedConfigMatches} />
      <MatchCollection matchedCollections={taskCollection} groupedConfigMatches={groupedConfigMatches} />
      <MatchCollection matchedCollections={calendarCollection} groupedConfigMatches={groupedConfigMatches} />
      <MatchCollection matchedCollections={dashboardCollection} groupedConfigMatches={groupedConfigMatches} />
      <MatchCollection matchedCollections={miscCollection} groupedConfigMatches={groupedConfigMatches} />
    </div>
  );

  return (
    <PageSkeleton>
      <NextSeo noindex={true} />
      <main>
        <SingleColumnContainer>
          <div className="margin-y-3">
            {isAuthed ? (
              authedView
            ) : (
              <MgmtAuth password={password} setIsAuthed={setIsAuthed} setPassword={setPassword} />
            )}
          </div>
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      netlifyConfig: getNetlifyConfig(),
      noAuth: true,
      tasks: loadAllTasksOnly(),
      licenseTasks: loadAllLicenseTasks(),
      certifications: loadAllCertifications(),
      archivedCertifications: loadAllArchivedCertifications(),
      fundings: loadAllFundings(),
      webflowLicenses: loadAllWebflowLicenses(),
      filings: loadAllFilings(),
      roadmapDisplayContent: loadRoadmapSideBarDisplayContent(),
      contextualInfo: loadAllContextualInfo(),
      archivedContextualInfo: loadAllArchivedContextualInfo(),
      postOnboarding: loadAllPostOnboarding(),
      licenseEvents: loadAllLicenses(),
      cmsConfig: loadCmsConfig()
    }
  };
};

export default SearchContentPage;
