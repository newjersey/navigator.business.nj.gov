export default async (): Promise<void> => {
  process.env.INTERCOM_HASH_SECRET = "some-secret-key";
  if (!process.env.RANDOM_SEED) {
    process.env.RANDOM_SEED = Math.random().toString(36).slice(2);
  }
  const message = `Random seed: ${process.env.TESTING_SEED} ${
    process.env.CIRCLE_NODE_INDEX
      ? `${Number(process.env.CIRCLE_NODE_INDEX) + 1}/${process.env.CIRCLE_NODE_TOTAL} `
      : ""
  }(${expect.getState().currentTestName})`;
  console.log(message);
};
