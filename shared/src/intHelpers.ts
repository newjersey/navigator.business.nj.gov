export const randomInt = (length = 8): number => {
  return Math.floor(10 ** (length - 1) + Math.random() * (10 ** length - 10 ** (length - 1) - 1));
};

export const randomIntFromInterval = (min: string, max: string): number => {
  return Math.floor(Math.random() * (Number(max) - Number(min) + 1) + Number(min));
};

export const convertSignedByteArrayToUnsigned = (signedByteArray: number[]): number[] =>
  signedByteArray.map((signedByte) => {
    if (signedByte < -128 || signedByte > 127) {
      throw new Error(`"Invalid signedByte ${signedByte}, expected -128 <= signedByte <= 127"`);
    }
    return signedByte & 0xff;
  });
