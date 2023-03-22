import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { findDeadLinks } from "@/lib/static/admin/findDeadLinks";
import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useState } from "react";

interface Props {
  deadLinks: Record<string, string[]>;
  noAuth: boolean;
}

const DeadUrlsPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const authedView = (
    <>
      <h1>Dead URLs</h1>
      <h2>Potentially broken links:</h2>
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
      <NextSeo noindex={true} />
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
