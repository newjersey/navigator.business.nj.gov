import styles from "./layout.module.scss";
import Link from "next/link";
import { ReactElement } from "react";
import { useUserData } from "../lib/data/useUserData";
import { getRoadmapUrl } from "../lib/form-helpers/getRoadmapUrl";

interface Props {
  children: React.ReactNode;
  home?: boolean;
}

export const TaskLayout = ({ children, home }: Props): ReactElement => {
  const { userData } = useUserData();

  const roadmapUrl = userData ? getRoadmapUrl(userData.formData) : "/";

  return (
    <div className={styles.container}>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href={roadmapUrl} passHref>
            <a href={roadmapUrl}>← Back to Roadmap</a>
          </Link>
        </div>
      )}
    </div>
  );
};
