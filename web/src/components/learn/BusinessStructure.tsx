import { Content } from "@/components/Content";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { FormControl, MenuItem, Select, useMediaQuery } from "@mui/material";
import React, { ReactElement } from "react";

interface Props {
  heading: string;
}

export const BusinessStructure = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [structureId, setStructureId] = React.useState("llc");
  const dropdownOptions = Config.learnPageBusinessStructure.structures;
  const currentStructure =
    dropdownOptions.find((option) => {
      return option.id === structureId;
    }) ?? dropdownOptions[0];

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const cardStyling = isTabletAndUp ? "" : "width-full margin-bottom-1";

  return (
    <>
      <h2 className="text-secondary-darker">{props.heading}</h2>
      <br />
      <Content>{Config.learnPageBusinessStructure.overview}</Content>
      <br />
      <FormControl fullWidth variant="outlined">
        <Select
          fullWidth
          value={structureId}
          onChange={(event): void => {
            setStructureId(event.target.value);
          }}
        >
          {dropdownOptions.map(({ id, displayName }) => {
            return (
              <MenuItem key={id} value={id}>
                {displayName}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <br />
      <br />
      <h3>{currentStructure.displayName}</h3>
      <div className={`grid-row grid-gap-2`}>
        <span className={`tablet:grid-col ${cardStyling}`}>
          <LargeCallout calloutType={"informational"} fullHeight>
            <div className={""}>
              <h4 className="text-secondary-darker">In Simple Words</h4>
              <ul>
                {currentStructure.simpleWords.map((bullet) => {
                  return <li key={bullet.text}>{bullet.text}</li>;
                })}
              </ul>
            </div>
          </LargeCallout>
        </span>

        <span className={`tablet:grid-col ${cardStyling}`}>
          <LargeCallout calloutType={"conditional"} fullHeight>
            <div>
              <h4 className="text-secondary-darker">Advantages</h4>
              <ul>
                {currentStructure.advantages.map((bullet) => {
                  return <li key={bullet.text}>{bullet.text}</li>;
                })}
              </ul>
            </div>
          </LargeCallout>
        </span>

        <span className={`tablet:grid-col ${cardStyling}`}>
          <LargeCallout calloutType={"warning"} fullHeight>
            <div>
              <h4 className="text-secondary-darker">Disadvantages</h4>
              <ul>
                {currentStructure.disadvantages.map((bullet) => {
                  return <li key={bullet.text}>{bullet.text}</li>;
                })}
              </ul>
            </div>
          </LargeCallout>
        </span>
      </div>
      <br />
    </>
  );
};
