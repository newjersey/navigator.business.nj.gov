import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { ConfigMatchList } from "@/components/search/ConfigMatchList";
import { MatchList } from "@/components/search/MatchList";
import { cmsCollections } from "@/lib/search/cmsCollections";
import { GroupedConfigMatch, Match } from "@/lib/search/typesForSearch";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  matchedCollections: Record<string, Match[]>;
  groupedConfigMatches: GroupedConfigMatch[];
}

export const MatchCollection = (props: Props): ReactElement<any> => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useEffect(() => {
    setIsOpen(true);
  }, [props]);

  const firstLabel = Object.keys(props.matchedCollections)[0];
  const collectionTitle = cmsCollections.find((it) => it.children.includes(firstLabel))?.label;

  const configMatchesInThisCollection = props.groupedConfigMatches.filter((configMatch) => {
    const cmsHeaderForMatch = cmsCollections.find((it) =>
      it.children.includes(configMatch.cmsCollectionName)
    )?.label;
    return cmsHeaderForMatch === collectionTitle;
  });

  const countAllMatchesInCollections = Object.values(props.matchedCollections).reduce(
    (acc: number, curr: Match[]) => {
      return acc + curr.length;
    },
    0
  );

  const totalMatches = countAllMatchesInCollections + configMatchesInThisCollection.length;

  const hasNoMatches = totalMatches === 0;

  if (hasNoMatches) {
    return <></>;
  }

  return (
    <Accordion expanded={isOpen} onChange={(): void => setIsOpen((prev) => !prev)}>
      <AccordionSummary
        expandIcon={<Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />}
      >
        <Heading level={2} className="margin-y-2">
          {collectionTitle}
          <span style={{ fontWeight: 300 }} className="margin-left-1">
            ({totalMatches})
          </span>
        </Heading>
      </AccordionSummary>
      <AccordionDetails>
        {Object.keys(props.matchedCollections).map((it) => (
          <MatchList key={it} matches={props.matchedCollections[it]} collectionLabel={it} />
        ))}

        {configMatchesInThisCollection.map((it: GroupedConfigMatch) => (
          <ConfigMatchList
            key={it.cmsFileName}
            matches={it.matches}
            fileName={it.cmsFileName}
            collectionName={it.cmsCollectionName}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};
