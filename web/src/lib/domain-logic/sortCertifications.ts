import { Certification } from "@/lib/types/types";

// eslint-disable-next-line functional/prefer-readonly-type
export const sortCertifications = (certifications: Certification[]): readonly Certification[] => {
  return certifications.sort((a, b) => {
    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) return -1;
    else if (nameA > nameB) return 1;
    return 0;
  });
};
