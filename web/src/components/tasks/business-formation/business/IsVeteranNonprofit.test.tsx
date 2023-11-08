import {renderFormationComponent} from "@/test/helpers/helpers-formation";
import {screen} from "@testing-library/react";
import { generateMunicipality} from "@businessnjgovnavigator/shared/test";
import {getMergedConfig} from "@/contexts/configContext";
import {FormationMunicipality} from "@/components/tasks/business-formation/business/FormationMunicipality";
import {IsVeteranNonprofit} from "@/components/tasks/business-formation/business/IsVeteranNonprofit";

const Config = getMergedConfig()

describe('<IsVeteranNonprofit />', () => {
  describe('validation', () => {
    it("displays error when invalid on mount", () => {
      renderFormationComponent({
        component: <IsVeteranNonprofit />,
        formationFormData: { isVeteranNonprofit: undefined },
      })

      expect(screen.getByText(Config.formation.fields.isVeteranNonprofit.error)).toBeInTheDocument()
    });

    it("does not display error when valid on mount", () => {
      renderFormationComponent({
        component: <IsVeteranNonprofit />,
        formationFormData: { isVeteranNonprofit: false },
      })

      expect(screen.queryByText(Config.formation.fields.isVeteranNonprofit.error)).not.toBeInTheDocument()
    });

    it("runs validation on change", () => {
      const page = renderFormationComponent({
        component: <IsVeteranNonprofit />,
        formationFormData: { isVeteranNonprofit: undefined },
      })
      expect(screen.getByText(Config.formation.fields.isVeteranNonprofit.error)).toBeInTheDocument()
      page.chooseRadio('isVeteranNonprofit-true')
      expect(screen.queryByText(Config.formation.fields.isVeteranNonprofit.error)).not.toBeInTheDocument()
    });
  })
})