import { Alert } from "@/components/njwds-extended/Alert";
import { TaskHeader } from "@/components/TaskHeader";
import { Content } from "@/components/Content";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { AvailableProps } from "@/components/tasks/search-business-name/AvailableProps";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { createEmptyFormationFormData, NameAvailability } from "@businessnjgovnavigator/shared";
import { createEmptyDbaDisplayContent } from "@businessnjgovnavigator/shared/types";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement, SetStateAction, useState } from "react";

type Props = { task: Task };

const SearchBusinessNameAvailable = ({ submittedName }: AvailableProps): ReactElement => {
  const { Config } = useConfig();
  return (
    <div data-testid="available-text">
      <Alert variant="success">
        <span className="font-sans-xs">
          {templateEval(Config.searchBusinessNameTask.availableText, { name: submittedName })}
        </span>
      </Alert>
    </div>
  );
};

const SearchBusinessNameUnavailable = ({
  submittedName,
  nameAvailability,
}: UnavailableProps): ReactElement => {
  const { Config } = useConfig();
  return (
    <div data-testid="unavailable-text">
      <Alert variant="error">
        <Content className="font-sans-xs">
          {templateEval(Config.searchBusinessNameTask.unavailableText, { name: submittedName })}
        </Content>
        {nameAvailability.similarNames.length > 0 && (
          <ul className="font-body-2xs">
            {nameAvailability.similarNames.map((name) => (
              <li className="text-uppercase text-bold margin-top-0" key={name}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </Alert>
    </div>
  );
};

export const SearchBusinessNameTask = ({ task }: Props): ReactElement => {
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | undefined>();
  const { business, updateQueue } = useUserData();
  const { queueUpdateTaskProgress, congratulatoryModal } = useUpdateTaskProgress();
  const { Config } = useConfig();

  const handleSetBusinessNameAvailability = (
    availability: SetStateAction<NameAvailability | undefined>,
  ): void => {
    const resolved =
      typeof availability === "function" ? availability(nameAvailability) : availability;
    setNameAvailability(resolved);
    if (resolved?.status === "AVAILABLE" && updateQueue) {
      queueUpdateTaskProgress(task.id, "COMPLETED");
      updateQueue.update();
    }
  };

  return (
    <BusinessFormationContext.Provider
      value={{
        state: {
          stepIndex: 0,
          formationFormData: {
            ...createEmptyFormationFormData(),
            legalType: "limited-liability-company",
          },
          businessNameAvailability: nameAvailability,
          dbaBusinessNameAvailability: undefined,
          showResponseAlert: false,
          hasBeenSubmitted: false,
          dbaContent: createEmptyDbaDisplayContent(),
          interactedFields: [],
          hasSetStateFirstTime: true,
          foreignGoodStandingFile: undefined,
          reviewCheckboxes: {
            namesAddressesDatesChecked: false,
            permanentRecordChecked: false,
            correctionFeesChecked: false,
          },
        },
        setFormationFormData: () => {},
        setStepIndex: () => {},
        setShowResponseAlert: () => {},
        setFieldsInteracted: () => {},
        setHasBeenSubmitted: () => {},
        setBusinessNameAvailability: handleSetBusinessNameAvailability,
        setDbaBusinessNameAvailability: () => {},
        setForeignGoodStandingFile: () => {},
        setReviewCheckboxes: () => {},
        allConfirmationsChecked: () => false,
      }}
    >
      <div>
        <TaskHeader task={task} />
        <SearchBusinessNameForm
          unavailable={SearchBusinessNameUnavailable}
          available={SearchBusinessNameAvailable}
          businessName={business?.profileData.businessName ?? ""}
          nameAvailability={nameAvailability}
          isBusinessFormation
          config={{
            searchButtonText: Config.searchBusinessNameTask.searchButtonText,
            searchButtonTestId: "search-business-name-availability",
            inputLabel: "Search business name",
          }}
        />
        {congratulatoryModal}
      </div>
    </BusinessFormationContext.Provider>
  );
};
