import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const OpenAccount = (): ReactElement => {
  const { Config } = useConfig();
  const h3Override = ({ children }: { children: string[] }): ReactElement => (
    <h3 className="text-accent-cool-darker">{children}</h3>
  );

  return (
    <>
      <h2 className="text-secondary-darker">{Config.learnPageOpenAccount.heading}</h2>
      <Content overrides={{ h3: h3Override }}>{Config.learnPageOpenAccount.content}</Content>
    </>
  );
};
