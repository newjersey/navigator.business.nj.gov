import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const Authorization = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const getFormattedBody = (): ReactElement => {
    const [beforeIndentation, after] = state.dbaContent.Authorize.contentMd.split(
      "${beginIndentationSection}"
    );
    const [indentedSection, afterIndentation] = after.split("${endIndentationSection}");

    return (
      <>
        <Content>{state.dbaContent.Authorize.summaryDescriptionMd}</Content>
        <HorizontalLine />
        <Content>{beforeIndentation}</Content>
        <div className="margin-left-8 margin-y-2">
          <Content>{indentedSection}</Content>
        </div>
        <div>
          <Content>{afterIndentation}</Content>
        </div>
      </>
    );
  };

  return (
    <div data-testid={"authorization-step"} className="flex flex-column space-between min-height-38rem">
      <div>
        <>
          {getFormattedBody()}
          {(state.dbaContent.Authorize.agencyId || state.dbaContent.Authorize.formName) && <HorizontalLine />}
          {state.dbaContent.Authorize.agencyId && (
            <div>
              <span className="h5-styling">{`${Config.taskDefaults.issuingAgencyText}: `}</span>
              <span className="h6-styling">{state.dbaContent.Authorize.agencyId}</span>
            </div>
          )}
          {state.dbaContent.Authorize.formName && (
            <div>
              <span className="h5-styling">{`${Config.taskDefaults.formNameText}: `}</span>
              <span className="h6-styling">{state.dbaContent.Authorize.formName}</span>
            </div>
          )}
        </>
      </div>
    </div>
  );
};
