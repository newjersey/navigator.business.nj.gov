import "../styles/global.scss";
// import "/css/styles.css";
// import "/js/uswds-init.js";
// import "/js/uswds.js";
import { AppProps } from "next/app";
import { ReactElement } from "react";

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <>
      <script src="/js/uswds.js" />
      <script src="/js/uswds-init.js" />
      <link rel="stylesheet" href="/css/styles.css" />
      <Component {...pageProps} />
    </>
  );
};

export default App;
