import {
  generatev166Business,
  generatev166UserData,
  v166Business,
  v166UserData,
} from "@db/migrations/v166_add_roadmap_task_data";

export interface v167Business extends Omit<v166Business, "formationData"> {
  formationData: v167FormationData;
}

export interface v167UserData extends Omit<v166UserData, "businesses"> {
  businesses: Record<string, v167Business>;
  version: 167;
}

export interface v167FormationData
  extends Omit<v166Business["formationData"], "formationFormData"> {
  formationFormData: v167FormationFormData;
}

export interface v167FormationFormData
  extends Omit<v166Business["formationData"]["formationFormData"], "agentNumberOrManual"> {
  readonly agentType: "MYSELF" | "AUTHORIZED_REP" | "PROFESSIONAL_SERVICE";
}

export const migrate_v166_to_v167 = (userData: v166UserData): v167UserData => {
  return {
    ...userData,
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v166Business) => migrate_v166Business_to_v167Business(business))
        .map((currBusiness: v167Business) => [currBusiness.id, currBusiness]),
    ),
    version: 167,
  };
};

const migrate_v166Business_to_v167Business = (business: v166Business): v167Business => {
  const agentNumberOrManual = business.formationData.formationFormData.agentNumberOrManual;

  return {
    ...business,
    formationData: {
      ...business.formationData,
      formationFormData: {
        ...business.formationData.formationFormData,
        agentType: agentNumberOrManual === "NUMBER" ? "PROFESSIONAL_SERVICE" : "MYSELF",
      },
    },
  };
};

// ---------------- v167 generators ----------------

export const generatev167UserData = (overrides: Partial<v167UserData>): v167UserData => {
  return {
    user: generatev166UserData({}).user,
    version: 167,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev167Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev167Business = (overrides: Partial<v167Business>): v167Business => {
  const v166BusinessData = generatev166Business(overrides as Partial<v166Business>);
  return {
    ...v166BusinessData,
    formationData: {
      ...v166BusinessData.formationData,
      formationFormData: {
        ...v166BusinessData.formationData.formationFormData,
        agentType: "MYSELF",
      },
    },
    version: 167,
  };
};
