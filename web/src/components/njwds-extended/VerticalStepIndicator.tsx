import { SectionAccordionContext } from "@/contexts/sectionAccordionContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { useOnWindowResize } from "@/lib/utils/helpers";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useEffect } from "react";

interface Props {
  stepNumber: number;
  last: boolean;
  completed?: boolean;
  miniRoadmap?: boolean;
  miniRoadmapSubtaskisOpen?: boolean;
}

export const VerticalStepIndicator = (props: Props): ReactElement<any> => {
  const { business } = useUserData();
  const { isOpen: sectionIsOpen } = useContext(SectionAccordionContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const verticalHeight = document.getElementById(`vertical-content-${props.stepNumber}`)?.offsetHeight;
  const renderVerticalBar =
    (isTabletAndUp && sectionIsOpen && !props.miniRoadmap) ||
    (props.miniRoadmap && sectionIsOpen && (!props.last || props.miniRoadmapSubtaskisOpen));

  const resizeVerticalBarToContent = (): void => {
    const content = document.getElementById(`vertical-content-${props.stepNumber}`);
    const verticalBar = document.getElementById(`vertical-bar-${props.stepNumber}`);

    if (!content || !verticalBar) {
      return;
    }

    if (props.last) {
      verticalBar.style.height = `${content.offsetHeight}px`;
      return;
    }
    if (!props.last) {
      verticalBar.style.height = `${content.offsetHeight + 24}px`;
      return;
    }
  };

  useEffect(resizeVerticalBarToContent, [
    props.last,
    props.stepNumber,
    verticalHeight,
    sectionIsOpen,
    business,
  ]);
  useOnWindowResize(resizeVerticalBarToContent);
  return (
    <div className={`vertical-step-indicator`}>
      <div className={`usa-step-indicator usa-step-indicator--counters usa-step-indicator__segments`}>
        <div className="visually-hidden-centered">
          {props.completed ? `Completed step ${props.stepNumber}` : `Step ${props.stepNumber}`}
        </div>
        <div
          className={`usa-step-indicator__segment ${
            props.miniRoadmap ? "usa-step-indicator__segment-smaller" : ""
          }`}
          aria-hidden="true"
          data-num={props.stepNumber}
        />
        {renderVerticalBar && (
          <div
            aria-hidden="true"
            className={`vertical-bar${props.miniRoadmap ? "-smaller" : ""}`}
            id={`vertical-bar-${props.stepNumber}`}
          />
        )}
      </div>
    </div>
  );
};
