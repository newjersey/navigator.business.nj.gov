export default async (): Promise<void> => {
  process.env.INTERCOM_HASH_SECRET = "some-secret-key";
};
