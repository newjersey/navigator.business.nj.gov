import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getMergedConfig } from "@/contexts/configContext";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useState } from "react";

interface Props {
  envVars: string;
  noAuth: boolean;
}

const FeatureFlagsPage = (props: Props): ReactElement<any> => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const config = getMergedConfig();

  const envVars = JSON.parse(props.envVars);

  const featuresWithSuffixes = Object.keys(envVars).filter((it) => {
    return it.startsWith("FEATURE_") && (it.endsWith("_STAGING") || it.endsWith("_PROD"));
  });

  const features = [
    ...new Set(
      featuresWithSuffixes.map((it) => {
        return it.split("_").slice(1, -1).join("_");
      })
    ),
  ];

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
          {features.map((it) => {
            return (
              <tr key={it}>
                <td>{it}</td>
                <td className={envVars[`FEATURE_${it}_STAGING`]?.includes("true") ? "enabled" : "disabled"}>
                  {envVars[`FEATURE_${it}_STAGING`] || "false"}
                </td>
                <td className={envVars[`FEATURE_${it}_PROD`]?.includes("true") ? "enabled" : "disabled"}>
                  {envVars[`FEATURE_${it}_PROD`] || "false"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );

  return (
    <PageSkeleton>
      <NextSeo title={getNextSeoTitle(config.pagesMetadata.featureFlagsTitle)} noindex={true} />
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

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      envVars: JSON.stringify(process.env),
      noAuth: true,
    },
  };
};

export default FeatureFlagsPage;
