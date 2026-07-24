import { formatTaxId } from "@/lib/domain-logic/formatTaxId";

export const typeTaxId = (selector: string, taxId: string): void => {
  const unformattedTaxId = taxId.replace(/\D/g, "");

  cy.get(selector).clear().should("have.value", "");
  [...unformattedTaxId].forEach((character, index) => {
    cy.get(selector)
      .type(character)
      .should("have.value", formatTaxId(unformattedTaxId.slice(0, index + 1)));
  });
};
