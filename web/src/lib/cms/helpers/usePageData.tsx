import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";

export const usePageData = <T,>(props: PreviewProps) => {
  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  return { contentMd: body, ...data } as T;
};
