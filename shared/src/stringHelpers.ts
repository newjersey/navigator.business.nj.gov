export const toProperCase = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value.replaceAll(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};
