import styles from "./layout.module.scss";
import Link from "next/link";
import { ReactElement, useContext } from "react";
import { FormContext } from "../pages/_app";

interface Props {
  children: React.ReactNode;
  home?: boolean;
}

export const TaskLayout = ({ children, home }: Props): ReactElement => {
  const { formData } = useContext(FormContext);

  const roadmapUrl = () => {
    if (formData.businessType) {
      return `/roadmaps/${formData.businessType.businessType}`;
    } else {
      return "/";
    }
  };

  return (
    <div className={styles.container}>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href={roadmapUrl()} passHref>
            <a href={roadmapUrl()}>← Back to Roadmap</a>
          </Link>
        </div>
      )}
    </div>
  );
};
