/* eslint-disable @typescript-eslint/no-explicit-any */

import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { Alert } from "@/components/njwds-extended/Alert";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { MatchCollection } from "@/components/search/MatchCollection";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { IndustryRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { searchAnytimeActionLicenseReinstatements } from "@/lib/search/searchAnytimeActionLicenseReinstatement";
import { searchAnytimeActionTasks } from "@/lib/search/searchAnytimeActionTasks";
import { searchBusinessFormation } from "@/lib/search/searchBusinessFormation";
import { searchCertifications } from "@/lib/search/searchCertifications";
import { searchConfig } from "@/lib/search/searchConfig";
import { searchContextualInfo } from "@/lib/search/searchContextualInfo";
import { searchFundings } from "@/lib/search/searchFundings";
import { searchIndustries } from "@/lib/search/searchIndustries";
import { searchLicenseEvents } from "@/lib/search/searchLicenseEvents";
import { searchNonEssentialQuestions } from "@/lib/search/searchNonEssentialQuestions";
import { searchXrayRenewalCalendarEvent } from "@/lib/search/searchRenewalCalendarEvents";
import { searchSidebarCards } from "@/lib/search/searchSidebarCards";
import { searchSteps } from "@/lib/search/searchSteps";
import { searchTasks } from "@/lib/search/searchTasks";
import { searchTaxFilings } from "@/lib/search/searchTaxFilings";
import { searchWebflowLicenses } from "@/lib/search/searchWebflowLicenses";
import { GroupedConfigMatch, Match } from "@/lib/search/typesForSearch";
import { getNetlifyConfig } from "@/lib/static/admin/getNetlifyConfig";
import { loadAllAddOns } from "@/lib/static/loadAllAddOns";
import { loadAllAnytimeActionLicenseReinstatements } from "@/lib/static/loadAnytimeActionLicenseReinstatements";
import { loadAllAnytimeActionTasks } from "@/lib/static/loadAnytimeActionTasks";
import {
  loadAllArchivedCertifications,
  loadAllCertifications,
} from "@/lib/static/loadCertifications";
import { loadCmsConfig } from "@/lib/static/loadCmsConfig";
import {
  loadAllArchivedContextualInfo,
  loadAllContextualInfo,
} from "@/lib/static/loadContextualInfo";
import {
  loadFormationDbaContent,
  loadRoadmapSideBarDisplayContent,
} from "@/lib/static/loadDisplayContent";
import { loadAllFilings } from "@/lib/static/loadFilings";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadAllLicenseCalendarEvents } from "@/lib/static/loadLicenseCalendarEvents";
import { loadAllPageMetadata } from "@/lib/static/loadPageMetadata";
import {
  loadAllEnvTasks,
  loadAllLicenseTasks,
  loadAllMunicipalTasks,
  loadAllRaffleBingoSteps,
  loadAllTasksOnly,
} from "@/lib/static/loadTasks";
import { loadAllWebflowLicenses } from "@/lib/static/loadWebflowLicenses";
import { loadXrayRenewalCalendarEvent } from "@/lib/static/loadXrayRenewalCalendarEvent";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Certification,
  ContextualInfoFile,
  Filing,
  FormationDbaDisplayContent,
  Funding,
  LicenseEventType,
  NonEssentialQuestion,
  PageMetadata,
  RoadmapDisplayContent,
  SidebarCardContent,
  Step,
  Task,
  TaskWithoutLinks,
  WebflowLicense,
  XrayRenewalCalendarEventType,
} from "@/lib/types/types";
import NonEssentialQuestions from "@businessnjgovnavigator/content/roadmaps/nonEssentialQuestions.json";
import DomesticEmployerSteps from "@businessnjgovnavigator/content/roadmaps/steps-domestic-employer.json";
import ForeignSteps from "@businessnjgovnavigator/content/roadmaps/steps-foreign.json";
import Steps from "@businessnjgovnavigator/content/roadmaps/steps.json";
import { getIndustries, Industry } from "@businessnjgovnavigator/shared/industry";
import { TextField } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ChangeEvent, KeyboardEvent, ReactElement, useState } from "react";

interface Props {
  netlifyConfig: any;
  noAuth: boolean;
  tasks: Task[];
  licenseTasks: Task[];
  municipalTasks: Task[];
  envTasks: Task[];
  raffleBingoSteps: Task[];
  certifications: Certification[];
  archivedCertifications: Certification[];
  fundings: Funding[];
  webflowLicenses: WebflowLicense[];
  filings: Filing[];
  roadmapDisplayContent: RoadmapDisplayContent;
  contextualInfo: ContextualInfoFile[];
  archivedContextualInfo: ContextualInfoFile[];
  licenseCalendarEvents: LicenseEventType[];
  xrayRenewalCalendarEvent: XrayRenewalCalendarEventType;
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
  pageMetaData: PageMetadata[];
  cmsConfig: any;
  tasksDisplayContent: FormationDbaDisplayContent;
  addOns: IndustryRoadmap[];
  industries: Industry[];
}

interface SearchState {
  term: string;
  error: {
    message: string;
    term: string;
  } | null;
  hasSearched: boolean;
}

const SearchContentPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [searchState, setSearchState] = useState<SearchState>({
    term: "",
    error: null,
    hasSearched: false,
  });
  const [businessFormationMatches, setBusinessFormationMatches] = useState<Match[]>([]);
  const [taskMatches, setTaskMatches] = useState<Match[]>([]);
  const [licenseTaskMatches, setLicenseTaskMatches] = useState<Match[]>([]);
  const [municipalTaskMatches, setMunicipalTaskMatches] = useState<Match[]>([]);
  const [raffleBingoStepMatches, setRaffleBingoStepMatches] = useState<Match[]>([]);
  const [envTaskMatches, setEnvTaskMatches] = useState<Match[]>([]);
  const [certMatches, setCertMatches] = useState<Match[]>([]);
  const [certArchiveMatches, setCertArchiveMatches] = useState<Match[]>([]);
  const [fundingMatches, setFundingMatches] = useState<Match[]>([]);
  const [industryMatches, setIndustryMatches] = useState<Match[]>([]);
  const [stepsMatches, setStepsMatches] = useState<Match[]>([]);
  const [nonEssentialQuestionsMatches, setNonEssentialQuestionsMatches] = useState<Match[]>([]);
  const [webflowLicenseMatches, setWebflowLicenseMatches] = useState<Match[]>([]);
  const [filingMatches, setFilingMatches] = useState<Match[]>([]);
  const [anytimeActionTaskMatches, setAnytimeActionTaskMatches] = useState<Match[]>([]);
  const [anytimeActionLicenseReinstatementMatches, setAnytimeActionLicenseReinstatementMatches] =
    useState<Match[]>([]);
  const [sidebarCardMatches, setSidebarCardMatches] = useState<Match[]>([]);
  const [contextualInfoMatches, setContextualInfoMatches] = useState<Match[]>([]);
  const [archivedContextualInfoMatches, setArchivedContextualInfoMatches] = useState<Match[]>([]);
  const [licenseCalendarEventMatches, setLicenseCalendarEventMatches] = useState<Match[]>([]);
  const [xrayRenewalCalendarEventMatches, setXrayRenewalCalendarEventMatches] = useState<Match[]>(
    [],
  );
  const [groupedConfigMatches, setGroupedConfigMatches] = useState<GroupedConfigMatch[]>([]);

  const { Config } = useConfig();

  const sidebarCards: SidebarCardContent[] = Object.values(
    props.roadmapDisplayContent.sidebarDisplayContent,
  );

  const updateSearchState = (updates: Partial<SearchState>): void => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>, submit: () => void): void => {
    if (event.code === "Enter") {
      submit();
    }
  };

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>): void => {
    updateSearchState({ term: event.target.value, hasSearched: false });
  };

  const onSearchSubmit = (): void => {
    updateSearchState({ error: null });

    if (searchState.term === "") return;

    const lowercaseTerm = searchState.term.toLowerCase();

    try {
      setGroupedConfigMatches(searchConfig(Config, lowercaseTerm, props.cmsConfig));
    } catch (error) {
      updateSearchState({ error: { message: error as string, term: searchState.term } });
      console.error(error);
    }
    setTaskMatches(
      searchTasks(props.tasks, lowercaseTerm, "tasks", props.industries, props.addOns),
    );
    setLicenseTaskMatches(
      searchTasks(
        props.licenseTasks,
        lowercaseTerm,
        "license-tasks",
        props.industries,
        props.addOns,
      ),
    );
    setMunicipalTaskMatches(
      searchTasks(
        props.municipalTasks,
        lowercaseTerm,
        "municipal-tasks",
        props.industries,
        props.addOns,
      ),
    );
    setRaffleBingoStepMatches(
      searchTasks(
        props.raffleBingoSteps,
        lowercaseTerm,
        "raffle-bingo-steps",
        props.industries,
        props.addOns,
      ),
    );
    setEnvTaskMatches(
      searchTasks(props.envTasks, lowercaseTerm, "", props.industries, props.addOns),
    );
    setCertMatches(
      searchCertifications(props.certifications, lowercaseTerm, "certification-opportunities"),
    );
    setCertArchiveMatches(
      searchCertifications(
        props.archivedCertifications,
        lowercaseTerm,
        "archived-certification-opportunities",
      ),
    );
    setFundingMatches(searchFundings(props.fundings, lowercaseTerm, "funding-opportunities"));
    setIndustryMatches(
      searchIndustries(
        getIndustries({ overrideShowDisabledIndustries: true }),
        lowercaseTerm,
        "roadmaps",
      ),
    );
    setAnytimeActionTaskMatches(
      searchAnytimeActionTasks(props.anytimeActionTasks, lowercaseTerm, "anytime-action-tasks"),
    );
    setAnytimeActionLicenseReinstatementMatches(
      searchAnytimeActionLicenseReinstatements(
        props.anytimeActionLicenseReinstatements,
        lowercaseTerm,
        "anytime-action-license-reinstatements",
      ),
    );

    const defaultStepsMatches = searchSteps(
      Steps.steps as Step[],
      lowercaseTerm,
      {
        filename: "Steps",
      },
      "steps",
    );
    const domesticEmployerStepsMatches = searchSteps(
      DomesticEmployerSteps.steps as Step[],
      lowercaseTerm,
      {
        filename: "Steps - Domestic Employer",
      },
      "steps-domestic-employer",
    );
    const foreignStepsMatches = searchSteps(
      ForeignSteps.steps as Step[],
      lowercaseTerm,
      {
        filename: "Steps - Dakota",
      },
      "steps-foreign",
    );
    setStepsMatches([
      ...defaultStepsMatches,
      ...domesticEmployerStepsMatches,
      ...foreignStepsMatches,
    ]);

    setNonEssentialQuestionsMatches(
      searchNonEssentialQuestions(
        NonEssentialQuestions.nonEssentialQuestionsArray as NonEssentialQuestion[],
        lowercaseTerm,
        "nonEssentialQuestionsCollection",
      ),
    );

    setWebflowLicenseMatches(
      searchWebflowLicenses(props.webflowLicenses, lowercaseTerm, "webflow-licenses"),
    );
    setFilingMatches(searchTaxFilings(props.filings, lowercaseTerm, "filings"));
    setSidebarCardMatches(searchSidebarCards(sidebarCards, lowercaseTerm, "roadmap-sidebar-card"));
    setContextualInfoMatches(
      searchContextualInfo(props.contextualInfo, lowercaseTerm, "contextual-information"),
    );
    setArchivedContextualInfoMatches(
      searchContextualInfo(props.archivedContextualInfo, lowercaseTerm, "archived-contextual-info"),
    );
    setLicenseCalendarEventMatches(
      searchLicenseEvents(props.licenseCalendarEvents, lowercaseTerm, "license-calendar-events"),
    );

    setXrayRenewalCalendarEventMatches(
      searchXrayRenewalCalendarEvent(
        props.xrayRenewalCalendarEvent,
        lowercaseTerm,
        "xray-calendar-event",
      ),
    );

    const businessFormationInfo: TaskWithoutLinks[] = Object.values(
      props.tasksDisplayContent.formationDbaContent,
    );
    setBusinessFormationMatches(
      searchBusinessFormation(businessFormationInfo, lowercaseTerm, "business-formation-dba-tasks"),
    );
    updateSearchState({ hasSearched: true });
  };

  const noMatches = (): boolean => {
    return (
      searchState.hasSearched &&
      [
        ...taskMatches,
        ...licenseTaskMatches,
        ...municipalTaskMatches,
        ...raffleBingoStepMatches,
        ...envTaskMatches,
        ...certMatches,
        ...certArchiveMatches,
        ...fundingMatches,
        ...industryMatches,
        ...stepsMatches,
        ...nonEssentialQuestionsMatches,
        ...filingMatches,
        ...licenseCalendarEventMatches,
        ...xrayRenewalCalendarEventMatches,
        ...sidebarCardMatches,
        ...webflowLicenseMatches,
        ...archivedContextualInfoMatches,
        ...contextualInfoMatches,
        ...groupedConfigMatches,
        ...anytimeActionTaskMatches,
        ...anytimeActionLicenseReinstatementMatches,
        ...businessFormationMatches,
      ].length === 0
    );
  };

  const taskCollection = {
    "Tasks - All": taskMatches,
    "License Tasks (Navigator with Webflow mappings)": licenseTaskMatches,
    "Tasks - Municipal": municipalTaskMatches,
    "Webflow Licenses": webflowLicenseMatches,
  };

  const envCollection = {
    "Env Comp - Config": envTaskMatches,
  };

  const certCollection = {
    "Cert Opps - Content": certMatches,
    "Cert Opps - Archive": certArchiveMatches,
  };

  const fundingCollection = {
    "Fund Opps - Content": fundingMatches,
  };

  const roadmapsCollection = {
    "Roadmaps - Settings": stepsMatches,
    "Roadmaps - Non Essential Question": nonEssentialQuestionsMatches,
    "Roadmaps - Industries": industryMatches,
  };

  const calendarCollection = {
    "Taxes Filings - All": filingMatches,
    "Consumer Affairs License Expiration / Renewal Events": licenseCalendarEventMatches,
  };

  const dashboardCollection = {
    "Sidebar Cards Content": sidebarCardMatches,
  };

  const miscCollection = {
    "Contextual Information": contextualInfoMatches,
  };

  const anytimeActionCollection = {
    "Anytime Action Tasks": anytimeActionTaskMatches,
    "Anytime Action License Reinstatements": anytimeActionLicenseReinstatementMatches,
  };

  const renewalCalendarCollection = {
    "Xray Calendar Event": xrayRenewalCalendarEventMatches,
  };

  const authedView = (
    <div>
      <h1>Search in CMS</h1>
      <label htmlFor="search">Search Exact Text</label>
      <TextField
        name="search"
        variant="outlined"
        type="text"
        value={searchState.term}
        onChange={handleSearchInput}
        onKeyDown={(event): void => handleKeyPress(event, onSearchSubmit)}
        inputProps={{ id: "search" }}
      />
      <button onClick={onSearchSubmit} className="usa-button margin-top-2 margin-bottom-4">
        Submit
      </button>
      {noMatches() && <div>No matches.</div>}
      {searchState.error && (
        <Alert className="margin-bottom-4" rounded variant="warning">
          <div>
            Some results might be missing for <strong>{searchState.error.term}</strong>. Please
            notify dev team.
          </div>
          <div>{searchState.error.message}</div>
        </Alert>
      )}
      <MatchCollection
        matchedCollections={renewalCalendarCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={{ "Biz Form - DBA Tasks": businessFormationMatches }}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={envCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={certCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={fundingCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={roadmapsCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={taskCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={calendarCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={dashboardCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={miscCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={anytimeActionCollection}
        groupedConfigMatches={groupedConfigMatches}
      />
      <MatchCollection
        matchedCollections={{ "Page Metadata": [] }}
        groupedConfigMatches={groupedConfigMatches}
      />
    </div>
  );

  return (
    <PageSkeleton>
      <NextSeo title={getNextSeoTitle("Search")} noindex={true} />
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
      raffleBingoSteps: loadAllRaffleBingoSteps(),
      municipalTasks: loadAllMunicipalTasks(),
      envTasks: loadAllEnvTasks(),
      certifications: loadAllCertifications(),
      archivedCertifications: loadAllArchivedCertifications(),
      fundings: loadAllFundings(),
      webflowLicenses: loadAllWebflowLicenses(),
      filings: loadAllFilings(),
      roadmapDisplayContent: loadRoadmapSideBarDisplayContent(),
      contextualInfo: loadAllContextualInfo(),
      archivedContextualInfo: loadAllArchivedContextualInfo(),
      licenseCalendarEvents: loadAllLicenseCalendarEvents(),
      xrayRenewalCalendarEvent: loadXrayRenewalCalendarEvent(),
      anytimeActionTasks: loadAllAnytimeActionTasks(),
      anytimeActionLicenseReinstatements: loadAllAnytimeActionLicenseReinstatements(),
      pageMetaData: loadAllPageMetadata(),
      cmsConfig: loadCmsConfig(),
      tasksDisplayContent: loadFormationDbaContent(),
      addOns: loadAllAddOns(),
      industries: getIndustries(),
    },
  };
};

export default SearchContentPage;
