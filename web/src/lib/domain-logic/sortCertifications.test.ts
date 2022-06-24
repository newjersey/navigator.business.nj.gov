import { sortCertifications } from "@/lib/domain-logic/sortCertifications";
import { generateCertification } from "@/test/factories";

describe("sortCertifications", () => {
  it("sorts certifications alphabetically case-insensitive", () => {
    const cert1 = generateCertification({ name: "bca" });
    const cert2 = generateCertification({ name: "Abc" });
    const cert3 = generateCertification({ name: "cba" });
    const cert4 = generateCertification({ name: "acb" });
    const certs = [cert1, cert2, cert3, cert4];

    const result = sortCertifications(certs);
    expect(result.length).toEqual(4);
    expect(result).toEqual([cert2, cert4, cert1, cert3]);
  });

  it("does not change the sorting if the names are the same", () => {
    const cert1 = generateCertification({ name: "bca", isSbe: true });
    const cert2 = generateCertification({ name: "bca", isSbe: false });
    const certs = [cert1, cert2];

    const result = sortCertifications(certs);
    expect(result.length).toEqual(2);
    expect(result).toEqual([cert1, cert2]);
  });
});
