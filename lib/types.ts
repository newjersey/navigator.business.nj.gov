export type PostData = {
  date: string;
  title: string;
  id: string;
  contentHtml: string;
};

export type PostOverview = {
  date: string;
  title: string;
  id: string;
};

export type PathParams<P> = { params: P; locale?: string };
export type IdParam = {
  id: string;
};
