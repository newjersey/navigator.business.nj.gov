const HealthCheck = () => {
  return <>Application is healthy</>;
};

export default HealthCheck;

export async function getStaticProps() {
  return {
    props: { noAuth: true },
  };
}
