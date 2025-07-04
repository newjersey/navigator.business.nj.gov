import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { UsagesList } from "@/components/search/UsagesList";
import { Match } from "@/lib/search/typesForSearch";
import { ReactElement, useEffect, useState } from "react";
interface Props {
  matches: Match[];
  collectionLabel: string;
}

export const MatchList = (props: Props): ReactElement => {
  const COLLAPSED_LEN = 5;

  const [expandedMatches, setExpandedMatches] = useState<boolean>(false);
  const collapsedMatches = props.matches.slice(0, COLLAPSED_LEN);

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
            {match.cmsCollectionName && (
              <a
                href={`/mgmt/cms#/collections/${match.cmsCollectionName}/entries/${match.filename}`}
                target="_blank"
                rel="noreferrer"
              >
                <b>{match.displayTitle || match.filename}</b>
              </a>
            )}
            <ul>
              <li>
                Snipet(s):
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
