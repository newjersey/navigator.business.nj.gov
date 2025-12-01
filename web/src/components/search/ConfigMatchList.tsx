import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { getCollectionInfo } from "@/lib/search/searchConfig";
import { ConfigMatch } from "@/lib/search/typesForSearch";
import { ReactElement, useEffect, useState } from "react";
interface Props {
  matches: ConfigMatch[];
  collectionName: string;
  fileName: string;
}

export const ConfigMatchList = (props: Props): ReactElement => {
  const COLLAPSED_LEN = 5;
  const collectionInfo = getCollectionInfo();
  const [expanded, setExpanded] = useState<boolean>(false);
  const collapsedMatches = props.matches.slice(0, COLLAPSED_LEN);

  useEffect(() => {
    setExpanded(false);
  }, [props.matches]);

  if (props.matches.length === 0) {
    return <></>;
  }

  const toggleExpanded = (): void => {
    setExpanded((prev) => !prev);
  };
  return (
    <div className="margin-top-3 margin-left-6">
      <span className="font-body-lg">
        <strong>{`${props.collectionName} > ${props.fileName}`}</strong>
        &nbsp;({props.matches.length})
      </span>
      <ul>
        {(expanded ? props.matches : collapsedMatches).map((match, i) => (
          <li key={i}>
            {collectionInfo ? (
              <a
                href={`/mgmt/cms#/collections/${collectionInfo.get(props.fileName)?.[0]}/entries/${
                  collectionInfo.get(props.fileName)?.[1]
                }`}
                target="_blank"
                rel="noreferrer"
              >
                <div>
                  <b>{match.cmsLabelPath.slice(2).join(" > ")}</b>
                </div>
              </a>
            ) : (
              <div>
                <b>{match.cmsLabelPath.slice(2).join(" > ")}</b>
              </div>
            )}
            <ul>
              <li>
                Snippet(s):
                <ul>
                  <li>{match.value}</li>
                </ul>
              </li>
            </ul>
          </li>
        ))}
      </ul>
      {collapsedMatches.length < props.matches.length && (
        <UnStyledButton onClick={toggleExpanded} className="margin-left-2">
          {expanded ? "Collapse" : "See all"}
        </UnStyledButton>
      )}
    </div>
  );
};
