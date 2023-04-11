/* eslint-disable jsx-a11y/iframe-has-title */
import { GTM_ID } from "@/lib/utils/analytics";
import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import { ReactElement } from "react";

class CustomDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }
  render(): ReactElement {
    return (
      <Html lang="en">
        <Head>
          <Script src="/vendor/js/uswds-init.min.js" strategy="beforeInteractive" />
        </Head>
        <body>
          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
