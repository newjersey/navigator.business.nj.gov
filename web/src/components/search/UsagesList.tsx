import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import {
  AdditionalUsageLocations,
  LinkWithDescription,
  Match,
} from "@businessnjgovnavigator/shared/lib/search/typesForSearch";
import { ReactElement, useState } from "react";

interface Props {
  match: Match;
}

export const UsagesList = (props: Props): ReactElement => {
  const outputElements: ReactElement[] = [];

  const renderAdditionalUsages = (): ReactElement => {
    if (props.match.additionalUsageLocations !== undefined) {
      for (const key of Object.keys(
        props.match.additionalUsageLocations,
      ) as (keyof AdditionalUsageLocations)[]) {
        const usageArray = props.match.additionalUsageLocations[key];
        if (usageArray !== undefined) {
          outputElements.push(<UsageListElement myKey={key} usageArray={usageArray} />);
        }
      }
    }
    return <>{outputElements}</>;
  };

  return <>{renderAdditionalUsages()} </>;
};

interface UsageListElementProps {
  myKey: string;
  usageArray: LinkWithDescription[] | undefined;
}

const UsageListElement = (props: UsageListElementProps): ReactElement => {
  const COLLAPSED_LEN = 4;

  const [expandedMatches, setExpandedMatches] = useState<boolean>(false);

  const toggleExpanded = (): void => {
    setExpandedMatches((prev) => !prev);
  };

  if (props.usageArray !== undefined) {
    const collapsedMatches = props.usageArray.slice(0, COLLAPSED_LEN);

    console.log(props.usageArray);

    return (
      <li>
        {props.myKey}
        <ul>
          {(expandedMatches ? props.usageArray : collapsedMatches).map((usage, i) => (
            <li key={i}>
              <a href={usage.link} target="_blank" rel="noreferrer">
                <div>{usage.description}</div>
              </a>
            </li>
          ))}
          {collapsedMatches.length < props.usageArray.length && (
            <UnStyledButton onClick={toggleExpanded} className="margin-left-2">
              {expandedMatches ? "Collapse Usages" : "See All Usages"}
            </UnStyledButton>
          )}
        </ul>
      </li>
    );
  }
  return <></>;
};
