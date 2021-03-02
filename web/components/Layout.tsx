import styles from "./layout.module.scss";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  home?: boolean;
}

export const Layout = ({ children, home }: Props): ReactElement => {
  return (
    <div className={styles.container}>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/" passHref>
            <a href="/">← Back to home</a>
          </Link>
        </div>
      )}
    </div>
  );
};
