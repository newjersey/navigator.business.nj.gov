export const randomInt = (length = 8): number =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );

export const randomIntFromInterval = (min: string, max: string): number => {
  return Math.floor(Math.random() * (Number(max) - Number(min) + 1) + Number(min));
};
