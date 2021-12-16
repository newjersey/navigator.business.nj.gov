import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import * as apiClient from "@/lib/api-client/apiClient";
import { findDeadContextualInfo, findDeadLinks, findDeadTasks } from "@/lib/static/admin/findDeadLinks";
import { TextField } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ChangeEvent, KeyboardEvent, ReactElement, useState } from "react";

interface Props {
  deadTasks: string[];
  deadContextualInfo: string[];
  deadLinks: Record<string, string[]>;
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
      <h1>Dead Links</h1>
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
      <h2>Potentially broken links:</h2>
      {Object.keys(props.deadLinks).map((page, i) => (
        <div key={i}>
          {props.deadLinks[page].length > 0 && (
            <>
              <h4>Page: {page}</h4>
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
      <SingleColumnContainer>
        <main>{isAuthed ? authedView : unauthedView}</main>
      </SingleColumnContainer>
    </PageSkeleton>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      deadTasks: await findDeadTasks(),
      deadContextualInfo: await findDeadContextualInfo(),
      deadLinks: await findDeadLinks(),
    },
  };
};

export default DeadLinksPage;
