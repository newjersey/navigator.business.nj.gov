import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import { generateBusiness, generateUserData } from "@businessnjgovnavigator/shared/test";

describe("orderBusinessIdsByDateCreated", () => {
  it("returns list of businesses in order oldest to newest", () => {
    const oldest = generateBusiness(generateUserData({}), { dateCreatedISO: "2022-04-19T12:00:00" });
    const middle = generateBusiness(generateUserData({}), { dateCreatedISO: "2022-05-19T12:00:00" });
    const newest = generateBusiness(generateUserData({}), { dateCreatedISO: "2022-06-19T12:00:00" });

    const userData = generateUserData({
      currentBusinessId: middle.id,
      businesses: {
        [middle.id]: middle,
        [oldest.id]: oldest,
        [newest.id]: newest,
      },
    });

    const result = orderBusinessIdsByDateCreated(userData);
    expect(result[0]).toEqual(oldest.id);
    expect(result[1]).toEqual(middle.id);
    expect(result[2]).toEqual(newest.id);
  });
});
