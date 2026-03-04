/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayOfSectors, randomInt } from "@businessnjgovnavigator/shared";
import fs from "fs";
import { loadAllFundings } from "../fundingExport";
import {
  agencyMap,
  contentMdToObject,
  createNewFundings,
  createNewSectors,
  deleteFundings,
  deleteSectors,
  getNewFundings,
  getNewSectors,
  getSectors,
  getSortedSectors,
  getUnUsedFundings,
  getUnUsedSectors,
  getUpdatedSectorNames,
  updateFundings,
  updateSectorNames,
} from "./fundingSync.ts";
import { catchRateLimitErrorAndRetry } from "./helpers.ts";
import { allIndustryId, fundingCollectionId, sectorCollectionId } from "./webflowIds.ts";

const adjustDateByDay = (dayValue) => {
  const d = new Date();
  d.setDate(d.getDate() + dayValue);
  return d.toLocaleDateString("en-US");
};

// Helper to create properly typed fetch response mocks
function createMockFetchResponse(data) {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

//todo create generator functions for this test data
const fundingMd = [
  {
    contentMd:
      "\n" +
      "The Clean Tech Research & Development (R&D) Voucher Program helps New Jersey early-stage clean tech and clean energy companies offset the cost of accessing equipment at participating New Jersey universities or federal labs for R&D.\n" +
      "\n" +
      "---\n" +
      "\n" +
      "### Eligibility\n" +
      "\n" +
      "- Must be a New Jersey-based clean energy and clean technology company\n" +
      "- Company must have 50 or fewer full-time employees\n" +
      "\n" +
      ':::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }\n' +
      "\n" +
      "Vouchers totaling up to $15,000 per year\n" +
      "\n" +
      ":::\n",
    filename: "clean-tech-research",
    urlSlug: "clean-tech-research",
    name: "Clean Tech Research & Development (R&D) Voucher Program",
    id: "clean-tech-research-development-rd-voucher-program",
    callToActionLink: "https://www.njeda.com/cleantechvoucher/",
    callToActionText: "Learn more",
    fundingType: "grant",
    agency: ["njeda"],
    publishStageArchive: "",
    status: "first come, first serve",
    programFrequency: "ongoing",
    businessStage: "early-stage",
    employeesRequired: "yes",
    homeBased: "yes",
    certifications: [],
    preferenceForOpportunityZone: "",
    county: ["All"],
    sector: [
      "technology",
      "clean-energy",
      "professional-scientific-and-technical-services",
      "manufacturing",
      "other-services",
    ],
    openDate: "",
    dueDate: adjustDateByDay(5),
    programPurpose: "",
    agencyContact: "",
  },
  {
    contentMd:
      "\n" +
      "New Jersey Clean Construction Program installs pollution control devices or replaces qualifying non-road construction equipment that reduces pollution. Businesses can apply to two grants: Off-Road Diesel Retrofit Grant and Off-Road Diesel Replacement Grant.\n" +
      "\n" +
      "---\n" +
      "\n" +
      "### Eligibility\n" +
      "\n" +
      "- Businesses or non-profits must own the non-road construction equipment\n" +
      "- Equipment must be used a minimum of 50% of the time in New Jersey for a current or future construction project in New Jersey\n" +
      "- Equipment cannot be planned to go out of use in the next 5 years\n" +
      "- Priority is given to urban areas, high frequency of use, and older models\n" +
      "\n" +
      ':::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }\n' +
      "\n" +
      "Award of up to $100,000 per piece of equipment purchased or replaced\n" +
      "\n" +
      ":::\n",
    filename: "dep-clean-construction",
    urlSlug: "clean-construction",
    name: "NJ Clean Construction Program",
    id: "dep-clean-construction",
    callToActionLink: "https://www.nj.gov/dep/grantandloanprograms/aqes-njccp.htm",
    callToActionText: "Learn More",
    fundingType: "grant",
    programPurpose: "",
    agency: ["njdep"],
    agencyContact: "",
    publishStageArchive: "",
    status: "first come, first serve",
    programFrequency: "reoccuring",
    businessStage: "both",
    employeesRequired: "n/a",
    homeBased: "unknown",
    certifications: ["woman-owned"],
    preferenceForOpportunityZone: "no",
    county: ["All"],
    sector: ["construction", "utilities"],
    openDate: "",
    dueDate: "",
  },
  {
    contentMd:
      "\n" +
      "NJ Accelerate supports accelerator programs and their graduate companies. Incentivizes graduate companies to locate and grow in New Jersey.\n" +
      "\n" +
      "---\n" +
      "\n" +
      "### Eligibility\n" +
      "\n" +
      "- Businesses in accelerator programs and graduates of approved accelerators\n" +
      "\n" +
      ':::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }\n' +
      "\n" +
      "> - 1:1 matching event sponsorship up to $100,000 for accelerator programs\n" +
      "> - 1:1 matching loan funding up to $250,000 and rent support for up to 6 months for graduate companies\n" +
      ":::\n",
    filename: "nj-accelerate",
    urlSlug: "nj-accelerate",
    name: "NJ Accelerate",
    id: "nj-accelerate",
    callToActionLink: "https://www.njeda.com/njaccelerate/",
    callToActionText: "Learn more",
    fundingType: "loan",
    agency: ["njeda"],
    publishStageArchive: "",
    status: "rolling application",
    programFrequency: "ongoing",
    businessStage: "early-stage",
    employeesRequired: "n/a",
    homeBased: "yes",
    certifications: ["veteran-owned", "small-business-enterprise"],
    preferenceForOpportunityZone: "",
    county: ["All"],
    sector: [],
    openDate: "",
    dueDate: "",
    programPurpose: "",
    agencyContact: "",
  },
];

const fundings = [
  {
    id: "62c5bc16a8f618275698c979",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "learn-more-url": "https://www.nj.gov/dep/grantandloanprograms/aqes-njccp.htm",
      "feature-on-recents": false,
      agency: "e5191b387dca9f56520a9fb24ad56f74",
      "certifications-2": ["63efba3124109fa20ee2a419"],
      "funding-type": "e84141a8393db92e7fbb14aad810be6d",
      "program-overview":
        "<p>New Jersey Clean Construction Program installs pollution control devices or replaces qualifying non-road construction equipment that reduces pollution. Businesses can apply to two grants: Off-Road Diesel Retrofit Grant and Off-Road Diesel Replacement Grant.</p>",
      eligibility:
        "<ul> <li>Businesses or non-profits must own the non-road construction equipment</li> <li>Equipment must be used a minimum of 50% of the time in New Jersey for a current or future construction project in New Jersey</li> <li>Equipment cannot be planned to go out of use in the next 5 years</li> <li>Priority is given to urban areas, high frequency of use, and older models</li> </ul>",
      benefit: "<p>Award of up to $100,000 per piece of equipment purchased or replaced</p>",
      name: "NJ Clean Construction Program",
      slug: "dep-clean-construction",
      "industry-reference": ["61c48e1c25e5672fad13ed46", "61c48e23def87f031aed93aa"],
      "funding-status": "c44fb3cfdfb8a5b52d694a578d0338c1",
      cid: fundingCollectionId,
    },
  },
  {
    id: "62c5bc1639c27700c64f4a70",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "learn-more-url": "https://www.njeda.com/njaccelerate/",
      "feature-on-recents": false,
      agency: "af647a925b907472a8ad9f5fe07ba6ed",
      "certifications-2": ["63efbab568f2aece7aabf60a", "63efbad363a8a73927b7996c"],
      "funding-type": "73274288235e87d48ca9b0227694455f",
      "program-overview":
        "<p>NJ Accelerate supports accelerator programs and their graduate companies. Incentivizes graduate companies to locate and grow in New Jersey.</p>",
      eligibility:
        "<ul> <li>Businesses in accelerator programs and graduates of approved accelerators</li> </ul>",
      benefit:
        "<ul> <li>1:1 matching event sponsorship up to $100,000 for accelerator programs</li> <li> 1:1 matching loan funding up to $250,000 and rent support for up to 6 months for graduate companies  </li> </ul>",
      name: "NJ Accelerate",
      slug: "nj-accelerate",
      "industry-reference": ["61c48e1b3257cc374781ee12"],
      "funding-status": "d9e4ad4201a1644abbcad6666bace0bc",
    },
  },
  {
    id: "62c5bc16d0a8cf081867afa2",
    isArchived: false,
    isDraft: false,
    fieldData: {
      "learn-more-url": "https://www.njeda.com/cleantechvoucher/",
      agency: "af647a925b907472a8ad9f5fe07ba6ed",
      "certifications-2": [],
      "funding-type": "e84141a8393db92e7fbb14aad810be6d",
      "program-overview":
        "<p>The Clean Tech Research &#x26; Development (R&#x26;D) Voucher Program helps New Jersey early-stage clean tech and clean energy companies offset the cost of accessing equipment at participating New Jersey universities or federal labs for R&#x26;D.</p>",
      eligibility:
        "<ul> <li>Must be a New Jersey-based clean energy and clean technology company</li> <li>Company must have 50 or fewer full-time employees</li> </ul>",
      benefit: "<p>Vouchers totaling up to $15,000 per year</p>",
      name: "Clean Tech Research & Development (R&D) Voucher Program",
      slug: "clean-tech-research-development-rd-voucher-program",
      "industry-reference": [
        "61c48e2398ac897a54c6f481",
        "61c48e1c72d22f453124a797",
        "61c48e22349da39322e4df2e",
        "61c48e200aeeec7a2af2497a",
        "62c54ce61497b56914905141",
      ],
      "funding-status": "c44fb3cfdfb8a5b52d694a578d0338c1",
    },
  },
];

const webflowSectors = [
  {
    name: "All Industries",
    slug: "all-industries",
    id: allIndustryId,
  },
  ...arrayOfSectors.map((i) => {
    return { id: randomInt(10), name: i.name, slug: i.id };
  }),
];

const formatResponseItems = (items) => {
  return items.map((item) => {
    const { id, ...fieldData } = item;
    return {
      id,
      fieldData,
    };
  });
};

jest.mock("../fundingExport");
jest.mock("fs", () => {
  const original = jest.requireActual("fs");
  return {
    ...original,
    readFileSync: jest.fn(),
  };
});

describe("webflow syncing", () => {
  const dateNow = Date.now();
  const currentDate = new Date(dateNow);
  // eslint-disable-next-line no-undef
  const realDateNow = Date.now.bind(global.Date);
  let mockFetch;

  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    global.Date.now = jest.fn(() => {
      return dateNow;
    });

    // eslint-disable-next-line no-undef
    process.env.WEBFLOW_API_TOKEN = "12345678910";

    mockFetch = jest.fn();
    // eslint-disable-next-line no-undef
    global.fetch = mockFetch;

    loadAllFundings.mockReturnValue(fundingMd);
    fs.readFileSync.mockImplementation((e) => {
      const original = jest.requireActual("fs");
      return e.includes("sectors.json")
        ? JSON.stringify({ arrayOfSectors })
        : original.readFileSync(e);
    });

    mockFetch.mockImplementation((url) => {
      if (url.includes(sectorCollectionId)) {
        return createMockFetchResponse({
          items: formatResponseItems(webflowSectors),
          pagination: { total: 1 },
        });
      }
      if (url.includes(fundingCollectionId)) {
        return createMockFetchResponse({ items: fundings, pagination: { total: 1 } });
      }
      return createMockFetchResponse({});
    });
  });

  afterEach(() => {
    // eslint-disable-next-line no-undef
    global.Date.now = realDateNow;
  });

  describe("sectors", () => {
    it("reads the sectors json file", async () => {
      fs.readFileSync.mockImplementation((e) => {
        const original = jest.requireActual("fs");
        return original.readFileSync(e);
      });
      const newSectors = getSectors();
      expect(newSectors.length > 0).toBeTruthy();
    });

    it("gets sectors to create", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          const filteredSectors = webflowSectors.filter((i) => i.slug !== "utilities");
          return createMockFetchResponse({
            items: formatResponseItems(filteredSectors),
            pagination: {
              total: 1,
            },
          });
        }
        return createMockFetchResponse({});
      });
      expect(true).toBeTruthy();
      const newSectors = await getNewSectors();
      expect(newSectors).toEqual([{ name: "Utilities", slug: "utilities" }]);
    });

    it("creates sectors", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          const filteredSectors = webflowSectors.filter((i) => i.slug !== "utilities");
          return createMockFetchResponse({
            items: formatResponseItems(filteredSectors),
            pagination: {
              total: 1,
            },
          });
        }
        return createMockFetchResponse({});
      });

      await createNewSectors();

      expect(mockFetch).toHaveBeenLastCalledWith(
        `https://api.webflow.com/v2/collections/${sectorCollectionId}/items`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer 12345678910",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            isArchived: false,
            isDraft: false,
            fieldData: {
              name: "Utilities",
              slug: "utilities",
            },
          }),
        },
      );
    });

    it("gets sectors to modify", async () => {
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: [
            ...arrayOfSectors.filter((i) => i.id !== "utilities"),
            { name: "Electric, Gas, and Oil suppliers", id: "utilities" },
          ],
        });
      });
      const updatedSectors = await getUpdatedSectorNames();
      expect(updatedSectors).toMatchObject([
        { fieldData: { name: "Electric, Gas, and Oil suppliers", slug: "utilities" } },
      ]);
    });

    it("modifies sectors", async () => {
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: [
            ...arrayOfSectors.filter((i) => i.id !== "utilities"),
            { name: "Electric, Gas, and Oil suppliers", id: "utilities" },
          ],
        });
      });
      await updateSectorNames();
      expect(mockFetch).toHaveBeenLastCalledWith(
        `https://api.webflow.com/v2/collections/${sectorCollectionId}/items/${
          webflowSectors.find((item) => {
            return item.slug === "utilities";
          }).id
        }`,
        {
          method: "PATCH",
          headers: { Authorization: "Bearer 12345678910", "content-type": "application/json" },
          body: JSON.stringify({ fieldData: { name: "Electric, Gas, and Oil suppliers" } }),
        },
      );
    });

    it("gets sectors to delete", async () => {
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: arrayOfSectors.filter((i) => i.id !== "utilities"),
        });
      });
      const unUsedSectors = await getUnUsedSectors();
      const utilitiesSector = unUsedSectors.find((i) => i.fieldData.slug === "utilities");
      expect(utilitiesSector).toBeTruthy();
      expect(unUsedSectors.find((i) => i.slug === "all-industries")).toBeFalsy();
      expect(unUsedSectors.length).toEqual(1);
    });

    it("deletes sectors", async () => {
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: arrayOfSectors.filter((i) => {
            return i.id !== "utilities";
          }),
        });
      });
      const unUsedSectors = await getUnUsedSectors();
      const utilitiesSector = unUsedSectors.find((i) => {
        return i.fieldData.slug === "utilities";
      });
      await deleteSectors();
      expect(mockFetch).toHaveBeenLastCalledWith(
        `https://api.webflow.com/v2/collections/${sectorCollectionId}/items/${utilitiesSector.id}`,
        {
          method: "DELETE",
          headers: { Authorization: "Bearer 12345678910" },
        },
      );
    });

    it("reorders sectors", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          const sectors = [
            ...webflowSectors,
            { name: "Zzzzzzz", slug: "zzzzzz", id: randomInt(10) },
          ];
          return createMockFetchResponse({
            items: formatResponseItems(sectors),
            pagination: { total: 1 },
          });
        }
        return createMockFetchResponse({});
      });
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: [...arrayOfSectors, { name: "Zzzzzzz", id: "zzzzzz" }],
        });
      });

      const updatedSectors = await getSortedSectors();
      expect(updatedSectors.find((e) => e.fieldData.slug === "all-industries")).toMatchObject({
        fieldData: { slug: "all-industries" },
        rank: 1,
      });
      expect(updatedSectors.find((e) => e.fieldData.slug === "zzzzzz")).toMatchObject({
        fieldData: { slug: "zzzzzz" },
        rank: updatedSectors.length,
      });
    });
  });

  describe("fundings", () => {
    describe("markdown parser", () => {
      it("parses and splits the Eligibility and Benefits sections", async () => {
        expect(() => {
          return contentMdToObject("whatever");
        }).toThrow("Eligibility section missing");
        expect(() => {
          return contentMdToObject("## Eligibility\n");
        }).not.toThrow("Eligibility section missing");
        expect(() => {
          return contentMdToObject("## Eligibility\n");
        }).toThrow("Benefits section missing");
        expect(() => {
          return contentMdToObject("## Eligibility\n **Bill:**\n");
        }).toThrow("Benefits section missing");
        expect(() => {
          return contentMdToObject("## Eligibility\n ### Benefits\n");
        }).toThrow("Benefits section missing");
        expect(() => {
          return contentMdToObject('## Eligibility\n:::largeCallout{ headerText="Benefits" }\n');
        }).not.toThrow("Benefits section missing");

        const sampleMd =
          "Summary\n" +
          "\n" +
          "---\n" +
          "\n" +
          "### Eligibility\n" +
          "\n" +
          "eligibility stuff\n" +
          "- bullet\n" +
          "\n" +
          ':::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }\n' +
          ">\n" +
          "> benefit section\n" +
          ":::";

        expect(contentMdToObject(sampleMd)).toEqual({
          benefit: "<p> benefit section  </p>",
          eligibility: "<p>eligibility stuff</p> <ul> <li>bullet</li> </ul>",
          "program-overview": "<p>Summary</p>",
        });
      });

      it("parses contextual info text", async () => {
        const sampleMd =
          "`Qualified Incentive Track Summary|qit-njeda`\n" +
          "\n" +
          "---\n" +
          "\n" +
          "### Eligibility\n" +
          "\n" +
          "eligibility stuff\n" +
          "- bullet\n" +
          "\n" +
          ':::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }\n' +
          ">\n" +
          "> benefit section\n" +
          ":::";
        expect(contentMdToObject(sampleMd)["program-overview"]).toEqual(
          "<p>Qualified Incentive Track Summary</p>",
        );
      });

      it("removes filtered items", async () => {
        const sampleMd =
          "`Qualified Incentive Track Summary|qit-njeda`\n" +
          "\n" +
          "---\n" +
          "\n" +
          "### Eligibility\n" +
          "\n" +
          "eligibility stuff\n" +
          "- bullet\n" +
          "\n" +
          ':::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }\n' +
          ">\n" +
          "> benefit section\n" +
          ":::";
        expect(contentMdToObject(sampleMd)["program-overview"]).not.toContain("<hr>");
      });
    });

    it("throws an error if the sectors have not been synced", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          return createMockFetchResponse({ items: [], pagination: { total: 0 } });
        }
        if (url.includes(fundingCollectionId)) {
          const filteredFundings = fundings.filter((item) => {
            return item.slug !== "clean-tech-research-development-rd-voucher-program";
          });
          return createMockFetchResponse({
            items: formatResponseItems(filteredFundings),
            pagination: { total: 1 },
          });
        }
        return createMockFetchResponse({});
      });
      await expect(getNewFundings()).rejects.toThrow("Sectors must be synced first");
    });

    it("throws an error if the agency data is mismatched", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          return createMockFetchResponse({
            items: formatResponseItems(webflowSectors),
            pagination: { total: 1 },
          });
        }
        if (url.includes(fundingCollectionId)) {
          const filteredFundings = fundings.filter((item) => item.slug !== "nj-accelerate");
          return createMockFetchResponse({
            items: formatResponseItems(filteredFundings),
            pagination: { total: 1 },
          });
        }
        return createMockFetchResponse({});
      });
      loadAllFundings.mockReturnValue([
        {
          ...fundingMd.find((i) => {
            return i.id === "nj-accelerate";
          }),
          agency: ["lol"],
        },
      ]);

      await expect(getNewFundings()).rejects.toThrow(
        "Agency Types for agency lol are mis-matched in nj-accelerate. Please check with Webflow.",
      );
    });

    it("throws an error if the fundingType data is mismatched", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          return createMockFetchResponse({
            items: formatResponseItems(webflowSectors),
            pagination: { total: 1 },
          });
        }
        if (url.includes(fundingCollectionId)) {
          const filteredFundings = fundings.filter((item) => item.slug !== "nj-accelerate");
          return createMockFetchResponse({
            items: formatResponseItems(filteredFundings),
            pagination: { total: 1 },
          });
        }
        return createMockFetchResponse({});
      });
      loadAllFundings.mockReturnValue([
        {
          ...fundingMd.find((i) => {
            return i.id === "nj-accelerate";
          }),
          fundingType: "lol",
        },
      ]);

      await expect(getNewFundings()).rejects.toThrow(
        "Funding Types for funding type lol are mis-matched in nj-accelerate. Please check with Webflow.",
      );
    });

    it("gets fundings to create", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          return createMockFetchResponse({
            items: formatResponseItems(webflowSectors),
            pagination: { total: 1 },
          });
        }
        if (url.includes(fundingCollectionId)) {
          const filteredFundings = fundings.filter(
            (item) => item.fieldData.slug !== "nj-accelerate",
          );
          return createMockFetchResponse({
            items: filteredFundings,
            pagination: { total: 1 },
          });
        }
        return createMockFetchResponse({});
      });
      const newFundings = await getNewFundings();
      const { fieldData } = fundings.find((item) => item.fieldData.slug === "nj-accelerate");
      delete fieldData["feature-on-recents"];
      expect(newFundings).toMatchObject([fieldData]);
    });

    it("creates fundings", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          return createMockFetchResponse({ items: webflowSectors, pagination: { total: 1 } });
        }
        if (url.includes(fundingCollectionId)) {
          const filteredFundings = fundings.filter(
            (item) => item.fieldData.slug !== "nj-accelerate",
          );
          return createMockFetchResponse({
            items: filteredFundings,
            pagination: { total: 1 },
          });
        }
        return createMockFetchResponse({});
      });

      const { id, fieldData, ...rest } = fundings.find((item) => {
        return item.fieldData.slug === "nj-accelerate";
      });
      delete fieldData["feature-on-recents"];
      await createNewFundings();
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      expect(lastCall[0]).toBe(
        `https://api.webflow.com/v2/collections/${fundingCollectionId}/items`,
      );
      expect(lastCall[1].method).toBe("POST");
      expect(lastCall[1].headers).toEqual({
        Authorization: "Bearer 12345678910",
        "content-type": "application/json",
      });
      const bodyData = JSON.parse(lastCall[1].body);
      expect(bodyData).toMatchObject({
        isArchived: false,
        isDraft: false,
        fieldData: expect.objectContaining({
          "last-updated": currentDate.toISOString(),
          "application-close-date": null,
          "start-date": null,
          ...fieldData,
        }),
      });
    });

    it("gets fundings to delete", async () => {
      const filteredFundingMd = fundingMd.filter((i) => i.id !== "nj-accelerate");
      loadAllFundings.mockReturnValue(filteredFundingMd);
      const unUsedFundings = await getUnUsedFundings();
      expect(unUsedFundings).toMatchObject([{ fieldData: { slug: "nj-accelerate" } }]);
    });

    it("filters fundings that are past the due date", async () => {
      loadAllFundings.mockReturnValue([
        ...fundingMd.filter((i) => i.id !== "nj-accelerate"),
        {
          ...fundingMd.find((i) => i.id === "nj-accelerate"),
          dueDate: adjustDateByDay(-5),
        },
      ]);
      const unUsedFundings = await getUnUsedFundings();
      expect(unUsedFundings).toMatchObject([{ fieldData: { slug: "nj-accelerate" } }]);
    });

    it("filters fundings that which publishStageArchive is set to 'Do Not Publish'", async () => {
      loadAllFundings.mockReturnValue([
        ...fundingMd.filter((i) => i.id !== "nj-accelerate"),
        {
          ...fundingMd.find((i) => i.id === "nj-accelerate"),
          publishStageArchive: "Do Not Publish",
        },
      ]);
      const unUsedFundings = await getUnUsedFundings();
      expect(unUsedFundings).toMatchObject([{ fieldData: { slug: "nj-accelerate" } }]);
    });

    it("deletes fundings", async () => {
      loadAllFundings.mockReturnValue(fundingMd.filter((i) => i.id !== "nj-accelerate"));
      await deleteFundings();

      const matchingFunding = fundings.find((i) => i.fieldData.slug === "nj-accelerate");

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.webflow.com/v2/collections/${fundingCollectionId}/items/${matchingFunding.id}`,
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer 12345678910",
          }),
        }),
      );
    });

    it("updates fundings", async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes(sectorCollectionId)) {
          return createMockFetchResponse({
            items: formatResponseItems(webflowSectors),
            pagination: { total: 1 },
          });
        }
        if (url.includes(fundingCollectionId)) {
          const filteredFunding = fundings.find((item) => item.fieldData.slug === "nj-accelerate");
          filteredFunding.fieldData.agency = "njdol";

          return createMockFetchResponse({
            items: [filteredFunding],
            pagination: { total: 1 },
          });
        }
        return createMockFetchResponse({});
      });
      loadAllFundings.mockReturnValue([
        {
          ...fundingMd.find((i) => i.id === "nj-accelerate"),
          agency: ["njdep"],
        },
      ]);
      await updateFundings();

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.webflow.com/v2/collections/${fundingCollectionId}/items/${
          fundings.find((i) => i.fieldData.slug === "nj-accelerate").id
        }`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: "Bearer 12345678910",
          }),
          body: expect.stringContaining("nj-accelerate"),
        }),
      );
    });

    describe("helpers", () => {
      describe("catchRateLimitErrorAndRetry", () => {
        let mockRetryFunc;

        beforeEach(() => {
          mockRetryFunc = jest.fn();
          jest.useRealTimers();
        });

        it("should retry function after waiting if rate limit error occurs", async () => {
          jest.useFakeTimers();

          const setTimeoutSpy = jest.spyOn(globalThis, "setTimeout");
          const error = { response: { status: 429 } };

          catchRateLimitErrorAndRetry(error, mockRetryFunc, "arg1", "arg2");
          await jest.advanceTimersByTimeAsync(65000);

          expect(setTimeoutSpy).toHaveBeenCalled();
          const lastCall = setTimeoutSpy.mock.calls.at(-1);
          expect(lastCall[1]).toBe(65000);

          expect(mockRetryFunc).toHaveBeenCalledWith("arg1", "arg2");

          setTimeoutSpy.mockRestore();
        });

        it("should throw error if non-rate limit error occurs", async () => {
          const error = { response: { status: 500 } };

          await expect(
            catchRateLimitErrorAndRetry(error, mockRetryFunc, "arg1", "arg2"),
          ).rejects.toEqual(error);
          expect(mockRetryFunc).not.toHaveBeenCalled();
        });
      });
    });
  });
});
