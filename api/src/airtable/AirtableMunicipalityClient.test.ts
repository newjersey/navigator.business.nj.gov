/* eslint-disable @typescript-eslint/ban-ts-comment */

import Airtable from "airtable";
import { AirtableMunicipality, AirtableMunicipalityClient } from "./AirtableMunicipalityClient";
import { MunicipalityClient, MunicipalityDetail } from "../domain/types";

jest.mock("airtable");
const mockAirtable = Airtable as jest.Mocked<typeof Airtable>;

describe("AirtableMunicipalityClient", () => {
  let airtableMunicipalityClient: MunicipalityClient;
  let eachPageMock: jest.Mock;
  let findMock: jest.Mock;
  beforeEach(() => {
    jest.resetAllMocks();

    eachPageMock = jest.fn();
    findMock = jest.fn();
    mockAirtable.configure = jest.fn();
    // @ts-ignore
    mockAirtable.base.mockReturnValue(() => ({
      select: jest.fn().mockReturnValue({
        eachPage: eachPageMock,
      }),
      find: findMock,
    }));

    airtableMunicipalityClient = AirtableMunicipalityClient("api-key", "base-id");
  });

  it("initializes with secrets", () => {
    expect(mockAirtable.configure.mock.calls[0][0].apiKey).toEqual("api-key");
    expect(mockAirtable.base).toHaveBeenCalledWith("base-id");
  });

  it("returns all municipalities", (done) => {
    const municipality1 = generateAirtableMunicipality({
      id: "123",
      Municipality: "some-municipality",
      "County (Data)": ["some-county-id"],
      "Town Name": "some-town-name",
      "Town Website": "some-town-website",
      "County Name": ["some-county-name"],
      "County Clerk Phone": ["some-phone"],
      "County Clerks Office Webpage": ["some-clerk-webpage"],
      "County Website": ["some-county-website"],
    });

    airtableMunicipalityClient.findAll().then((found: MunicipalityDetail[]) => {
      expect(found).toEqual([
        {
          id: "123",
          townName: "some-municipality",
          townDisplayName: "some-town-name",
          townWebsite: "some-town-website",
          countyId: "some-county-id",
          countyName: "some-county-name",
          countyClerkPhone: "some-phone",
          countyClerkWebsite: "some-clerk-webpage",
          countyWebsite: "some-county-website",
        },
      ]);
      done();
    });

    const pageFn = eachPageMock.mock.calls[0][0];
    const doneFn = eachPageMock.mock.calls[0][1];
    pageFn([municipality1], jest.fn());
    doneFn();
  });

  it("returns a municipality by id", (done) => {
    const municipality1 = generateAirtableMunicipality({
      id: "123",
      Municipality: "some-municipality",
      "County (Data)": ["some-county-id"],
      "Town Name": "some-town-name",
      "Town Website": "some-town-website",
      "County Name": ["some-county-name"],
      "County Clerk Phone": ["some-phone"],
      "County Clerks Office Webpage": ["some-clerk-webpage"],
      "County Website": ["some-county-website"],
    });

    airtableMunicipalityClient.findOne("123").then((found: MunicipalityDetail) => {
      expect(findMock).toHaveBeenCalledWith("123", expect.anything());
      expect(found).toEqual({
        id: "123",
        townName: "some-municipality",
        townDisplayName: "some-town-name",
        townWebsite: "some-town-website",
        countyId: "some-county-id",
        countyName: "some-county-name",
        countyClerkPhone: "some-phone",
        countyClerkWebsite: "some-clerk-webpage",
        countyWebsite: "some-county-website",
      });
      done();
    });

    const callbackFn = findMock.mock.calls[0][1];
    callbackFn(undefined, municipality1);
  });
});

export const generateAirtableMunicipality = (overrides: AirtableMunicipality): unknown => {
  return {
    _rawJson: {
      id: overrides.id,
      fields: {
        ...overrides,
      },
    },
  };
};
