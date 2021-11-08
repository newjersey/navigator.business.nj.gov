import { BusinessNameClient, SearchBusinessName } from "../types";
import { searchBusinessNameFactory } from "./searchBusinessNameFactory";

describe("searchBusinessNames", () => {
  let stubBusinessNameClient: jest.Mocked<BusinessNameClient>;
  let searchBusinessName: SearchBusinessName;

  beforeEach(() => {
    stubBusinessNameClient = { search: jest.fn() };

    searchBusinessName = searchBusinessNameFactory(stubBusinessNameClient);
  });

  it("removes articles, designators, trailing punctuation before searching", async () => {
    stubBusinessNameClient.search.mockResolvedValue([]);
    await searchBusinessName("the ()my c-o-o-l a business,,, llc.");
    expect(stubBusinessNameClient.search).toHaveBeenCalledWith("my c-o-o-l business");
  });

  it("is unavailable when names are identical and returns similar names", async () => {
    stubBusinessNameClient.search.mockResolvedValue(["my cool business"]);
    const nameAvailability = await searchBusinessName("my cool business");
    expect(nameAvailability.status).toEqual("UNAVAILABLE");
    expect(nameAvailability.similarNames).toEqual(["my cool business"]);
  });

  it("is unavailable when names contain the searched name", async () => {
    stubBusinessNameClient.search.mockResolvedValue(["191 RENTALS AND STORAGE LLC"]);
    const nameAvailability = await searchBusinessName("191 rentals");
    expect(nameAvailability.status).toEqual("UNAVAILABLE");
    expect(nameAvailability.similarNames).toEqual(["191 RENTALS AND STORAGE LLC"]);
  });

  it("limits similar names to max 10", async () => {
    stubBusinessNameClient.search.mockResolvedValue(Array(11).fill("my cool business"));
    const nameAvailability = await searchBusinessName("my cool business");
    expect(nameAvailability.similarNames).toHaveLength(10);
  });

  it("rejects if the search name becomes essentially empty", async () => {
    await expect(searchBusinessName("LLC.")).rejects.toEqual("BAD_INPUT");
  });

  describe("ignores punctuation differences", () => {
    const testValues = ["my-cool-business", "my cool, business", "my: cool business", 'my "cool" business'];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameClient.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });

  describe("ignores whitespace changes", () => {
    const testValues = ["mycool business", "my  cool business"];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameClient.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });

  describe("ignores articles", () => {
    const testValues = ["a my cool business", "my the cool business", "my cool business an"];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameClient.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });

  describe("ignores business types", () => {
    const testValues = [
      "my cool business llc",
      "my the cool business limited liability company",
      "my cool business inc",
      "my cool business incorporated",
      "my cool business a nj nonprofit corporation",
    ];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameClient.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });

  describe("ignores casing", () => {
    const testValues = ["my cool business LLC", "my COOL business", "The my cool business"];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameClient.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });
});
