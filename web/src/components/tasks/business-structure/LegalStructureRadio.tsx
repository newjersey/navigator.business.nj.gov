import { Content } from "@/components/Content";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import {
  LegalStructure,
  LegalStructures,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { orderBy } from "lodash";
import React, { ForwardedRef, forwardRef, ReactElement, useContext } from "react";

interface Props {
  taskId: string;
}

const LegalStructureRadio = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLDivElement>): ReactElement => {
    const { state, setProfileData } = useContext(ProfileDataContext);
    const { Config } = useConfig();
    const { queueUpdateTaskProgress } = useUpdateTaskProgress();

    const contentFromConfig: ConfigType["profileDefaults"]["fields"]["legalStructureId"]["default"] =
      getProfileConfig({
        config: Config,
        persona: state.flow,
        fieldName: "legalStructureId",
      });

    const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
      "legalStructureId",
      DataFormErrorMapContext,
      undefined,
    );

    RegisterForOnSubmit(() => state.profileData.legalStructureId !== undefined);

    const commonLegalStructures: LegalStructure[] = LegalStructures.filter((ls) => {
      return ls.isCommon;
    });

    const otherLegalStructures: LegalStructure[] = LegalStructures.filter((ls) => {
      return !ls.isCommon;
    });

    const commonLegalStructuresOrdered: LegalStructure[] = orderBy(
      commonLegalStructures,
      (legalStructure: LegalStructure) => {
        return legalStructure.onboardingOrder;
      },
    );

    const otherLegalStructuresOrdered: LegalStructure[] = orderBy(
      otherLegalStructures,
      (legalStructure: LegalStructure) => {
        return legalStructure.onboardingOrder;
      },
    );

    const handleLegalStructure = (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
    ): void => {
      setIsValid(true);
      queueUpdateTaskProgress(props.taskId, "TO_DO");
      setProfileData({
        ...state.profileData,
        legalStructureId: event.target.value as string,
        operatingPhase:
          state.profileData.operatingPhase === OperatingPhaseId.GUEST_MODE
            ? OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
            : state.profileData.operatingPhase,
      });
    };

    const makeLabel = (legalStructureId: string): ReactElement => {
      return (
        <div data-value={legalStructureId} className={"text-bold"}>
          {LookupLegalStructureById(legalStructureId).name}
        </div>
      );
    };

    return (
      <>
        {isFormFieldInvalid && (
          <div className={"padding-bottom-1"}>
            <Alert variant="error" dataTestid="business-structure-alert" ref={ref}>
              {Config.businessStructurePrompt.businessStructureNotSelectedAlertText}
            </Alert>
          </div>
        )}
        <WithErrorBar hasError={isFormFieldInvalid} type="ALWAYS">
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={
                <Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />
              }
              aria-controls={`common-business-structures-content`}
              id={`common-business-structures-header`}
              data-testid={`common-business-structures-header`}
            >
              <Heading level={3} className={`flex flex-align-center margin-0-override`}>
                <div className="inline">Common Business Structures</div>
              </Heading>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl variant="outlined" fullWidth>
                <RadioGroup
                  aria-label="Common business structures"
                  name="common-legal-structures"
                  value={state.profileData.legalStructureId || ""}
                  onChange={handleLegalStructure}
                >
                  {commonLegalStructuresOrdered.map((legalStructure) => {
                    return (
                      <div className="margin-bottom-2" key={legalStructure.id}>
                        <FormControlLabel
                          aria-label={legalStructure.id}
                          style={{ alignItems: "center" }}
                          labelPlacement="end"
                          key={legalStructure.id}
                          data-testid={legalStructure.id}
                          value={legalStructure.id}
                          control={<Radio color={isFormFieldInvalid ? "error" : "primary"} />}
                          label={makeLabel(legalStructure.id)}
                        />

                        {(contentFromConfig.optionContent as Record<string, string>)[
                          legalStructure.id
                        ] && (
                          <div className="margin-left-4 padding-left-05">
                            <Content>
                              {
                                (contentFromConfig.optionContent as Record<string, string>)[
                                  legalStructure.id
                                ]
                              }
                            </Content>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          <div className="margin-top-3 margin-bottom-1">
            <Accordion>
              <AccordionSummary
                expandIcon={
                  <Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />
                }
                aria-controls={`other-business-structures-content`}
                id={`other-business-structures-header`}
                data-testid={`other-business-structures-header`}
              >
                <Heading level={3} className={`flex flex-align-center margin-0-override`}>
                  <div className="inline">Other Business Structures</div>
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <WithErrorBar hasError={isFormFieldInvalid} type="ALWAYS">
                  <FormControl variant="outlined" fullWidth>
                    <RadioGroup
                      aria-label="Other business structures"
                      name="other-legal-structures"
                      value={state.profileData.legalStructureId || ""}
                      onChange={handleLegalStructure}
                    >
                      {otherLegalStructuresOrdered.map((legalStructure) => {
                        return (
                          <div className="margin-bottom-2" key={legalStructure.id}>
                            <FormControlLabel
                              aria-label={legalStructure.id}
                              style={{ alignItems: "center" }}
                              labelPlacement="end"
                              key={legalStructure.id}
                              data-testid={legalStructure.id}
                              value={legalStructure.id}
                              control={<Radio color={isFormFieldInvalid ? "error" : "primary"} />}
                              label={makeLabel(legalStructure.id)}
                            />

                            {(contentFromConfig.optionContent as Record<string, string>)[
                              legalStructure.id
                            ] && (
                              <div className="margin-left-4 padding-left-05">
                                <Content>
                                  {
                                    (contentFromConfig.optionContent as Record<string, string>)[
                                      legalStructure.id
                                    ]
                                  }
                                </Content>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                </WithErrorBar>
              </AccordionDetails>
            </Accordion>
          </div>
          {isFormFieldInvalid && (
            <div className="text-error-dark text-bold" data-testid="business-structure-error">
              {contentFromConfig.errorTextRequired}
            </div>
          )}
        </WithErrorBar>
      </>
    );
  },
);

LegalStructureRadio.displayName = "LegalStructureRadio";

export { LegalStructureRadio };
