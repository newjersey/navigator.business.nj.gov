import { NameAvailabilityResponse } from "@shared/businessNameSearch";
import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import { generateBusinessNameAvailabilityResponse } from "@shared/test";
import { BusinessNameClient, TimeStampBusinessSearch } from "../types";
import { timeStampBusinessSearch } from "./timeStampBusinessSearch";

describe("timeStampBusinessSearch", () => {
  let stubBusinessNameClient: jest.Mocked<BusinessNameClient>;
  let searchAndAddTimeStamp: TimeStampBusinessSearch;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubBusinessNameClient = {
      search: jest.fn(),
    };
    searchAndAddTimeStamp = await timeStampBusinessSearch(stubBusinessNameClient);
  });

  it("calls the business name client and adds the current iso date", async () => {
    const nameAvailability: NameAvailabilityResponse = generateBusinessNameAvailabilityResponse({
      status: "AVAILABLE",
    });
    stubBusinessNameClient.search.mockResolvedValue(nameAvailability);

    const result = await searchAndAddTimeStamp.search("test-business");
    expect(stubBusinessNameClient.search).toHaveBeenCalledWith("test-business");
    expect(result.status).toEqual(nameAvailability.status);
    expect(parseDate(result.lastUpdatedTimeStamp).isSame(getCurrentDate(), "minute")).toEqual(true);
  });

  it("limits similar names returned to 10", async () => {
    const nameAvailability: NameAvailabilityResponse = generateBusinessNameAvailabilityResponse({
      status: "UNAVAILABLE",
      similarNames: Array.from({ length: 20 }).fill("abc") as string[],
    });

    stubBusinessNameClient.search.mockResolvedValue(nameAvailability);

    const result = await searchAndAddTimeStamp.search("test-business");
    expect(result.similarNames).toHaveLength(10);
  });
});
