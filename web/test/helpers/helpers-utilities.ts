export const getLastCalledWith = <T, R>(fn: jest.MockInstance<T, R[]>): R[] => {
  const lastIndex = fn.mock.calls.length - 1;
  return fn.mock.calls[lastIndex];
};

export const getNumberOfMockCalls = <T, R>(fn: jest.MockInstance<T, R[]>): number => {
  return fn.mock.calls.length;
};

export const randomElementFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const markdownToText = (text: string): string => {
  let returnText = text;
  if (text.includes("[")) {
    returnText = returnText.split("[")[1].split("]")[0].trim();
  }
  if (returnText.includes("#")) {
    returnText = returnText.split("#").join("").trim();
  }
  if (returnText.includes("*")) {
    returnText = returnText.split("*").join("").trim();
  }
  return returnText;
};
