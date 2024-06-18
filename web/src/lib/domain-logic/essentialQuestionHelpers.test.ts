import {
  getEssentialQuestion,
  getIsApplicableToFunctionByFieldName,
} from "@/lib/domain-logic/essentialQuestions";

jest.mock("../../../../shared/lib/content/lib/industry.json", () => ({
  industries: [
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
    {
      naicsCodes: "000000",
      defaultSectorId: "other-services",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      name: "",
      industryOnboardingQuestions: {
        isCarServiceApplicable: true,
        isCannabisLicenseTypeApplicable: true,
        isCertifiedInteriorDesignerApplicable: true,
        isRealEstateAppraisalManagementApplicable: true,
        isProvidesStaffingServicesApplicable: true,
        isLiquorLicenseApplicable: true,
        isInterstateMovingApplicable: true,
        isInterstateLogisticsApplicable: true,
        isCpaRequiredApplicable: true,
        willSellPetCareItems: true,
        isChildcareForSixOrMore: true,
        isPetCareHousingApplicable: true,
        isEmploymentAndPersonnelTypeApplicable: true,
      },
      isEnabled: true,
      additionalSearchTerms: "",
      id: "fake-industry-with-eq",
      description: "",
    },
    {
      naicsCodes: "000000",
      defaultSectorId: "other-services",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      name: "",
      industryOnboardingQuestions: {},
      isEnabled: true,
      additionalSearchTerms: "",
      id: "fake-industry-with-no-eq",
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
        expect(getIsApplicableToFunctionByFieldName("carService")("fake-industry-with-no-eq")).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("carService")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a car service option", () => {
        expect(getIsApplicableToFunctionByFieldName("carService")("fake-industry-with-eq")).toEqual(true);
      });
    });

    describe("isCannabisLicenseApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("cannabisLicenseType")(undefined)).toEqual(false);
      });

      it("returns false when industry is not cannabis", () => {
        expect(
          getIsApplicableToFunctionByFieldName("cannabisLicenseType")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("cannabisLicenseType")("fake-industry")).toEqual(false);
      });

      it("returns true when industry is cannabis", () => {
        expect(getIsApplicableToFunctionByFieldName("cannabisLicenseType")("fake-industry-with-eq")).toEqual(
          true
        );
      });
    });

    describe("isCertifiedInteriorDesignerApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a certified interior designer option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")("fake-industry")).toEqual(
          false
        );
      });

      it("returns true when industry has a certified interior designer option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("certifiedInteriorDesigner")("fake-industry-with-eq")
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
          getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(
          getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")("fake-industry")
        ).toEqual(false);
      });

      it("returns true when industry has a real estate appraisal option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")("fake-industry-with-eq")
        ).toEqual(true);
      });
    });

    describe("isProvidesStaffingServicesApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("providesStaffingService")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a staffing service option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("providesStaffingService")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("providesStaffingService")("fake-industry")).toEqual(
          false
        );
      });

      it("returns true when industry has a staffing service option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("providesStaffingService")("fake-industry-with-eq")
        ).toEqual(true);
      });
    });

    describe("isLiquorLicenseApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a liquor license option", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")("fake-industry-with-no-eq")).toEqual(
          false
        );
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a liquor license option", () => {
        expect(getIsApplicableToFunctionByFieldName("liquorLicense")("fake-industry-with-eq")).toEqual(true);
      });
    });

    describe("isInterstateMovingApplicable", () => {
      it("returns false when there is no industry", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")(undefined)).toEqual(false);
      });

      it("returns false when industry does not fall under moving company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")("fake-industry-with-no-eq")).toEqual(
          false
        );
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")("fake-industry")).toEqual(false);
      });

      it("returns true when industry is a moving company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateMoving")("fake-industry-with-eq")).toEqual(
          true
        );
      });
    });

    describe("isInterstateLogisticsApplicable", () => {
      it("returns false when there is no industry", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")(undefined)).toEqual(false);
      });

      it("returns false when industry does not fall under logistics company", () => {
        expect(
          getIsApplicableToFunctionByFieldName("interstateLogistics")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")("fake-industry")).toEqual(false);
      });

      it("returns true when industry is a logistics company", () => {
        expect(getIsApplicableToFunctionByFieldName("interstateLogistics")("fake-industry-with-eq")).toEqual(
          true
        );
      });
    });

    describe("isCpaRequiredApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a CPA option", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")("fake-industry-with-no-eq")).toEqual(
          false
        );
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a CPA option", () => {
        expect(getIsApplicableToFunctionByFieldName("requiresCpa")("fake-industry-with-eq")).toEqual(true);
      });
    });

    describe("willSellPetCareItems", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("willSellPetCareItems")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a willSellPetCareItems option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("willSellPetCareItems")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("willSellPetCareItems")("fake-industry")).toEqual(false);
      });

      it("returns true when industry is the pet care industry", () => {
        expect(getIsApplicableToFunctionByFieldName("willSellPetCareItems")("fake-industry-with-eq")).toEqual(
          true
        );
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

      it("returns false when industry does not provide childcare for six or more", () => {
        expect(
          getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns true when industry provides childcare for six or more children", () => {
        expect(
          getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")("fake-industry-with-eq")
        ).toEqual(true);
      });
    });

    describe("isPetCareApplicable", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")(undefined)).toEqual(false);
      });

      it("returns false when industry does not have a petCareHousing option", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")("fake-industry-with-no-eq")).toEqual(
          false
        );
      });

      it("returns false when industry does not exist", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")("fake-industry")).toEqual(false);
      });

      it("returns true when industry has a pet care option", () => {
        expect(getIsApplicableToFunctionByFieldName("petCareHousing")("fake-industry-with-eq")).toEqual(true);
      });
    });

    describe("Employment Agency", () => {
      it("returns false when no industry is supplied", () => {
        expect(getIsApplicableToFunctionByFieldName("employmentPersonnelServiceType")(undefined)).toEqual(
          false
        );
        expect(getIsApplicableToFunctionByFieldName("employmentPlacementType")(undefined)).toEqual(false);
      });

      it("returns false when industry does not exist", () => {
        expect(
          getIsApplicableToFunctionByFieldName("employmentPersonnelServiceType")("fake-industry")
        ).toEqual(false);
        expect(getIsApplicableToFunctionByFieldName("employmentPlacementType")("fake-industry")).toEqual(
          false
        );
      });

      it("returns false when industry does not have an employment agency option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("employmentPersonnelServiceType")("fake-industry-with-no-eq")
        ).toEqual(false);
        expect(
          getIsApplicableToFunctionByFieldName("employmentPlacementType")("fake-industry-with-no-eq")
        ).toEqual(false);
      });

      it("returns true when industry has an employment agency option", () => {
        expect(
          getIsApplicableToFunctionByFieldName("employmentPersonnelServiceType")("fake-industry-with-eq")
        ).toEqual(true);
        expect(
          getIsApplicableToFunctionByFieldName("employmentPlacementType")("fake-industry-with-eq")
        ).toEqual(true);
      });
    });
  });
});
