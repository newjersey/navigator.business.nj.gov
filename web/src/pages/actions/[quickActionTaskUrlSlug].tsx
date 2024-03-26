import { QuickActionPage } from "@/components/dashboard/quick-actions/QuickActionPage";
import {
  loadAllQuickActionTaskUrlSlugs,
  loadQuickActionTaskByUrlSlug,
  QuickActionTaskUrlSlugParam,
} from "@/lib/static/loadQuickActionTasks";
import { QuickActionTask } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { ReactElement } from "react";

interface Props {
  quickActionTask: QuickActionTask;
}

const QuickActionTaskPage = (props: Props): ReactElement => {
  return <QuickActionPage quickAction={props.quickActionTask} />;
};

export const getStaticPaths = (): GetStaticPathsResult<QuickActionTaskUrlSlugParam> => {
  const paths = loadAllQuickActionTaskUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: QuickActionTaskUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      quickActionTask: loadQuickActionTaskByUrlSlug(params.quickActionTaskUrlSlug),
    },
  };
};

export default QuickActionTaskPage;
