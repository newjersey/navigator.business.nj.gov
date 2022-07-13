import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import * as apiClient from "@/lib/api-client/apiClient";
import { findDeadContextualInfo, findDeadTasks } from "@/lib/static/admin/findDeadLinks";
import { TextField } from "@mui/material";
import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ChangeEvent, KeyboardEvent, ReactElement, useState } from "react";

interface Props {
  deadTasks: string[];
  deadContextualInfo: string[];
  noAuth: boolean;
}

const DeadLinksPage = (props: Props): ReactElement => {
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
      .post("/mgmt/auth", { password }, false)
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
      <h1>Dead Content</h1>
      <h2>Tasks not referenced in any roadmap:</h2>
      <ul>
        {props.deadTasks.map((task, i) => (
          <li key={i}>{task}</li>
        ))}
      </ul>
      <h2>Contextual infos not referenced anywhere:</h2>
      <ul>
        {props.deadContextualInfo.map((info, i) => (
          <li key={i}>{info}</li>
        ))}
      </ul>
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
          deadTasks: await findDeadTasks(),
          deadContextualInfo: await findDeadContextualInfo(),
          noAuth: true,
        },
      };
};

export default DeadLinksPage;
