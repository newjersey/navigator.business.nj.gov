/* eslint-disable @typescript-eslint/no-explicit-any */

import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { MatchList } from "@/components/search/MatchList";
import { searchCertifications } from "@/lib/search/searchCertifications";
import { searchFundings } from "@/lib/search/searchFundings";
import { searchIndustries } from "@/lib/search/searchIndustries";
import { searchSteps } from "@/lib/search/searchSteps";
import { searchTasks } from "@/lib/search/searchTasks";
import { Match } from "@/lib/search/typesForSearch";
import { getNetlifyConfig } from "@/lib/static/admin/getNetlifyConfig";
import { loadAllArchivedCertifications, loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadAllTasks } from "@/lib/static/loadTasks";
import { Certification, Funding, Step, Task } from "@/lib/types/types";
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
  certifications: Certification[];
  archivedCertifications: Certification[];
  fundings: Funding[];
}

const SearchContentPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [taskMatches, setTaskMatches] = useState<Match[]>([]);
  const [certMatches, setCertMatches] = useState<Match[]>([]);
  const [certArchiveMatches, setCertArchiveMatches] = useState<Match[]>([]);
  const [fundingMatches, setFundingMatches] = useState<Match[]>([]);
  const [industryMatches, setIndustryMatches] = useState<Match[]>([]);
  const [stepsMatches, setStepsMatches] = useState<Match[]>([]);

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>, submit: () => void): void => {
    if (event.code === "Enter") {
      submit();
    }
  };

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const onSearchSubmit = (): void => {
    const lowercaseTerm = searchTerm.toLowerCase();
    setTaskMatches(searchTasks(props.tasks, lowercaseTerm));
    setCertMatches(searchCertifications(props.certifications, lowercaseTerm));
    setCertArchiveMatches(searchCertifications(props.archivedCertifications, lowercaseTerm));
    setFundingMatches(searchFundings(props.fundings, lowercaseTerm));
    setIndustryMatches(searchIndustries(Industries, lowercaseTerm));

    const defaultStepsMatches = searchSteps(Steps.steps as Step[], lowercaseTerm, { filename: "Steps" });
    const foreignStepsMatches = searchSteps(ForeignSteps.steps as Step[], lowercaseTerm, {
      filename: "Steps - Dakota",
    });
    setStepsMatches([...defaultStepsMatches, ...foreignStepsMatches]);
  };

  const authedView = (
    <div>
      <h1>Search in CMS</h1>
      <p>
        <em>Currently searches: Tasks, License Tasks, Certifications, Fundings, Industries, Roadmap Steps</em>
      </p>
      <div className="margin-bottom-4 margin-top-2">
        <label htmlFor="search">Search Exact Text</label>
        <TextField
          fullWidth
          name="search"
          variant="outlined"
          type="text"
          value={searchTerm}
          onChange={handleSearchInput}
          onKeyPress={(event): void => handleKeyPress(event, onSearchSubmit)}
          inputProps={{ id: "search" }}
        />
        <button onClick={onSearchSubmit} className="usa-button margin-top-2">
          Submit
        </button>
      </div>
      <MatchList matches={taskMatches} collectionLabel="Tasks - All and License Tasks" />
      <MatchList matches={certMatches} collectionLabel="Cert Opps" />
      <MatchList matches={certArchiveMatches} collectionLabel="Cert Opps - Archive" />
      <MatchList matches={fundingMatches} collectionLabel="Funding Opps" />
      <MatchList matches={industryMatches} collectionLabel="Roadmap - Industries" />
      <MatchList matches={stepsMatches} collectionLabel="Roadmap - Settings" />
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
      tasks: loadAllTasks(),
      certifications: loadAllCertifications(),
      archivedCertifications: loadAllArchivedCertifications(),
      fundings: loadAllFundings(),
    },
  };
};

export default SearchContentPage;
