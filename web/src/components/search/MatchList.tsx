import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Match } from "@/lib/search/typesForSearch";
import { ReactElement, useMemo, useState } from "react";

interface Props {
  matches: Match[];
  collectionLabel: string;
}

export const MatchList = (props: Props): ReactElement => {
  const COLLAPSED_LEN = 5;

  const [expanded, setExpanded] = useState<boolean>(false);
  const collapsedMatches = useMemo(() => props.matches.slice(0, COLLAPSED_LEN), [props.matches]);

  if (props.matches.length === 0) {
    return <></>;
  }

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="margin-top-3">
      <span className="font-body-lg">Collection:&nbsp;</span>
      <span className="font-body-lg">
        <b>{props.collectionLabel}</b>
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
        <UnStyledButton style="tertiary" onClick={toggleExpanded} className="margin-left-2">
          {expanded ? "Collapse" : "See all"}
        </UnStyledButton>
      )}
    </div>
  );
};
