import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
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

    const customComponents = {
      greenCheckmark: <Icon className="inline-icon text-green">check_circle</Icon>,
      redXMark: <Icon className="inline-icon text-red">cancel</Icon>,
    };

    return (
      <>
        <Content>{beforeIndentation}</Content>
        <div className="margin-left-8 margin-y-2">
          <Content customComponents={customComponents}>{indentedSection}</Content>
        </div>
        <div>
          <Content>{afterIndentation}</Content>
        </div>
      </>
    );
  };

  return (
    <div data-testid={"authorization-step"} className="flex flex-column space-between minh-38">
      <div>
        <>
          {getFormattedBody()}
          {state.dbaContent.Authorize.issuingAgency || state.dbaContent.Authorize.formName ? (
            <>
              <hr className="margin-y-3" />
              {state.dbaContent.Authorize.issuingAgency ? (
                <div>
                  <span className="h5-styling">{`${Config.taskDefaults.issuingAgencyText}: `}</span>
                  <span className="h6-styling">{state.dbaContent.Authorize.issuingAgency}</span>
                </div>
              ) : null}
              {state.dbaContent.Authorize.formName ? (
                <div>
                  <span className="h5-styling">{`${Config.taskDefaults.formNameText}: `}</span>
                  <span className="h6-styling">{state.dbaContent.Authorize.formName}</span>
                </div>
              ) : null}
            </>
          ) : null}
        </>
      </div>
    </div>
  );
};
