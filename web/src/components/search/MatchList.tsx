import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { UsagesList } from "@/components/search/UsagesList";
import cmsMapJson from "@/lib/cms/CollectionMap.json";
import { Match } from "@/lib/search/typesForSearch";
import { CMSMap } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useEffect, useState } from "react";
interface Props {
  matches: Match[];
  collectionLabel: string;
}

export const MatchList = (props: Props): ReactElement => {
  const COLLAPSED_LEN = 5;

  const [expandedMatches, setExpandedMatches] = useState<boolean>(false);
  const collapsedMatches = props.matches.slice(0, COLLAPSED_LEN);
  const cmsMap: CMSMap = cmsMapJson;
  useEffect(() => {
    setExpandedMatches(false);
  }, [props.matches]);

  if (props.matches.length === 0) {
    return <></>;
  }

  const toggleExpanded = (): void => {
    setExpandedMatches((prev) => !prev);
  };

  return (
    <div className="margin-top-3 margin-left-6">
      <span className="font-body-lg">
        <strong>{props.collectionLabel}</strong>
        &nbsp;({props.matches.length})
      </span>
      <ul>
        {(expandedMatches ? props.matches : collapsedMatches).map((match) => (
          <li key={match.filename}>
            {cmsMap[match.filename]?.[props.collectionLabel] ? (
              <a
                href={`/mgmt/cms#/collections/${cmsMap[match.filename][props.collectionLabel]}/entries/${match.filename}`}
                target="_blank"
                rel="noreferrer"
              >
                <b>{match.displayTitle || match.filename}</b>
              </a>
            ) : (
              <b>{match.displayTitle || match.filename}</b>
            )}

            <ul>
              <li>
                Snippet(s):
                <ul>
                  {match.snippets.map((snippet, i) => (
                    <li key={i}>{snippet}</li>
                  ))}
                </ul>
              </li>

              {match.additionalUsageLocations !== undefined && (
                <li>
                  Usage:
                  <ul>
                    <UsagesList match={match} />
                  </ul>
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>
      {collapsedMatches.length < props.matches.length && (
        <UnStyledButton onClick={toggleExpanded} className="margin-left-2">
          {expandedMatches ? "Collapse" : "See all"}
        </UnStyledButton>
      )}
    </div>
  );
};
