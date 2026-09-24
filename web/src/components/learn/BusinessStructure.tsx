import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import React, { ReactElement } from "react";
import { FormControl, MenuItem, Select, useMediaQuery } from "@mui/material";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { MediaQueries } from "@/lib/PageSizes";

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
  const cardStyling = isTabletAndUp ? "flex-third" : "width-full flex-shrink-0";

  return (
    <>
      <h2>{props.heading}</h2>
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
      <div className={`flex gap-2 ${!isTabletAndUp && "flex-column"}`}>
        <span className={cardStyling}>
          <LargeCallout calloutType={"informational"} fullHeight>
            <div className={"flex-column"}>
              <h3>In Simple Words</h3>
              <ul>
                {currentStructure.simpleWords.map((bullet) => {
                  return <li key={bullet.text}>{bullet.text}</li>;
                })}
              </ul>
            </div>
          </LargeCallout>
        </span>

        <span className={cardStyling}>
          <LargeCallout calloutType={"conditional"} fullHeight>
            <div>
              <h3>Advantages</h3>
              <ul>
                {currentStructure.advantages.map((bullet) => {
                  return <li key={bullet.text}>{bullet.text}</li>;
                })}
              </ul>
            </div>
          </LargeCallout>
        </span>

        <span className={cardStyling}>
          <LargeCallout calloutType={"warning"} fullHeight>
            <div>
              <h3>Disadvantages</h3>
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
