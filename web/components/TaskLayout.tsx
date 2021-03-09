import Link from "next/link";
import { ReactElement } from "react";
import { useUserData } from "../lib/data/useUserData";
import { getRoadmapUrl } from "../lib/form-helpers/getRoadmapUrl";
import { SinglePageLayout } from "./njwds-extended/SinglePageLayout";

interface Props {
  children: React.ReactNode;
}

export const TaskLayout = ({ children }: Props): ReactElement => {
  const { userData } = useUserData();

  const roadmapUrl = userData ? getRoadmapUrl(userData.formData) : "/";

  return (
    <SinglePageLayout>
      <main>{children}</main>
      <Link href={roadmapUrl} passHref>
        <a href={roadmapUrl}>← Back to Roadmap</a>
      </Link>
    </SinglePageLayout>
  );
};
