import { BusinessNameRepo } from "../domain/types";
import { PostgresBusinessNameRepo } from "./PostgresBusinessNameRepo";

describe("PostgresBusinessNameRepo", () => {
  let businessNameRepo: BusinessNameRepo;

  beforeEach(async () => {
    const connection = {
      user: "postgres",
      host: "localhost",
      database: process.env.DB_NAME_CI || "businesstest",
      password: process.env.DB_PASSWORD_CI || "",
      port: 5432,
    };
    businessNameRepo = PostgresBusinessNameRepo(connection);
    await businessNameRepo.deleteAll();
  });

  afterAll(async () => {
    await businessNameRepo.deleteAll();
  });

  describe("search", () => {
    it("finds similar business names", async () => {
      await businessNameRepo.save("applebees");
      await businessNameRepo.save("apple farm");
      await businessNameRepo.save("something else");

      const pinelists = await businessNameRepo.search("apple");
      expect(pinelists.length).toEqual(2);
      expect(pinelists).toEqual(expect.arrayContaining(["applebees", "apple farm"]));
    });

    it("ignores casing", async () => {
      await businessNameRepo.save("Applebees");
      await businessNameRepo.save("apple Farm");
      await businessNameRepo.save("someTHing else");

      const pinelists = await businessNameRepo.search("apple");
      expect(pinelists.length).toEqual(2);
      expect(pinelists).toEqual(expect.arrayContaining(["Applebees", "apple Farm"]));
    });
  });

  afterAll(async () => {
    await businessNameRepo.disconnect();
  });
});
