import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Match } from "@/lib/search/typesForSearch";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  matches: Match[];
  collectionLabel: string;
}

export const MatchList = (props: Props): ReactElement<any> => {
  const COLLAPSED_LEN = 5;

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
        <strong>{props.collectionLabel}</strong>
        &nbsp;({props.matches.length})
      </span>
      <ul>
        {(expanded ? props.matches : collapsedMatches).map((match) => (
          <li key={match.filename}>
            <div>
              <b>{match.filename}</b>
            </div>
            {match.snippets.map((snippet, i) => (
              <div key={i}>{snippet}</div>
            ))}
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
