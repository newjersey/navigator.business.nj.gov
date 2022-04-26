import { Funding, FundingStatusOrder } from "@/lib/types/types";

// eslint-disable-next-line functional/prefer-readonly-type
export const sortFundings = (fundings: Funding[]): readonly Funding[] => {
  return fundings.sort((a, b) => {
    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase();
    if (FundingStatusOrder[a.status] < FundingStatusOrder[b.status]) return -1;
    else if (FundingStatusOrder[a.status] > FundingStatusOrder[b.status]) return 1;
    else if (nameA < nameB) return -1;
    else if (nameA > nameB) return 1;
    return 0;
  });
};
