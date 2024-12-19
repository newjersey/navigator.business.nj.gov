import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { InputFile } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement } from "react";

interface Props {
  foreignGoodStandingFile: InputFile | undefined;
}

const uswdsFileImagePreview =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const ReviewForeignCertificate = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  return (
    <ReviewSubSection header={Config.formation.fields.foreignGoodStandingFile.label}>
      {props.foreignGoodStandingFile?.filename ? (
        <div className="fac margin-bottom-4">
          <img
            src={uswdsFileImagePreview}
            alt="file preview"
            className="usa-file-input__preview-image usa-file-input__preview-image--generic"
          />
          {props.foreignGoodStandingFile?.filename}
        </div>
      ) : (
        <div className="margin-bottom-4">
          <ReviewNotEntered />
        </div>
      )}
    </ReviewSubSection>
  );
};
