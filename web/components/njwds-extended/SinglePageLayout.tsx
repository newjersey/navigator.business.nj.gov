import { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
}

export const SinglePageLayout = ({ children }: Props): ReactElement => {
  return (
    <div className="usa-section">
      <div className="grid-container">
        <div className="grid-row grid-gap">
          <main className="desktop:grid-col-12 usa-prose">{children}</main>
        </div>
      </div>
    </div>
  );
};
