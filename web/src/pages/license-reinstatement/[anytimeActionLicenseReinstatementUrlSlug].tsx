import { AnytimeActionPage } from "@/components/dashboard/anytime-actions/AnytimeActionPage";
import {
  AnytimeActionLicenseReinstatementUrlSlugParam,
  loadAllAnytimeActionLicenseReinstatementsUrlSlugs,
  loadAnytimeActionLicenseReinstatementsByUrlSlug,
} from "@/lib/static/loadAnytimeActionLicenseReinstatements";
import { AnytimeActionLicenseReinstatement } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { ReactElement } from "react";

interface Props {
  anytimeActionLicenseReinstatement: AnytimeActionLicenseReinstatement;
}

const AnytimeActionLicenseReinstatementPage = (props: Props): ReactElement => {
  return (
    <>
      <AnytimeActionPage anytimeAction={props.anytimeActionLicenseReinstatement} />
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<AnytimeActionLicenseReinstatementUrlSlugParam> => {
  const paths = loadAllAnytimeActionLicenseReinstatementsUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: AnytimeActionLicenseReinstatementUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      anytimeActionLicenseReinstatement: loadAnytimeActionLicenseReinstatementsByUrlSlug(
        params.anytimeActionLicenseReinstatementUrlSlug
      ),
    },
  };
};

export default AnytimeActionLicenseReinstatementPage;
