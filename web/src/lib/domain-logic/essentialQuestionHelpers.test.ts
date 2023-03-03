import {
  getEssentialQuestion,
  getIsApplicableToFunctionByFieldName,
} from "@/lib/domain-logic/essentialQuestions";

jest.mock("../../../../shared/lib/content/lib/industry.json", () => ({
  ...jest.requireActual("../../../../shared/lib/content/lib/industry.json"),
  industries: [
    ...jest.requireActual("../../../../shared/lib/content/lib/industry.json").industries,

    {
      naicsCodes: "000000",
      defaultSectorId: "other-services",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      name: "",
      industryOnboardingQuestions: {
        isPetCareHousingApplicable: true,
        willSellPetCareItems: true,
        isCpaRequiredApplicable: true,
      },
      isEnabled: true,
      additionalSearchTerms: "",
      id: "multipleEqId",
      description: "",
    },
  ],
}));

describe("hasEssentialQuestion", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getEssentialQuestion", () => {
    it("returns multiple essential questions when industry with multiple essential is selected", () => {
      const fieldNames = getEssentialQuestion("multipleEqId").map((eQ) => eQ.fieldName);
      expect(fieldNames).toHaveLength(3);
      expect(fieldNames).toContain("petCareHousing");
      expect(fieldNames).toContain("willSellPetCareItems");
      expect(fieldNames).toContain("requiresCpa");
    });
  });

  describe("hasEssentialQuestion", () => {
    describe("isCarServiceApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("carService")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a car service option", () => {
        expect(getIsApplicableToFunctionByFieldName("carService")("transportation")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("carService")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a car service option", () => {
        expect(getIsApplicableToFunctionByFieldName("carService")("car-service")).toEqual(true);
      });
    });

    describe("isCannabisLicenseApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("cannabisLicenseType")(undefined)).toEqual(false);
      });

      it("returns false when industry is not cannabis", () => {
        expect(getIsApplicableToFunctionByFieldName("cannabisLicenseType")("transportation")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("cannabisLicenseType")("fake-industry")).toEqual(false);
      });

      it("returns true when industry is cannabis", () => {
        expect(getIsApplicableToFunctionByFieldName("cannabisLicenseType")("cannabis")).toEqual(true);
      });
    });

    describe("isCertifiedInteriorDesignerApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a certified interior designer option", () => {
        expect(getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")("auto-body-repair")).toEqual(
          false
        );
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")("fake-industry")).toEqual(
          false
        );
      });

      it("returns true when industry has a certified interior designer option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")("interior-designer")
        ).toEqual(true);
      });
    });

    describe("isRealEstateAppraisalManagementApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")(undefined)).toEqual(
          false
        );
      });

      it("returns false when industry does not have a real estate appraisal option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")("auto-body-repair")
        ).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(
          getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")("fake-industry")
        ).toEqual(false);
      });

      it("returns true when industry has a real estate appraisal option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")("real-estate-appraisals")
        ).toEqual(true);
      });
    });

    describe("isProvidesStaffingServicesApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("providesStaffingService")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a certified interior designer option", () => {
        expect(getIsApplicableToFunctionByFieldName("providesStaffingService")("auto-body-repair")).toEqual(
          false
        );
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("providesStaffingService")("fake-industry")).toEqual(
          false
        );
      });

      it("returns true when industry has a certified interior designer option", () => {
        expect(getIsApplicableToFunctionByFieldName("providesStaffingService")("it-consultant")).toEqual(
          true
        );
      });
    });

    describe("isLiquorLicenseApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a liquor license option", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")("auto-body-repair")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a liquor license option", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")("restaurant")).toEqual(true);
      });
    });

    describe("isInterstateMovingApplicable", () => {
      it("returns false when there is no industry", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")(undefined)).toEqual(false);
      });

      it("returns false when industry does not fall under moving company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")("acupuncture")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")("fake-industry")).toEqual(false);
      });

      it("returns false when industry is a logistics company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")("logistics")).toEqual(false);
      });

      it("returns true when industry is a moving company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")("moving-company")).toEqual(true);
      });
    });

    describe("isInterstateLogisticsApplicable", () => {
      it("returns false when there is no industry", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")(undefined)).toEqual(false);
      });

      it("returns false when industry does not fall under moving company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")("acupuncture")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")("fake-industry")).toEqual(false);
      });

      it("returns false when industry is a moving company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")("moving-company")).toEqual(false);
      });

      it("returns true when industry is a logistics company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")("logistics")).toEqual(true);
      });
    });

    describe("isCpaRequiredApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a CPA option", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")("auto-body-repair")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a CPA option", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")("certified-public-accountant")).toEqual(
          true
        );
      });
    });

    describe("willSellPetCareItems", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("willSellPetCareItems")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a willSellPetCareItems option", () => {
        expect(getIsApplicableToFunctionByFieldName("willSellPetCareItems")("auto-body-repair")).toEqual(
          false
        );
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("willSellPetCareItems")("fake-industry")).toEqual(false);
      });

      it("returns true when industry is the pet care industry", () => {
        expect(getIsApplicableToFunctionByFieldName("willSellPetCareItems")("petcare")).toEqual(true);
      });
    });

    describe("isChildcareForSixOrMoreApplicable", () => {
      it("returns false when there is no industry", () => {
        expect(getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")(undefined)).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")("fake-industry")).toEqual(
          false
        );
      });

      it("returns false when industry is an architecture firm", () => {
        expect(getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")("architecture")).toEqual(
          false
        );
      });

      it("returns true when industry provides childcare for six or more children", () => {
        expect(getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")("daycare")).toEqual(true);
      });

      it("returns false when industry does not fall under childcare for six or more children", () => {
        expect(getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")("acupuncture")).toEqual(false);
      });

      it("returns false when industry provides childcare for five or less children", () => {
        expect(getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")("family-daycare")).toEqual(
          false
        );
      });
    });

    describe("isPetCareApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a petCareHousing option", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")("auto-body-repair")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a pet care option", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")("petcare")).toEqual(true);
      });
    });
  });
});
