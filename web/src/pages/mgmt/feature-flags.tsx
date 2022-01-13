import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import * as apiClient from "@/lib/api-client/apiClient";
import { TextField } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ChangeEvent, KeyboardEvent, ReactElement, useState } from "react";

interface Props {
  envVars: string;
}

const FeatureFlagsPage = (props: Props): ReactElement => {
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

  const envVars = JSON.parse(props.envVars);
  const featuresWithSuffixes = Object.keys(envVars).filter((it) => it.startsWith("FEATURE_"));
  const features = [...new Set(featuresWithSuffixes.map((it) => it.split("_").slice(1, -1).join("_")))];

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
      <h1>Feature flags</h1>
      <table className="env-table">
        <thead>
          <tr>
            <td>flag</td>
            <td>STAGING</td>
            <td>PROD</td>
          </tr>
        </thead>
        <tbody>
          {features.map((it) => (
            <tr key={it}>
              <td>{it}</td>
              <td className={envVars[`FEATURE_${it}_STAGING`]?.includes("true") ? "enabled" : "disabled"}>
                {envVars[`FEATURE_${it}_STAGING`] || "false"}
              </td>
              <td className={envVars[`FEATURE_${it}_PROD`]?.includes("true") ? "enabled" : "disabled"}>
                {envVars[`FEATURE_${it}_PROD`] || "false"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      envVars: JSON.stringify(process.env),
    },
  };
};

export default FeatureFlagsPage;
