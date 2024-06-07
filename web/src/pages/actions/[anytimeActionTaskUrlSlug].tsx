import { AnytimeActionPage } from "@/components/dashboard/anytime-actions/AnytimeActionPage";
import {
  AnytimeActionTaskUrlSlugParam,
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "@/lib/static/loadAnytimeActionTasks";
import { AnytimeActionTask } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { ReactElement } from "react";

interface Props {
  anytimeActionTask: AnytimeActionTask;
}

const AnytimeActionTaskPage = (props: Props): ReactElement => {
  return <AnytimeActionPage anytimeAction={props.anytimeActionTask} />;
};

export const getStaticPaths = (): GetStaticPathsResult<AnytimeActionTaskUrlSlugParam> => {
  const paths = loadAllAnytimeActionTaskUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: AnytimeActionTaskUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      anytimeActionTask: loadAnytimeActionTaskByUrlSlug(params.anytimeActionTaskUrlSlug),
    },
  };
};

export default AnytimeActionTaskPage;
