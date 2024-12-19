import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ConfigMatch } from "@/lib/search/typesForSearch";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  matches: ConfigMatch[];
  collectionName: string;
  fileName: string;
}

export const ConfigMatchList = (props: Props): ReactElement<any> => {
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
        <strong>{`${props.collectionName} > ${props.fileName}`}</strong>
        &nbsp;({props.matches.length})
      </span>
      <ul>
        {(expanded ? props.matches : collapsedMatches).map((match, i) => (
          <li key={i}>
            <div>
              <b>{match.cmsLabelPath.slice(2).join(" > ")}</b>
            </div>
            {match.value}
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
