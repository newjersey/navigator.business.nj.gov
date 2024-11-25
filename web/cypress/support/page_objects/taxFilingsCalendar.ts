export class TaxFilingsCalendar {
  getTaxCalendar() {
    return cy.get('[data-testid="filings-calendar"]');
  }
}

export const onTaxFilingsCalendar = new TaxFilingsCalendar();
