import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { findDeadLicenseTasks, findDeadTasks } from "@/lib/static/admin/findDeadLinks";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useState } from "react";

interface Props {
  deadTasks: string[];
  deadLicenseTasks: string[];
  noAuth: boolean;
}

const UnusedContent = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const config = getMergedConfig();

  const generateContent = (): string => {
    let unusedTasksOutput = "Unused Tasks \n\n";

    unusedTasksOutput = `${unusedTasksOutput}\n\n Tasks:`;
    props.deadTasks.map((deadTasks) => {
      unusedTasksOutput = `${unusedTasksOutput}\n\n ${deadTasks}`;
    });

    unusedTasksOutput = `${unusedTasksOutput}\n\n License Tasks:`;
    props.deadLicenseTasks.map((deadLicenseTask) => {
      unusedTasksOutput = `${unusedTasksOutput}\n\n ${deadLicenseTask}`;
    });

    return unusedTasksOutput;
  };

  const handleDownloadClick = (): void => {
    const content = generateContent();

    const blob = new Blob([content], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "unusedTasks.txt";
    link.textContent = "Download Text File";

    document.body.append(link);
    link.click();

    URL.revokeObjectURL(blobUrl);
    link.remove();
  };

  const authedView = (
    <>
      <h1>Dead Content</h1>
      <PrimaryButton onClick={handleDownloadClick} isColor={"primary"}>
        Click Here to Download, as a txt file
      </PrimaryButton>
      <Heading level={2} data-testid="dl-task-header">
        Tasks not referenced in any the application:
      </Heading>
      <ul>
        {props.deadTasks.map((task, i) => {
          return <li key={i}>{task}</li>;
        })}
      </ul>

      <Heading level={2} data-testid="dl-task-header">
        License Tasks not referenced in any the application:
      </Heading>
      <ul>
        {props.deadLicenseTasks.map((licenseTasks, i) => {
          return <li key={i}>{licenseTasks}</li>;
        })}
      </ul>

      {/* This is dangerous and misleading, because any md content can have contextual info links and this does not check all md content */}
      {/* future refactor to leverage search tool functions to search all content for a regex matching contextual info */}
      {/*

      <Heading level={2}>Contextual infos not referenced anywhere:</Heading>
      <ul>
        {props.deadContextualInfo.map((info, i) => {
          return <li key={i}>{info}</li>;
        })}
      </ul> */}
    </>
  );

  return (
    <PageSkeleton>
      <NextSeo title={getNextSeoTitle(config.pagesMetadata.deadLinksTitle)} noindex={true} />
      <main>
        <SingleColumnContainer>
          {isAuthed ? (
            authedView
          ) : (
            <MgmtAuth password={password} setIsAuthed={setIsAuthed} setPassword={setPassword} />
          )}
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export const getServerSideProps = async (): Promise<GetServerSidePropsResult<Props>> => {
  // Always allow page access for tests and management
  // Only perform expensive dead link checks when explicitly enabled
  const shouldPerformDeadLinkCheck = process.env.CHECK_DEAD_LINKS === "true";

  return {
    props: {
      deadTasks: shouldPerformDeadLinkCheck ? await findDeadTasks() : [],
      deadLicenseTasks: shouldPerformDeadLinkCheck ? await findDeadLicenseTasks() : [],
      // deadContextualInfo: await findDeadContextualInfo(),
      noAuth: true,
    },
  };
};

export default UnusedContent;
