import { Content } from "@/components/Content";
import { TaskFooterCtas } from "@/components/TaskFooterCtas";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement } from "react";

const PostOnboardingPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);

  const { body, ...postOnboardingQuestion } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <Content>{body}</Content>
      <TaskFooterCtas
        postOnboardingQuestion={postOnboardingQuestion}
        onboardingKey="constructionRenovationPlan"
        CMS_ONLY_forceDisplay={true}
      />
    </div>
  );
};

export default PostOnboardingPreview;
