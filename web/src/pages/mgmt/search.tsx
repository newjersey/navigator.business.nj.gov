/* eslint-disable @typescript-eslint/no-explicit-any */

import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { Alert } from "@/components/njwds-extended/Alert";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { MatchCollection } from "@/components/search/MatchCollection";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { getNetlifyConfig } from "@/lib/static/admin/getNetlifyConfig";
import NonEssentialQuestions from "@businessnjgovnavigator/content/roadmaps/nonEssentialQuestions.json";
import DomesticEmployerSteps from "@businessnjgovnavigator/content/roadmaps/steps-domestic-employer.json";
import ForeignSteps from "@businessnjgovnavigator/content/roadmaps/steps-foreign.json";
import Steps from "@businessnjgovnavigator/content/roadmaps/steps.json";
import { getIndustries, Industry } from "@businessnjgovnavigator/shared/industry";
import { searchAnytimeActionLicenseReinstatements } from "@businessnjgovnavigator/shared/lib/search";
import { searchAnytimeActionTasks } from "@businessnjgovnavigator/shared/lib/search/searchAnytimeActionTasks";
import { searchBusinessFormation } from "@businessnjgovnavigator/shared/lib/search/searchBusinessFormation";
import { searchCertifications } from "@businessnjgovnavigator/shared/lib/search/searchCertifications";
import { searchConfig } from "@businessnjgovnavigator/shared/lib/search/searchConfig";
import { searchContextualInfo } from "@businessnjgovnavigator/shared/lib/search/searchContextualInfo";
import { searchFundings } from "@businessnjgovnavigator/shared/lib/search/searchFundings";
import { searchIndustries } from "@businessnjgovnavigator/shared/lib/search/searchIndustries";
import { searchLicenseEvents } from "@businessnjgovnavigator/shared/lib/search/searchLicenseEvents";
import { searchNonEssentialQuestions } from "@businessnjgovnavigator/shared/lib/search/searchNonEssentialQuestions";
import { searchXrayRenewalCalendarEvent } from "@businessnjgovnavigator/shared/lib/search/searchRenewalCalendarEvents";
import { searchSidebarCards } from "@businessnjgovnavigator/shared/lib/search/searchSidebarCards";
import { searchSteps } from "@businessnjgovnavigator/shared/lib/search/searchSteps";
import { searchTasks } from "@businessnjgovnavigator/shared/lib/search/searchTasks";
import { searchTaxFilings } from "@businessnjgovnavigator/shared/lib/search/searchTaxFilings";
import { searchWebflowLicenses } from "@businessnjgovnavigator/shared/lib/search/searchWebflowLicenses";
import {
  GroupedConfigMatch,
  Match,
} from "@businessnjgovnavigator/shared/lib/search/typesForSearch";
import {
  loadAllAddOns,
  loadAllAnytimeActionLicenseReinstatements,
  loadAllAnytimeActionTasks,
  loadAllArchivedCertifications,
  loadAllArchivedContextualInfo,
  loadAllCertifications,
  loadAllContextualInfo,
  loadAllEnvironmentTasks,
  loadAllFilings,
  loadAllFundings,
  loadAllLicenseCalendarEvents,
  loadAllLicenseTasks,
  loadAllMunicipalTasks,
  loadAllPageMetadata,
  loadAllRaffleBingoSteps,
  loadAllTasksOnly,
  loadAllWebflowLicenses,
  loadCmsConfig,
  loadFormationDbaContent,
  loadRoadmapSideBarDisplayContent,
  loadXrayRenewalCalendarEvent,
} from "@businessnjgovnavigator/shared/static";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Certification,
  ContextualInfoFile,
  Filing,
  FormationDbaDisplayContent,
  Funding,
  IndustryRoadmap,
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
} from "@businessnjgovnavigator/shared/types";
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
  formationDbaContent: FormationDbaDisplayContent;
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
      setGroupedConfigMatches(searchConfig(Config, { term: lowercaseTerm }, props.cmsConfig));
    } catch (error) {
      updateSearchState({ error: { message: error as string, term: searchState.term } });
      console.error(error);
    }
    setTaskMatches(searchTasks(props.tasks, lowercaseTerm, props.industries, props.addOns));
    setLicenseTaskMatches(
      searchTasks(
        props.licenseTasks,
        lowercaseTerm,

        props.industries,
        props.addOns,
      ),
    );
    setMunicipalTaskMatches(
      searchTasks(
        props.municipalTasks,
        lowercaseTerm,

        props.industries,
        props.addOns,
      ),
    );
    setRaffleBingoStepMatches(
      searchTasks(
        props.raffleBingoSteps,
        lowercaseTerm,

        props.industries,
        props.addOns,
      ),
    );
    setEnvTaskMatches(searchTasks(props.envTasks, lowercaseTerm, props.industries, props.addOns));
    setCertMatches(searchCertifications(props.certifications, lowercaseTerm));
    setCertArchiveMatches(searchCertifications(props.archivedCertifications, lowercaseTerm));
    setFundingMatches(searchFundings(props.fundings, lowercaseTerm));
    setIndustryMatches(
      searchIndustries(getIndustries({ overrideShowDisabledIndustries: true }), lowercaseTerm),
    );
    setAnytimeActionTaskMatches(searchAnytimeActionTasks(props.anytimeActionTasks, lowercaseTerm));
    setAnytimeActionLicenseReinstatementMatches(
      searchAnytimeActionLicenseReinstatements(
        props.anytimeActionLicenseReinstatements,
        lowercaseTerm,
      ),
    );

    const defaultStepsMatches = searchSteps(Steps.steps as Step[], lowercaseTerm, {
      filename: "steps",
      displayTitle: "Steps",
    });
    const domesticEmployerStepsMatches = searchSteps(
      DomesticEmployerSteps.steps as Step[],
      lowercaseTerm,
      {
        filename: "steps-domestic-employer",
        displayTitle: "Steps - Domestic Employer",
      },
    );
    const foreignStepsMatches = searchSteps(ForeignSteps.steps as Step[], lowercaseTerm, {
      filename: "steps-foreign",
      displayTitle: "Steps - Dakota",
    });
    setStepsMatches([
      ...defaultStepsMatches,
      ...domesticEmployerStepsMatches,
      ...foreignStepsMatches,
    ]);

    setNonEssentialQuestionsMatches(
      searchNonEssentialQuestions(
        NonEssentialQuestions.nonEssentialQuestionsArray as NonEssentialQuestion[],
        lowercaseTerm,
      ),
    );

    setWebflowLicenseMatches(searchWebflowLicenses(props.webflowLicenses, lowercaseTerm));
    setFilingMatches(searchTaxFilings(props.filings, lowercaseTerm));
    setSidebarCardMatches(searchSidebarCards(sidebarCards, lowercaseTerm));
    setContextualInfoMatches(searchContextualInfo(props.contextualInfo, lowercaseTerm));
    setArchivedContextualInfoMatches(
      searchContextualInfo(props.archivedContextualInfo, lowercaseTerm),
    );
    setLicenseCalendarEventMatches(searchLicenseEvents(props.licenseCalendarEvents, lowercaseTerm));

    setXrayRenewalCalendarEventMatches(
      searchXrayRenewalCalendarEvent(props.xrayRenewalCalendarEvent, lowercaseTerm),
    );

    const businessFormationInfo: TaskWithoutLinks[] = Object.values(
      props.formationDbaContent.formationDbaContent,
    );
    setBusinessFormationMatches(searchBusinessFormation(businessFormationInfo, lowercaseTerm));
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
    "Cert Opps - Archived": certArchiveMatches,
  };

  const fundingCollection = {
    "Fund Opps - Content": fundingMatches,
  };

  const roadmapsCollection = {
    "Roadmaps - Settings": stepsMatches,
    "Roadmaps - Non Essential Questions": nonEssentialQuestionsMatches,
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
    "Anytime Actions Tasks": anytimeActionTaskMatches,
    "Anytime Action With Consumer Affairs License Integrations (Reinstatements)":
      anytimeActionLicenseReinstatementMatches,
  };

  const renewalCalendarCollection = {
    "Xray Renewal Calendar Event": xrayRenewalCalendarEventMatches,
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
      <MatchCollection
        matchedCollections={{ "Login Support Page": [] }}
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
      envTasks: loadAllEnvironmentTasks(),
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
      formationDbaContent: loadFormationDbaContent(),
      addOns: loadAllAddOns(),
      industries: getIndustries(),
    },
  };
};

export default SearchContentPage;
