import { Content } from "@/components/Content";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const ContentPreview = (props: PreviewProps) => {
  const ref = usePreviewRef(props);

  const { body } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <Content>{body}</Content>
    </div>
  );
};

export default ContentPreview;
