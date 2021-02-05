import "../styles/global.css";
import { AppProps } from "next/app";
import { ReactElement } from "react";

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  return <Component {...pageProps} />;
};

export default App;
