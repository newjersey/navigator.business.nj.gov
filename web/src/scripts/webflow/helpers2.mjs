export const wait = (milliseconds = 10000) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, milliseconds);
  });
};
