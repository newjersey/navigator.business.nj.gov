interface PreviewEntry {
  getIn: (keyPath: string[]) => unknown;
  toJS: () => { slug: string };
}

export type PreviewProps = {
  entry: PreviewEntry;
  window: Window;
  document: Document;
  fieldsMetaData: unknown;
  widgetsFor: (string: string) => unknown;
  widgetFor: (string: string) => unknown;
  getAsset: (string: string) => unknown;
};
