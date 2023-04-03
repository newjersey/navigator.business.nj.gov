import { GetStaticPropsResult } from "next";
import { ReactElement } from "react";

const HealthCheck = (): ReactElement => {
  return <>Application is healthy</>;
};

export default HealthCheck;

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}
