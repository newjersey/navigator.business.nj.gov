export const titlePrefix = "Business.NJ.gov";

export const getFormattedMetadata = (title: string | undefined): string => {
  const pageTitle = title;

  if (pageTitle !== undefined && pageTitle !== "") {
    //findByTitle and findByTitlePrefix

    return `[${titlePrefix}] | ${pageTitle}`;
  } else {
    return `[${titlePrefix}]`;
  }
};
