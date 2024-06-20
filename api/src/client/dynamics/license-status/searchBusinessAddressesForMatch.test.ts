import { searchBusinessAddressesForMatch } from "@client/dynamics/license-status/searchBusinessAddressesForMatch";
import { NO_MATCH_ERROR } from "@domain/types";
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
    addresses: [generateLicenseSearchAddress({}), generateLicenseSearchAddress({})],
  };
  const randomBusinessWithRandomAddresses2 = {
    businessId: "randomBusiness2",
    addresses: [generateLicenseSearchAddress({}), generateLicenseSearchAddress({})],
  };
  const businessWithNoAddresses = {
    businessId: "noAddressBusiness",
    addresses: [],
  };

  describe("single business ids", () => {
    it("returns correct business id when it has two matching addresses", () => {
      const businessIdAndMatchingAddresses = {
        businessId: "matchingBusinessId-1234",
        addresses: [matchedAddress1, matchedAddress2],
      };
      const result = searchBusinessAddressesForMatch([businessIdAndMatchingAddresses], userInputtedAddress);
      expect(result).toEqual("matchingBusinessId-1234");
    });

    it("throws error when there is no match", () => {
      expect(() =>
        searchBusinessAddressesForMatch([randomBusinessWithRandomAddresses1], userInputtedAddress)
      ).toThrow(NO_MATCH_ERROR);
    });

    it("throws error when there are no addresses", () => {
      expect(() => searchBusinessAddressesForMatch([businessWithNoAddresses], userInputtedAddress)).toThrow(
        NO_MATCH_ERROR
      );
    });
  });

  describe("multiple business ids", () => {
    it("returns correct business id when it has one matching address", () => {
      const businessIdWithMatchingAddress = {
        businessId: "matchingBusinessId-1234",
        addresses: [matchedAddress1, generateLicenseSearchAddress({})],
      };
      const result = searchBusinessAddressesForMatch(
        [businessIdWithMatchingAddress, randomBusinessWithRandomAddresses1],
        userInputtedAddress
      );
      expect(result).toEqual("matchingBusinessId-1234");
    });

    it("returns correct business id when it has two matching addresses", () => {
      const businessIdAndMatchingAddresses = {
        businessId: "matchingBusinessId-1234",
        addresses: [matchedAddress1, matchedAddress2],
      };
      const result = searchBusinessAddressesForMatch(
        [businessIdAndMatchingAddresses, randomBusinessWithRandomAddresses1],
        userInputtedAddress
      );
      expect(result).toEqual("matchingBusinessId-1234");
    });

    it("returns correct business id when it has one matching address and other has no address", () => {
      const businessIdAndMatchingAddresses = {
        businessId: "matchingBusinessId-1234",
        addresses: [matchedAddress1, generateLicenseSearchAddress({})],
      };

      const result = searchBusinessAddressesForMatch(
        [businessWithNoAddresses, businessIdAndMatchingAddresses],
        userInputtedAddress
      );
      expect(result).toEqual("matchingBusinessId-1234");
    });

    it("throws error when there is no match", () => {
      expect(() =>
        searchBusinessAddressesForMatch(
          [randomBusinessWithRandomAddresses1, randomBusinessWithRandomAddresses2],
          userInputtedAddress
        )
      ).toThrow(NO_MATCH_ERROR);
    });

    it("throws error when there is more than one match across two different business ids", () => {
      const businessIdAndMatchingAddresses1 = {
        businessId: "businessId1",
        addresses: [matchedAddress1, generateLicenseSearchAddress({})],
      };
      const businessIdAndMatchingAddresses2 = {
        businessId: "businessId2",
        addresses: [matchedAddress2, generateLicenseSearchAddress({})],
      };
      expect(() =>
        searchBusinessAddressesForMatch(
          [businessIdAndMatchingAddresses1, businessIdAndMatchingAddresses2],
          userInputtedAddress
        )
      ).toThrow(NO_MATCH_ERROR);
    });
  });
});
