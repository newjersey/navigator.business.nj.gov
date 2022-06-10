import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import * as apiClient from "@/lib/api-client/apiClient";
import { findDeadLinks } from "@/lib/static/admin/findDeadLinks";
import { TextField } from "@mui/material";
import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ChangeEvent, KeyboardEvent, ReactElement, useState } from "react";

interface Props {
  deadLinks: Record<string, string[]>;
  noAuth: boolean;
}

const DeadUrlsPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.code === "Enter") {
      onSubmit();
    }
  };

  const handlePasswordInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
  };

  const onSubmit = (): void => {
    apiClient
      .post("/mgmt/auth", { password })
      .then(() => setIsAuthed(true))
      .catch(() => {});
  };

  const unauthedView = (
    <>
      <h1>Enter admin password:</h1>
      <label htmlFor="password">Password</label>
      <TextField
        fullWidth
        name="password"
        variant="outlined"
        type="password"
        value={password}
        onChange={handlePasswordInput}
        onKeyPress={handleKeyPress}
        inputProps={{
          id: "password",
        }}
      />
      <button onClick={onSubmit} className="usa-button margin-top-2">
        Submit
      </button>
    </>
  );

  const authedView = (
    <>
      <h1>Dead URLs</h1>
      <h2>Potentially broken links:</h2>
      {Object.keys(props.deadLinks).map((page, i) => (
        <div key={i}>
          {props.deadLinks[page].length > 0 && (
            <>
              <div className="h4-styling">Page: {page}</div>
              <ul>
                {props.deadLinks[page].map((link, i) => (
                  <li key={i}>{link}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </>
  );

  return (
    <PageSkeleton>
      <NextSeo noindex={true} />
      <main>
        <SingleColumnContainer>{isAuthed ? authedView : unauthedView}</SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export const getServerSideProps = async (): Promise<GetServerSidePropsResult<Props>> => {
  const buildCheckDeadPages =
    (process.env.CHECK_DEAD_LINKS && process.env.CHECK_DEAD_LINKS == "true") || false;
  return !buildCheckDeadPages
    ? { notFound: true }
    : {
        props: {
          deadLinks: await findDeadLinks(),
          noAuth: true,
        },
      };
};

export default DeadUrlsPage;
