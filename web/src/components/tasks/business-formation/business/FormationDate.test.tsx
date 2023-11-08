import {renderFormationComponent} from "@/test/helpers/helpers-formation";
import {FormationDate} from "@/components/tasks/business-formation/business/FormationDate";
import {getMergedConfig} from "@/contexts/configContext";
import { screen } from "@testing-library/react";
import dayjs from "dayjs";
import {getCurrentDate} from "@businessnjgovnavigator/shared/dateHelpers";
import {defaultDateFormat} from "@businessnjgovnavigator/shared/defaultConstants";
import {FormationLegalType} from "@businessnjgovnavigator/shared/formationData";

const Config = getMergedConfig()

describe('<FormationDate />', () => {
  const malformedDate = '2222-2222-2222'
  const today = dayjs().format(defaultDateFormat)
  const alwaysIncorrectDate = dayjs().subtract(1, "years")

  describe('validation', () => {
    describe('businessStartDate', () => {
      const fieldLabel = "Business start date";

      describe('shared mount behavior', () => {
        const legalType = 'limited-liability-company'
        it('displays error if invalid on mount for businessStartDate', () => {
          renderFormationComponent({
            component: <FormationDate fieldName="businessStartDate"/>,
            formationFormData: {businessStartDate: malformedDate, legalType}
          })
          expect(screen.getByText(Config.formation.fields.businessStartDate.errorFuture)).toBeInTheDocument()
        })

        it('does not display error if valid on mount for businessStartDate', () => {
          renderFormationComponent({
            component: <FormationDate fieldName="businessStartDate"/>,
            formationFormData: {businessStartDate: today, legalType}
          })
          expect(screen.queryByText(Config.formation.fields.businessStartDate.errorFuture)).not.toBeInTheDocument()
        })
      });

      describe("90 day limit", () => {
        const legalTypes: FormationLegalType[] = ["c-corporation", "s-corporation"];
        describe.each(legalTypes)(`%s`, (legalType) => {
          it("shows validation error past date limit", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().add(91, "day"), fieldLabel);
            expect(
              screen.getByText(Config.formation.fields.businessStartDate.error90Days)
            ).toBeInTheDocument();
          });

          it("shows validation error for previous date", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
            expect(
              screen.getByText(Config.formation.fields.businessStartDate.error90Days)
            ).toBeInTheDocument();
          });

          it("does not show validation error", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().add(89, "day"), fieldLabel);
            expect(
              screen.queryByText(Config.formation.fields.businessStartDate.error90Days)
            ).not.toBeInTheDocument();
          });
        })
      })

      describe("30 day limit", () => {
        const legalTypes: FormationLegalType[] = ["limited-partnership", "nonprofit", "foreign-nonprofit"];

        describe.each(legalTypes)('%s', (legalType) => {
          it("shows validation error past date limit", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().add(31, "day"), fieldLabel);
            expect(screen.getByText(Config.formation.fields.businessStartDate.error30Days)).toBeInTheDocument();
          });

          it("shows validation error for previous date", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
            expect(screen.getByText(Config.formation.fields.businessStartDate.error30Days)).toBeInTheDocument();
          });

          it("does not show validation error", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().add(29, "day"), fieldLabel);
            expect(
              screen.queryByText(Config.formation.fields.businessStartDate.error30Days)
            ).not.toBeInTheDocument();
          });
        });
      });

      describe("Any future date", () => {
        const legalTypes: FormationLegalType[] = ["limited-liability-company", "limited-liability-partnership", "foreign-limited-liability-partnership"];
        describe.each(legalTypes)(`%s`, (legalType) => {
          it("shows validation error", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
            expect(
              screen.getByText(Config.formation.fields.businessStartDate.errorFuture)
            ).toBeInTheDocument();
          });

          it("does not show validation error", async () => {
            const page = renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            page.selectDate(getCurrentDate().add(120, "day"), fieldLabel);
            expect(
              screen.queryByText(Config.formation.fields.businessStartDate.errorFuture)
            ).not.toBeInTheDocument();
          });
        })
      });

      describe("Current date only", () => {
        const legalTypes: FormationLegalType[] = ["foreign-limited-liability-company", "foreign-limited-partnership", "foreign-c-corporation", "foreign-s-corporation"];
        describe.each(legalTypes)(`%s`, (legalType) => {
          it("shows field as disabled", async () => {
            renderFormationComponent({
              component: <FormationDate fieldName="businessStartDate"/>,
              formationFormData: {legalType}
            })
            expect(screen.getByLabelText("Business start date")).toBeDisabled();
          });
        });
      });
    })

    describe('foreignDateOfFormation', () => {
      it('displays error if invalid on mount for foreignDateOfFormation', () => {
        renderFormationComponent({
          component: <FormationDate fieldName="foreignDateOfFormation"/>,
          formationFormData: {foreignDateOfFormation: malformedDate}
        })
        expect(screen.getByText(Config.formation.fields.foreignDateOfFormation.error)).toBeInTheDocument()
      })

      it('does not display error if valid on mount for foreignDateOfFormation', () => {
        renderFormationComponent({
          component: <FormationDate fieldName="foreignDateOfFormation"/>,
          formationFormData: {foreignDateOfFormation: today}
        })
        expect(screen.queryByText(Config.formation.fields.foreignDateOfFormation.error)).not.toBeInTheDocument()
      })

      it('displays error if invalid on change', () => {
        const page = renderFormationComponent({
          component: <FormationDate fieldName="foreignDateOfFormation"/>,
          formationFormData: {foreignDateOfFormation: today}
        })

        expect(screen.queryByText(Config.formation.fields.foreignDateOfFormation.error)).not.toBeInTheDocument()
        page.selectDate(alwaysIncorrectDate, "Foreign date of formation");
        expect(screen.getByText(Config.formation.fields.foreignDateOfFormation.error)).toBeInTheDocument()
      })
    })
  })
});