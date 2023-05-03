import Home from "@/pages/index";
import { ReactElement } from "react";

const WelcomePage = (): ReactElement => {
  return <Home isWelcomePage={true} />;
};

export default WelcomePage;
