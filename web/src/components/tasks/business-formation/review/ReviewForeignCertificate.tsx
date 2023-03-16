import { useConfig } from "@/lib/data-hooks/useConfig";
import { InputFile } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement } from "rehype-react/lib";
import { ReviewSection } from "./section/ReviewSection";

interface Props {
  foreignGoodStandingFile: InputFile | undefined;
}

const filePreviewImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // taken from USWDS

export const ReviewForeignCertificate = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <ReviewSection
      buttonText={Config.formation.general.editButtonText}
      header={Config.formation.fields.foreignGoodStandingFile.label}
      stepName="Business"
      testId="edit-foreign-certificate-step"
    >
      {props.foreignGoodStandingFile?.filename ? (
        <div className="fac">
          <img
            src={filePreviewImage}
            alt="file preview"
            className="usa-file-input__preview-image usa-file-input__preview-image--generic"
          />
          {props.foreignGoodStandingFile?.filename}
        </div>
      ) : (
        <i>{Config.formation.general.notEntered}</i>
      )}
    </ReviewSection>
  );
};
