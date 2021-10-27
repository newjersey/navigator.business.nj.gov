export interface Industry {
  id: string;
  name: string;
  description: string;
  canBeHomeBased: boolean;
  isLiquorLicenseApplicable: boolean;
  licenseType?: string;
  isMobileLocation: boolean;
}

export const LookupIndustryById = (id: string | undefined): Industry => {
  return (
    Industries.find((x) => x.id === id) ?? {
      id: "",
      name: "",
      description: "",
      canBeHomeBased: false,
      isLiquorLicenseApplicable: false,
      isMobileLocation: false,
    }
  );
};

export const Industries: Industry[] = [
  {
    id: "generic",
    name: "Any Other Business Type",
    description: "Select this if you don’t see your specific industry",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    isMobileLocation: false,
  },
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Providing food to patrons",
    canBeHomeBased: false,
    isLiquorLicenseApplicable: true,
    isMobileLocation: false,
  },
  {
    id: "e-commerce",
    name: "E-Commerce",
    description: "Selling or reselling goods or services on the internet",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    isMobileLocation: false,
  },
  {
    id: "home-contractor",
    name: "Home Improvement Contractor",
    description: "Repairing or renovating residential or non-commercial properties",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    licenseType: "Home Improvement Contractors",
    isMobileLocation: false,
  },
  {
    id: "cosmetology",
    name: "Cosmetology",
    description: "Offering hair, nail, or skin related services",
    canBeHomeBased: false,
    isLiquorLicenseApplicable: false,
    licenseType: "Cosmetology and Hairstyling",
    isMobileLocation: false,
  },
  {
    id: "cleaning-aid",
    name: "Cleaning Aid",
    description: "Offering cleaning services",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    isMobileLocation: false,
  },
  {
    id: "retail",
    name: "Retail",
    description: "Selling or reselling goods",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    isMobileLocation: false,
  },
  {
    id: "food-truck",
    name: "Food Truck",
    description:
      "A vehicle where food or beverages are transported, stored, or prepared for sale at temporary locations",
    canBeHomeBased: false,
    isLiquorLicenseApplicable: false,
    isMobileLocation: true,
  },
  {
    id: "employment-agency",
    name: "Employment Agency",
    description: "A business that finds employment for a job seeker and employees for employers",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    isMobileLocation: false,
  },
  {
    id: "homemaker-home-health-aide",
    name: "Home Health Aide",
    description: "A business staffing licensed personnel to provide home health care services",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    isMobileLocation: false,
  },
  {
    id: "janitorial-services",
    name: "Janitorial Services",
    description: "Commercial or residential property cleaning, maintenance, and management services",
    canBeHomeBased: true,
    isLiquorLicenseApplicable: false,
    isMobileLocation: false,
  },
];
