/* eslint-disable @typescript-eslint/no-explicit-any */

import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNetlifyConfig } from "@/lib/static/admin/getNetlifyConfig";
import { flattenObject } from "@/lib/utils/helpers";
import { TextField } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ChangeEvent, KeyboardEvent, ReactElement, useMemo, useState } from "react";

interface Props {
  netlifyConfig: any;
  noAuth: boolean;
}

type ConfigMatch = {
  topLevel: string;
  secondLevel: string;
  value: string;
  netlifyCollectionName: string;
  netlifyFieldLabel: string;
};

const SearchContentPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [matches, setMatches] = useState<ConfigMatch[]>([]);

  const { Config } = useConfig();

  const netlifyGeneralConfigList = useMemo(() => {
    return props.netlifyConfig["collections"].find((it: any) => {
      return it.name === "config";
    })["files"][0]["fields"];
  }, [props.netlifyConfig]);

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>, submit: () => void): void => {
    if (event.code === "Enter") {
      submit();
    }
  };

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const onSearchSubmit = (): void => {
    const matchesWithoutLabels = getKeysFromConfig(searchTerm);
    const matchesWithLabels = matchesWithoutLabels.map(lookupNetlifyLabels);
    setMatches(matchesWithLabels);
  };

  const getKeysFromConfig = (searchTerm: string): ConfigMatch[] => {
    const matches = [];
    const topLevelKeys = Object.keys((Config as any)["default"]);
    for (const topLevelKey of topLevelKeys) {
      const secondLevelObj = (Config as any)[topLevelKey];
      const flattened = flattenObject(secondLevelObj);
      const secondLevelKeys: string[] = Object.keys(flattened);

      for (const secondLevelKey of secondLevelKeys) {
        const value = flattened[secondLevelKey];
        if (value.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push({
            topLevel: topLevelKey,
            secondLevel: secondLevelKey,
            value: value,
            netlifyCollectionName: "",
            netlifyFieldLabel: "",
          });
        }
      }
    }

    return matches;
  };

  const lookupNetlifyLabels = (match: ConfigMatch): ConfigMatch => {
    const group = netlifyGeneralConfigList.find((it: any) => {
      return it.name === match.topLevel;
    });
    const entry = group["fields"].find((it: any) => {
      return it.name === match.secondLevel;
    });

    return {
      ...match,
      netlifyCollectionName: group.label || "",
      netlifyFieldLabel: entry.label || "",
    };
  };

  const groupMatchesByTopLevel = (): Record<string, ConfigMatch[]> => {
    return matches.reduce((acc, curr) => {
      acc[curr.netlifyCollectionName] = acc[curr.netlifyCollectionName] || [];
      acc[curr.netlifyCollectionName].push(curr);
      return acc;
    }, Object.create(null));
  };

  const groupedMatches = groupMatchesByTopLevel();

  const authedView = (
    <>
      <>
        <label htmlFor="search">Search Exact Text</label>
        <TextField
          fullWidth
          name="search"
          variant="outlined"
          type="text"
          value={searchTerm}
          onChange={handleSearchInput}
          onKeyPress={(event) => {
            return handleKeyPress(event, onSearchSubmit);
          }}
          inputProps={{
            id: "search",
          }}
        />
        <button onClick={onSearchSubmit} className="usa-button margin-top-2">
          Submit
        </button>
      </>
      {matches.length > 0 && (
        <div>
          <h1 className="margin-bottom-4">
            You can find this in the{" "}
            <a href="https://dev.navigator.business.nj.gov/mgmt/cms#/collections/config">General Config</a>{" "}
            under:
          </h1>
        </div>
      )}
      {Object.keys(groupedMatches).map((collectioName) => {
        return (
          <div key={collectioName}>
            <h2 className="margin-top-3">{collectioName}</h2>
            {groupedMatches[collectioName].map((it, i) => {
              return (
                <div key={i}>
                  <div>
                    <strong>{it.netlifyFieldLabel}</strong>
                  </div>
                  <div>{it.value}</div>
                  <hr />
                </div>
              );
            })}
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

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      netlifyConfig: getNetlifyConfig(),
      noAuth: true,
    },
  };
};

export default SearchContentPage;
