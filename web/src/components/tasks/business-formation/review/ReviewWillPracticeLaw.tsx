import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "rehype-react/lib";
import { ReviewSection } from "./section/ReviewSection";

interface Props {
  willPracticeLaw: boolean | undefined;
}

export const ReviewWillPracticeLaw = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const displayResponse = (): ReactElement => {
    if (props.willPracticeLaw === undefined) {
      return <i>{Config.formation.general.notEntered}</i>;
    } else {
      return <>{props.willPracticeLaw ? "Yes" : "No"}</>;
    }
  };
  return (
    <ReviewSection
      buttonText={Config.formation.general.editButtonText}
      header={Config.formation.fields.willPracticeLaw.label}
      stepName="Business"
      testId="edit-will-practice-law-step"
    >
      {displayResponse()}
    </ReviewSection>
  );
};
