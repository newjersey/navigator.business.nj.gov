/* eslint-disable @typescript-eslint/no-explicit-any */

import { BusinessPersona } from "@businessnjgovnavigator/shared";

// slug in the form anyLabel-info-poppy
export const getMetadataFromSlug = (slug: string): { tab: string; businessPersona: BusinessPersona } => {
  const [, tab, persona] = slug.split("-");
  const businessPersona = (() => {
    switch (persona) {
      case "oscar":
        return "OWNING";
      case "poppy":
        return "STARTING";
      case "dakota":
        return "FOREIGN";
      default:
        return "STARTING";
    }
  })();
  return {
    tab: tab,
    businessPersona,
  };
};

export type PreviewProps = {
  entry?: any;
  window: Window;
  document: Document;
  fieldsMetaData: any;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};
