import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  Business,
  generateBusiness,
  generateProfileData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { ReactNode } from "react";

const Config = getMergedConfig();

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const mockApi = api as jest.Mocked<typeof api>;

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock(
  "next/link",
  () =>
    ({ children }: { children: ReactNode }): ReactNode =>
      children
);

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const generateOnboardingBusiness = (): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: "",
      tradeName: "",
      industryId: undefined,
      legalStructureId: undefined,
    }),
  });
};

const generateGuestBusiness = (overrides?: Partial<Business>): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: "",
      tradeName: "",
      industryId: "cannabis",
      legalStructureId: "limited-liability-company",
    }),
    ...overrides,
  });
};

const businessName = "businessName";

const generateBusinessNamedBusiness = (overrides?: Partial<Business>): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: businessName,
      tradeName: "",
      industryId: "cannabis",
      legalStructureId: "limited-liability-company",
    }),
    ...overrides,
  });
};

describe("<NavBarDesktop />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  describe('landing configuration', () => {

  })

  describe('onboarding configuration', () => {

  })


  describe('authenticated configuration', () => {

  })

  describe('guest configuration', () => {

  })



});
