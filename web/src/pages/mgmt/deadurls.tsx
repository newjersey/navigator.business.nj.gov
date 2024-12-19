import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getMergedConfig } from "@/contexts/configContext";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { findDeadLinks } from "@/lib/static/admin/findDeadLinks";
import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useState } from "react";

interface Props {
  deadLinks: Record<string, string[]>;
  noAuth: boolean;
}

const DeadUrlsPage = (props: Props): ReactElement<any> => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const config = getMergedConfig();

  const generateContent = (): string => {
    let deadLinkFileOutput = "Possibly Blocked Or Deadlinks \n\n";

    Object.keys(props.deadLinks).map((page) => {
      if (props.deadLinks[page].length > 0) {
        deadLinkFileOutput = `${deadLinkFileOutput}\n\n Page: ${page}`;
        {
          props.deadLinks[page].map((link) => {
            deadLinkFileOutput = `${deadLinkFileOutput}\n\t${link}`;
          });
        }
      }
    });
    return deadLinkFileOutput;
  };

  const handleDownloadClick = (): void => {
    const content = generateContent();

    const blob = new Blob([content], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "deadurls.txt";
    link.textContent = "Download Text File";

    document.body.append(link);
    link.click();

    URL.revokeObjectURL(blobUrl);
    link.remove();
  };

  const authedView = (
    <>
      <h1>Dead URLs</h1>
      <Heading level={2}>
        NOTE: this only works locally, (ask a dev to run this locally for results
        https://www.pivotaltracker.com/story/show/185355762)
      </Heading>
      <PrimaryButton onClick={handleDownloadClick} isColor={"primary"}>
        Click Here to Download, as a txt file
      </PrimaryButton>
      <Heading level={2}>Potentially broken links:</Heading>
      {Object.keys(props.deadLinks).map((page, i) => {
        return (
          <div key={i}>
            {props.deadLinks[page].length > 0 && (
              <>
                <div className="h4-styling">Page: {page}</div>
                <ul>
                  {props.deadLinks[page].map((link, i) => {
                    return <li key={i}>{link}</li>;
                  })}
                </ul>
              </>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <PageSkeleton>
      <NextSeo title={getNextSeoTitle(config.pagesMetadata.deadUrlsTitle)} noindex={true} />
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
  const buildCheckDeadPages =
    (process.env.CHECK_DEAD_LINKS && process.env.CHECK_DEAD_LINKS === "true") || false;
  return buildCheckDeadPages
    ? {
        props: {
          deadLinks: await findDeadLinks(),
          noAuth: true,
        },
      }
    : { notFound: true };
};

export default DeadUrlsPage;
