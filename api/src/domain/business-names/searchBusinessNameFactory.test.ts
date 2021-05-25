import { BusinessNameRepo, SearchBusinessName } from "../types";
import { searchBusinessNameFactory } from "./searchBusinessNameFactory";

describe("searchBusinessNames", () => {
  let stubBusinessNameRepo: jest.Mocked<BusinessNameRepo>;
  let searchBusinessName: SearchBusinessName;

  beforeEach(() => {
    stubBusinessNameRepo = {
      search: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
      disconnect: jest.fn(),
    };

    searchBusinessName = searchBusinessNameFactory(stubBusinessNameRepo);
  });

  it("removes articles, designators, trailing punctuation before searching", async () => {
    stubBusinessNameRepo.search.mockResolvedValue([]);
    await searchBusinessName("the my c'ool a business,,, llc");
    expect(stubBusinessNameRepo.search).toHaveBeenCalledWith("my c'ool business");
  });

  it("is unavailable when names are identical and returns similar names", async () => {
    stubBusinessNameRepo.search.mockResolvedValue(["my cool business"]);
    const nameAvailability = await searchBusinessName("my cool business");
    expect(nameAvailability.status).toEqual("UNAVAILABLE");
    expect(nameAvailability.similarNames).toEqual(["my cool business"]);
  });

  it("limits similar names to max 10", async () => {
    stubBusinessNameRepo.search.mockResolvedValue(Array(11).fill("my cool business"));
    const nameAvailability = await searchBusinessName("my cool business");
    expect(nameAvailability.similarNames).toHaveLength(10);
  });

  describe("ignores punctuation differences", () => {
    const testValues = ["my-cool-business", "my cool, business", "my: cool business", 'my "cool" business'];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameRepo.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });

  describe("ignores whitespace changes", () => {
    const testValues = ["mycool business", "my  cool business"];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameRepo.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });

  describe("ignores articles", () => {
    const testValues = ["a my cool business", "my the cool business", "my cool business an"];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameRepo.search.mockResolvedValue([value]);
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
        stubBusinessNameRepo.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });

  describe("ignores casing", () => {
    const testValues = ["my cool business LLC", "my COOL business", "The my cool business"];
    for (const value of testValues) {
      it(`is unavailable for ${value}`, async () => {
        stubBusinessNameRepo.search.mockResolvedValue([value]);
        expect((await searchBusinessName("my cool business")).status).toEqual("UNAVAILABLE");
      });
    }
  });
});
