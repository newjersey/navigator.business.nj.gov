import {
  generateV126Business,
  generateV126ProfileData,
  generateV126UserData,
} from "@db/migrations/v126_remove_foreign_business_type";
import { migrate_v126_to_v127 } from "@db/migrations/v127_create_remote_worker_seller_phase";

describe("migrate_v126_to_v127", () => {
  it("sets operatingPhase for Remote Sellers to 'REMOTE_SELLER_WORKER'", () => {
    const id = "biz-1";
    const v126ProfileData = generateV126ProfileData({});
    const v126Business = generateV126Business({
      id,
      profileData: {
        ...v126ProfileData,
        operatingPhase: "NEEDS_TO_FORM",
        foreignBusinessTypeIds: ["revenueInNJ"],
      },
    });
    const v126UserData = generateV126UserData({ businesses: { "biz-1": v126Business } });

    const v127 = migrate_v126_to_v127(v126UserData);
    expect(v127.businesses[id].profileData.operatingPhase).toEqual("REMOTE_SELLER_WORKER");
  });

  it("sets operatingPhase for Remote Workers to 'REMOTE_SELLER_WORKER'", () => {
    const id = "biz-1";
    const v126ProfileData = generateV126ProfileData({});
    const v126Business = generateV126Business({
      id,
      profileData: {
        ...v126ProfileData,
        operatingPhase: "NEEDS_TO_FORM",
        foreignBusinessTypeIds: ["employeesInNJ"],
      },
    });
    const v126UserData = generateV126UserData({ businesses: { "biz-1": v126Business } });

    const v127 = migrate_v126_to_v127(v126UserData);
    expect(v127.businesses[id].profileData.operatingPhase).toEqual("REMOTE_SELLER_WORKER");
  });

  const foreignBusinessTypeIds = [
    "none",
    "employeeOrContractorInNJ",
    "officeInNJ",
    "propertyInNJ",
    "companyOperatedVehiclesInNJ",
  ];

  it.each(foreignBusinessTypeIds)(
    "does not modify operatingPhase for other Foreign businesses",
    (foreignBusinessTypeId) => {
      const id = "biz-1";
      const v126ProfileData = generateV126ProfileData({});
      const v126Business = generateV126Business({
        id,
        profileData: {
          ...v126ProfileData,
          operatingPhase: "NEEDS_TO_FORM",
          foreignBusinessTypeIds: [foreignBusinessTypeId],
        },
      });
      const v126UserData = generateV126UserData({ businesses: { "biz-1": v126Business } });

      const v127 = migrate_v126_to_v127(v126UserData);
      expect(v127.businesses[id].profileData.operatingPhase).toEqual("NEEDS_TO_FORM");
    }
  );

  it("does not modify operatingPhase for business without foreignBusinessTypeIds", () => {
    const id = "biz-1";

    const v126ProfileData = generateV126ProfileData({});
    const v126Business = generateV126Business({
      id,
      profileData: {
        ...v126ProfileData,
        operatingPhase: "NEEDS_TO_FORM",
        foreignBusinessTypeIds: [],
      },
    });
    const v126UserData = generateV126UserData({ businesses: { "biz-1": v126Business } });

    const v127 = migrate_v126_to_v127(v126UserData);
    expect(v127.businesses[id].profileData.operatingPhase).toEqual("NEEDS_TO_FORM");
  });
});
