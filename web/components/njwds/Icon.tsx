import { ReactElement } from "react";

interface Props {
  children: string;
}

export const Icon = (props: Props): ReactElement => {
  const styles = {
    background: `url(/img/${props.children}.svg) no-repeat center/.84375ex 1.35ex`,
    fontSize: "2rem",
    display: "inline-block",
    padding: ".5rem",
    height: "1rem",
  };

  return <div className="icon" style={styles} />;
};
