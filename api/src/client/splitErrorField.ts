export const splitErrorField = (errorField: string): string => {
  const fields = errorField.split(".");
  if (fields.length === 2) {
    return splitToSpaces(fields[1]);
  } else {
    fields.shift();
    return fields.map(splitToSpaces).join(" - ");
  }
};

const splitToSpaces = (str: string): string => {
  return str.split(/(?=[A-Z])/).join(" ");
};
