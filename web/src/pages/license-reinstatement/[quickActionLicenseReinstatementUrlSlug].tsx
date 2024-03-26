import { QuickActionPage } from "@/components/dashboard/quick-actions/QuickActionPage";
import {
  loadAllQuickActionLicenseReinstatementsUrlSlugs,
  loadQuickActionLicenseReinstatementsByUrlSlug,
  QuickActionLicenseReinstatementUrlSlugParam,
} from "@/lib/static/loadQuickActionLicenseReinstatements";
import { QuickActionLicenseReinstatement } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { ReactElement } from "react";

interface Props {
  quickActionLicenseReinstatement: QuickActionLicenseReinstatement;
}

const QuickActionLicenseReinstatementPage = (props: Props): ReactElement => {
  return (
    <>
      <QuickActionPage quickAction={props.quickActionLicenseReinstatement} />
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<QuickActionLicenseReinstatementUrlSlugParam> => {
  const paths = loadAllQuickActionLicenseReinstatementsUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: QuickActionLicenseReinstatementUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      quickActionLicenseReinstatement: loadQuickActionLicenseReinstatementsByUrlSlug(
        params.quickActionLicenseReinstatementUrlSlug
      ),
    },
  };
};

export default QuickActionLicenseReinstatementPage;
