import { searchBusinessAddressesForMatches } from "@client/dynamics/license-status/searchBusinessAddressesForMatches";
import { NO_ADDRESS_MATCH_ERROR } from "@domain/types";
import { generateLicenseSearchAddress } from "@shared/test";

describe("searchBusinessAddressesForMatch", () => {
  const userInputtedAddress = generateLicenseSearchAddress({
    addressLine1: "Main St",
    addressLine2: "Apt 1",
    zipCode: "12345",
  });
  const matchedAddress1 = generateLicenseSearchAddress({
    addressLine1: "Main St",
    addressLine2: "Apt 1",
    zipCode: "12345",
  });
  const matchedAddress2 = generateLicenseSearchAddress({
    addressLine1: "Main St",
    addressLine2: "Apt 1",
    zipCode: "12345",
  });
  const randomBusinessWithRandomAddresses1 = {
    businessId: "randomBusiness1",
    name: "Business 1",

    addresses: [generateLicenseSearchAddress({}), generateLicenseSearchAddress({})],
  };
  const randomBusinessWithRandomAddresses2 = {
    businessId: "randomBusiness2",
    name: "Business 2",

    addresses: [generateLicenseSearchAddress({}), generateLicenseSearchAddress({})],
  };
  const businessWithNoAddresses = {
    businessId: "noAddressBusiness",
    name: "Business 0",

    addresses: [],
  };

  describe("single business ids", () => {
    it("returns correct business id when it has two matching addresses", () => {
      const businessIdAndMatchingAddresses = {
        name: "Some Business1",
        businessId: "matchingBusinessId-1234",
        addresses: [matchedAddress1, matchedAddress2],
      };
      const result = searchBusinessAddressesForMatches([businessIdAndMatchingAddresses], userInputtedAddress);
      expect(result).toEqual([{ businessId: "matchingBusinessId-1234", name: "Some Business1" }]);
    });

    it("throws NO_ADDRESS_MATCH_ERROR when there is no match", () => {
      expect(() =>
        searchBusinessAddressesForMatches([randomBusinessWithRandomAddresses1], userInputtedAddress)
      ).toThrow(NO_ADDRESS_MATCH_ERROR);
    });

    it("throws NO_ADDRESS_MATCH_ERROR when there are no addresses", () => {
      expect(() => searchBusinessAddressesForMatches([businessWithNoAddresses], userInputtedAddress)).toThrow(
        NO_ADDRESS_MATCH_ERROR
      );
    });
  });

  describe("multiple business ids", () => {
    it("returns correct business id when it has one matching address", () => {
      const businessIdWithMatchingAddress = {
        name: "Some Business2",
        businessId: "matchingBusinessId-1234",
        addresses: [matchedAddress1, generateLicenseSearchAddress({})],
      };
      const result = searchBusinessAddressesForMatches(
        [businessIdWithMatchingAddress, randomBusinessWithRandomAddresses1],
        userInputtedAddress
      );
      expect(result).toEqual([{ businessId: "matchingBusinessId-1234", name: "Some Business2" }]);
    });

    it("returns correct business id when it has two matching addresses", () => {
      const businessIdAndMatchingAddresses = {
        businessId: "matchingBusinessId-1234",
        name: "Some Business3",
        addresses: [matchedAddress1, matchedAddress2],
      };
      const result = searchBusinessAddressesForMatches(
        [businessIdAndMatchingAddresses, randomBusinessWithRandomAddresses1],
        userInputtedAddress
      );
      expect(result).toEqual([{ businessId: "matchingBusinessId-1234", name: "Some Business3" }]);
    });

    it("returns both business ids when there is more than one match across two different business ids", () => {
      const businessIdAndMatchingAddresses = {
        businessId: "matchingBusinessId-1234",
        name: "Some Business3",
        addresses: [matchedAddress1, matchedAddress2],
      };
      const businessIdAndMatchingAddresses2 = {
        businessId: "matchingBusinessId-5678",
        name: "Some Business4",
        addresses: [matchedAddress1, matchedAddress2],
      };
      const result = searchBusinessAddressesForMatches(
        [businessIdAndMatchingAddresses, businessIdAndMatchingAddresses2],
        userInputtedAddress
      );
      expect(result).toEqual([
        { businessId: "matchingBusinessId-1234", name: "Some Business3" },
        { businessId: "matchingBusinessId-5678", name: "Some Business4" },
      ]);
    });

    it("returns correct business id when it has one matching address and other has no address", () => {
      const businessIdAndMatchingAddresses = {
        businessId: "matchingBusinessId-1234",
        name: "Some Business5",
        addresses: [matchedAddress1, generateLicenseSearchAddress({})],
      };

      const result = searchBusinessAddressesForMatches(
        [businessWithNoAddresses, businessIdAndMatchingAddresses],
        userInputtedAddress
      );
      expect(result).toEqual([{ businessId: "matchingBusinessId-1234", name: "Some Business5" }]);
    });

    it("throws NO_ADDRESS_MATCH_ERROR when there is no match", () => {
      expect(() =>
        searchBusinessAddressesForMatches(
          [randomBusinessWithRandomAddresses1, randomBusinessWithRandomAddresses2],
          userInputtedAddress
        )
      ).toThrow(NO_ADDRESS_MATCH_ERROR);
    });
  });
});
