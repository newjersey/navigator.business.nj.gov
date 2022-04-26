export default async (): Promise<void> => {
  // eslint-disable-next-line functional/immutable-data
  process.env.INTERCOM_HASH_SECRET = "some-secret-key";
};
