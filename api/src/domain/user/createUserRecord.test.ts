import { createUserRecord } from "@domain/user/createUserRecord";
import { DatabaseClient, MessagingServiceClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
import { CONFIG_VARS, getConfigValue } from "@libs/ssmUtils";
import { generateUser, generateUserData } from "@shared/test";
import { generateHashedKey } from "@test/helpers";

jest.mock("@libs/ssmUtils", () => ({ getConfigValue: jest.fn() }));
const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  (name: CONFIG_VARS) => Promise<string>
>;

describe("createUserRecord", () => {
  let stubDatabaseClient: jest.Mocked<DatabaseClient>;
  let stubMessagingServiceClient: jest.Mocked<MessagingServiceClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    stubDatabaseClient = {
      migrateOutdatedVersionUsers: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findAllByEmail: jest.fn(),
      claimEmailSignIn: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
    };
    stubMessagingServiceClient = { sendMessage: jest.fn(), health: jest.fn() };
    stubDatabaseClient.put.mockImplementation(async (userData) => userData);
    mockGetConfigValue.mockResolvedValue("false");
  });

  it("hashes the myNJ key into intercomHash when one is given", async () => {
    const userData = generateUserData({ user: generateUser({ myNJUserKey: undefined }) });

    const result = await createUserRecord({
      userData,
      databaseClient: stubDatabaseClient,
      messagingServiceClient: stubMessagingServiceClient,
      logger: DummyLogWriter,
      myNJUserKey: "mynj-key",
    });

    expect(result.user.myNJUserKey).toBe("mynj-key");
    expect(result.user.intercomHash).toBe(generateHashedKey("mynj-key"));
  });

  it("hashes the user id when no myNJ key is given", async () => {
    const userData = generateUserData({
      user: generateUser({ id: "native-sub", myNJUserKey: "native-sub" }),
    });

    const result = await createUserRecord({
      userData,
      databaseClient: stubDatabaseClient,
      messagingServiceClient: stubMessagingServiceClient,
      logger: DummyLogWriter,
    });

    expect(result.user.myNJUserKey).toBe("native-sub");
    expect(result.user.intercomHash).toBe(generateHashedKey("native-sub"));
  });

  it("stores the email lowercased so email resolution can find it", async () => {
    const userData = generateUserData({ user: generateUser({ email: "Jane@Example.COM" }) });

    const result = await createUserRecord({
      userData,
      databaseClient: stubDatabaseClient,
      messagingServiceClient: stubMessagingServiceClient,
      logger: DummyLogWriter,
    });

    expect(result.user.email).toBe("jane@example.com");
  });

  it("stamps the creation and update timestamps", async () => {
    const userData = generateUserData({
      dateCreatedISO: "2000-01-01T00:00:00.000Z",
      lastUpdatedISO: "2000-01-01T00:00:00.000Z",
    });

    const result = await createUserRecord({
      userData,
      databaseClient: stubDatabaseClient,
      messagingServiceClient: stubMessagingServiceClient,
      logger: DummyLogWriter,
    });

    expect(result.dateCreatedISO).not.toBe("2000-01-01T00:00:00.000Z");
    expect(result.lastUpdatedISO).toBe(result.dateCreatedISO);
    expect(stubDatabaseClient.put).toHaveBeenCalledWith(result);
  });

  it("sends the welcome message when the flag is on", async () => {
    mockGetConfigValue.mockResolvedValue("true");
    stubMessagingServiceClient.sendMessage.mockResolvedValue({ success: true, messageId: "abc" });
    const userData = generateUserData({});

    await createUserRecord({
      userData,
      databaseClient: stubDatabaseClient,
      messagingServiceClient: stubMessagingServiceClient,
      logger: DummyLogWriter,
    });

    expect(stubMessagingServiceClient.sendMessage).toHaveBeenCalledWith(
      userData.user.id,
      "welcome-email",
    );
  });

  it("still returns the saved record when the welcome message throws", async () => {
    mockGetConfigValue.mockResolvedValue("true");
    stubMessagingServiceClient.sendMessage.mockRejectedValue(new Error("lambda down"));
    const userData = generateUserData({});

    const result = await createUserRecord({
      userData,
      databaseClient: stubDatabaseClient,
      messagingServiceClient: stubMessagingServiceClient,
      logger: DummyLogWriter,
    });

    expect(result.user.id).toBe(userData.user.id);
  });

  it("does not send the welcome message when the flag is off", async () => {
    const userData = generateUserData({});

    await createUserRecord({
      userData,
      databaseClient: stubDatabaseClient,
      messagingServiceClient: stubMessagingServiceClient,
      logger: DummyLogWriter,
    });

    expect(stubMessagingServiceClient.sendMessage).not.toHaveBeenCalled();
  });
});
