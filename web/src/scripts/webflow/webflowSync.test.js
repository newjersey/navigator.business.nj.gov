/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayOfSectors, randomInt } from "@businessnjgovnavigator/shared";
import * as axios from "axios";
import fs from "fs";
import { loadAllFundings } from "../fundingExport.mjs";
import {
  agencyMap,
  contentMdToObject,
  createNewFundings,
  deleteFundings,
  getNewFundings,
  getUnUsedFundings,
  updateFundings,
} from "./fundingSync.mjs";
import {
  allIndustryId,
  createNewSectors,
  deleteSectors,
  getNewSectors,
  getSectors,
  getSortedSectors,
  getUnUsedSectors,
  getUpdatedSectorNames,
  updateSectorNames,
} from "./sectorSync.mjs";

const adjustDateByDay = (dayValue) => {
  const d = new Date();
  d.setDate(d.getDate() + dayValue);
  return d.toLocaleDateString("en-US");
};

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
      "> **Benefits**\n" +
      ">\n" +
      "> Vouchers totaling up to $15,000 per year\n",
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
      "> **Benefits**\n" +
      ">\n" +
      "> Award of up to $100,000 per piece of equipment purchased or replaced\n",
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
      "> **Benefits**\n" +
      ">\n" +
      "> - 1:1 matching event sponsorship up to $100,000 for accelerator programs\n" +
      "> - 1:1 matching loan funding up to $250,000 and rent support for up to 6 months for graduate companies\n",
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
    _archived: false,
    _draft: false,
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
    _cid: "6112e6b88aa567fdbc725ffc",
    _id: "62c5bc16a8f618275698c979",
  },
  {
    _archived: false,
    _draft: false,
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
      "<ul> <li>1:1 matching event sponsorship up to $100,000 for accelerator programs</li> <li>1:1 matching loan funding up to $250,000 and rent support for up to 6 months for graduate companies</li> </ul>",
    name: "NJ Accelerate",
    slug: "nj-accelerate",
    "industry-reference": ["61c48e1b3257cc374781ee12"],
    "funding-status": "d9e4ad4201a1644abbcad6666bace0bc",
    _id: "62c5bc1639c27700c64f4a70",
  },
  {
    _archived: false,
    _draft: false,
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
    _id: "62c5bc16d0a8cf081867afa2",
  },
];

const webflowSectors = [
  {
    name: "All Industries",
    slug: "all-industries",
    _id: allIndustryId,
  },
  ...arrayOfSectors.map((i) => {
    return { _id: randomInt(10), name: i.name, slug: i.id };
  }),
];

jest.mock("../fundingExport.mjs");
jest.mock("axios");
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

  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    global.Date.now = jest.fn(() => {
      return dateNow;
    });
    loadAllFundings.mockReturnValue(fundingMd);
    fs.readFileSync.mockImplementation((e) => {
      const original = jest.requireActual("fs");
      return e.includes("sectors.json") ? JSON.stringify({ arrayOfSectors }) : original.readFileSync(e);
    });
    axios.mockImplementation((request) => {
      if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
        return { data: { items: webflowSectors } };
      }
      if (request.url.includes("6112e6b88aa567fdbc725ffc") && request.method === "get") {
        return { data: { items: fundings } };
      } else {
        console.log(request);
      }
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
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return {
            data: {
              items: webflowSectors.filter((i) => {
                return i.slug !== "utilities";
              }),
            },
          };
        }
      });
      const newSectors = await getNewSectors();
      expect(newSectors).toEqual([{ name: "Utilities", slug: "utilities" }]);
    });

    it("creates sectors", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return {
            data: {
              items: webflowSectors.filter((i) => {
                return i.slug !== "utilities";
              }),
            },
          };
        }
      });

      await createNewSectors();

      expect(axios).toHaveBeenLastCalledWith({
        method: "post",
        url: `https://api.webflow.com/collections/61c21253f7640b5f5ce829a4/items`,
        data: {
          fields: {
            _archived: false,
            _draft: false,
            name: "Utilities",
            slug: "utilities",
          },
        },
        responseType: "json",
        headers: {
          Authorization: "Bearer 12345678910",
          "content-type": "application/json",
        },
      });
    });

    it("gets sectors to modify", async () => {
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: [
            ...arrayOfSectors.filter((i) => {
              return i.id !== "utilities";
            }),
            { name: "Electric, Gas, and Oil suppliers", id: "utilities" },
          ],
        });
      });
      const updatedSectors = await getUpdatedSectorNames();
      expect(updatedSectors).toMatchObject([{ name: "Electric, Gas, and Oil suppliers", slug: "utilities" }]);
    });

    it("modifies sectors", async () => {
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: [
            ...arrayOfSectors.filter((i) => {
              return i.id !== "utilities";
            }),
            { name: "Electric, Gas, and Oil suppliers", id: "utilities" },
          ],
        });
      });
      await updateSectorNames();
      expect(axios).toHaveBeenLastCalledWith({
        method: "patch",
        url: `https://api.webflow.com/collections/61c21253f7640b5f5ce829a4/items/${
          webflowSectors.find((item) => {
            return item.slug === "utilities";
          })._id
        }`,
        data: { fields: { name: "Electric, Gas, and Oil suppliers" } },
        responseType: "json",
        headers: { Authorization: "Bearer 12345678910" },
      });
    });

    it("gets sectors to delete", async () => {
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({
          arrayOfSectors: arrayOfSectors.filter((i) => {
            return i.id !== "utilities";
          }),
        });
      });
      const unUsedSectors = await getUnUsedSectors();
      const utilitiesSector = unUsedSectors.find((i) => {
        return i.slug === "utilities";
      });
      expect(utilitiesSector).toBeTruthy();
      expect(
        unUsedSectors.find((i) => {
          return i.slug === "all-industries";
        })
      ).toBeFalsy();
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
        return i.slug === "utilities";
      });
      await deleteSectors();
      expect(axios).toHaveBeenLastCalledWith({
        method: "delete",
        url: `https://api.webflow.com/collections/61c21253f7640b5f5ce829a4/items/${utilitiesSector._id}`,
        params: { live: false },
        headers: { Authorization: "Bearer 12345678910" },
      });
    });

    it("reorders sectors", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return {
            data: { items: [...webflowSectors, { name: "Zzzzzzz", slug: "zzzzzz", _id: randomInt(10) }] },
          };
        }
      });
      fs.readFileSync.mockImplementation(() => {
        return JSON.stringify({ arrayOfSectors: [...arrayOfSectors, { name: "Zzzzzzz", id: "zzzzzz" }] });
      });

      const updatedSectors = await getSortedSectors();
      expect(
        updatedSectors.find((e) => {
          return e.slug === "all-industries";
        })
      ).toMatchObject({
        slug: "all-industries",
        rank: 1,
      });
      expect(
        updatedSectors.find((e) => {
          return e.slug === "zzzzzz";
        })
      ).toMatchObject({
        slug: "zzzzzz",
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
        }).not.toThrow("Benefits section missing");
        expect(() => {
          return contentMdToObject("## Eligibility\n **Benefit**\n");
        }).not.toThrow("Benefits section missing");
        expect(() => {
          return contentMdToObject("## Eligibility\n **Benefits**\n");
        }).not.toThrow("Benefits section missing");
        expect(() => {
          return contentMdToObject("## Eligibility\n **Benefits:**\n");
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
          "> **Benefits**\n" +
          ">\n" +
          "> benefit section\n";

        expect(contentMdToObject(sampleMd)).toEqual({
          benefit: "<p>benefit section</p>",
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
          "> **Benefits**\n" +
          ">\n" +
          "> benefit section\n";
        expect(contentMdToObject(sampleMd)["program-overview"]).toEqual(
          "<p>Qualified Incentive Track Summary</p>"
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
          "> **Benefits**\n" +
          ">\n" +
          "> benefit section\n";
        expect(contentMdToObject(sampleMd)["program-overview"]).not.toContain("<hr>");
      });
    });

    it("throws an error if the sectors have not been synced", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return { data: { items: [] } };
        }
        if (request.url.includes("6112e6b88aa567fdbc725ffc") && request.method === "get") {
          return {
            data: {
              items: fundings.filter((item) => {
                return item.slug !== "clean-tech-research-development-rd-voucher-program";
              }),
            },
          };
        }
      });
      await expect(getNewFundings()).rejects.toThrow("Sectors must be synced first");
    });

    it("throws an error if the agency data is mismatched", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return { data: { items: [] } };
        }
        if (request.url.includes("6112e6b88aa567fdbc725ffc") && request.method === "get") {
          return {
            data: {
              items: fundings.filter((item) => {
                return item.slug !== "nj-accelerate";
              }),
            },
          };
        }
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
        "Agency Types are mis-matched, please check with webflow"
      );
    });

    it("throws an error if the fundingType data is mismatched", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return { data: { items: [] } };
        }
        if (request.url.includes("6112e6b88aa567fdbc725ffc") && request.method === "get") {
          return {
            data: {
              items: fundings.filter((item) => {
                return item.slug !== "nj-accelerate";
              }),
            },
          };
        }
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
        "Funding Types are mis-matched, please check with webflow"
      );
    });

    it("gets fundings to create", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return { data: { items: webflowSectors } };
        }
        if (request.url.includes("6112e6b88aa567fdbc725ffc") && request.method === "get") {
          return {
            data: {
              items: fundings.filter((item) => {
                return item.slug !== "nj-accelerate";
              }),
            },
          };
        }
      });
      const newFundings = await getNewFundings();
      const { _archived, _draft, _id, ...rest } = fundings.find((item) => {
        return item.slug === "nj-accelerate";
      });
      console.log(newFundings[0]);
      delete rest["feature-on-recents"];
      expect(newFundings).toMatchObject([rest]);
    });

    it("creates fundings", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return { data: { items: webflowSectors } };
        }
        if (request.url.includes("6112e6b88aa567fdbc725ffc") && request.method === "get") {
          return {
            data: {
              items: fundings.filter((item) => {
                return item.slug !== "nj-accelerate";
              }),
            },
          };
        }
      });

      const { _id, ...rest } = fundings.find((item) => {
        return item.slug === "nj-accelerate";
      });
      delete rest["feature-on-recents"];
      await createNewFundings();
      expect(axios).toHaveBeenLastCalledWith({
        method: "post",
        url: `https://api.webflow.com/collections/6112e6b88aa567fdbc725ffc/items`,
        data: {
          fields: {
            _archived: false,
            _draft: false,
            "application-close-date": null,
            "start-date": null,
            "last-updated": currentDate.toISOString(),
            ...rest,
          },
        },
        responseType: "json",
        headers: {
          Authorization: "Bearer 12345678910",
          "content-type": "application/json",
        },
      });
    });

    it("gets fundings to delete", async () => {
      loadAllFundings.mockReturnValue(
        fundingMd.filter((i) => {
          return i.id !== "nj-accelerate";
        })
      );
      const unUsedFundings = await getUnUsedFundings();
      expect(unUsedFundings).toMatchObject([{ slug: "nj-accelerate" }]);
    });

    it("filters fundings that are past the due date", async () => {
      loadAllFundings.mockReturnValue([
        ...fundingMd.filter((i) => {
          return i.id !== "nj-accelerate";
        }),
        {
          ...fundingMd.find((i) => {
            return i.id === "nj-accelerate";
          }),
          dueDate: adjustDateByDay(-5),
        },
      ]);
      const unUsedFundings = await getUnUsedFundings();
      expect(unUsedFundings).toMatchObject([{ slug: "nj-accelerate" }]);
    });

    it("filters fundings that which publishStageArchive is set to 'Do Not Publish'", async () => {
      loadAllFundings.mockReturnValue([
        ...fundingMd.filter((i) => {
          return i.id !== "nj-accelerate";
        }),
        {
          ...fundingMd.find((i) => {
            return i.id === "nj-accelerate";
          }),
          publishStageArchive: "Do Not Publish",
        },
      ]);
      const unUsedFundings = await getUnUsedFundings();
      expect(unUsedFundings).toMatchObject([{ slug: "nj-accelerate" }]);
    });

    it("deletes fundings", async () => {
      loadAllFundings.mockReturnValue(
        fundingMd.filter((i) => {
          return i.id !== "nj-accelerate";
        })
      );
      await deleteFundings();
      expect(axios).toHaveBeenLastCalledWith({
        method: "delete",
        url: `https://api.webflow.com/collections/6112e6b88aa567fdbc725ffc/items/${
          fundings.find((i) => {
            return i.slug === "nj-accelerate";
          })._id
        }`,
        params: {
          live: false,
        },
        headers: {
          Authorization: "Bearer 12345678910",
        },
      });
    });

    it("updates fundings", async () => {
      axios.mockImplementation((request) => {
        if (request.url.includes("61c21253f7640b5f5ce829a4") && request.method === "get") {
          return { data: { items: webflowSectors } };
        }
        if (request.url.includes("6112e6b88aa567fdbc725ffc") && request.method === "get") {
          return {
            data: {
              items: [
                {
                  ...fundings.find((item) => {
                    return item.slug === "nj-accelerate";
                  }),
                  agency: ["njdol"],
                },
              ],
            },
          };
        }
      });
      loadAllFundings.mockReturnValue([
        {
          ...fundingMd.find((i) => {
            return i.id === "nj-accelerate";
          }),
          agency: ["njdep"],
        },
      ]);
      await updateFundings();
      const { _archived, _draft, _id, ...rest } = fundings.find((item) => {
        return item.slug === "nj-accelerate";
      });
      delete rest["feature-on-recents"];
      console.log(rest);
      expect(axios).toHaveBeenLastCalledWith({
        method: "patch",
        url: `https://api.webflow.com/collections/6112e6b88aa567fdbc725ffc/items/${
          fundings.find((i) => {
            return i.slug === "nj-accelerate";
          })._id
        }`,
        data: {
          fields: {
            ...rest,
            "last-updated": currentDate.toISOString(),
            "application-close-date": null,
            "start-date": null,
            agency: agencyMap["njdep"].id,
          },
        },
        responseType: "json",
        headers: {
          Authorization: "Bearer 12345678910",
        },
      });
    });
  });
});
