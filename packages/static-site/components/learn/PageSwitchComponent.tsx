import type { ReactElement } from "react";
import PageContent from "@/components/learn/PageContent";
import type { PageItem } from "@/domain/content/types";

interface Props {
  readonly page: PageItem;
}

export const PageSwitchComponent = ({ page }: Props): ReactElement => {
  switch (page.slug) {
    default:
      return <PageContent page={page} />;
  }
};
