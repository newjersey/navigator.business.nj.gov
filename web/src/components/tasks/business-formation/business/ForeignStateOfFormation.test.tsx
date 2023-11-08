import {renderFormationComponent} from "@/test/helpers/helpers-formation";
import {getMergedConfig} from "@/contexts/configContext";
import { screen } from "@testing-library/react";
import {ForeignStateOfFormation} from "@/components/tasks/business-formation/business/ForeignStateOfFormation";

const Config = getMergedConfig()

describe('<ForeignStateOfFormation />', () => {
  describe('validation', () => {
    it('displays error if invalid on mount', () => {
      renderFormationComponent({
        component: <ForeignStateOfFormation />,
        formationFormData: {foreignStateOfFormation: undefined}
      })
      expect(screen.getByText(Config.formation.fields.foreignStateOfFormation.error)).toBeInTheDocument()
    })

    it('does not display error if valid on mount', () => {
      renderFormationComponent({
        component: <ForeignStateOfFormation />,
        formationFormData: {foreignStateOfFormation: "Alaska"}
      })
      expect(screen.queryByText(Config.formation.fields.foreignStateOfFormation.error)).not.toBeInTheDocument()
    })

    it('does not display error if valid on change', () => {
      const page = renderFormationComponent({
        component: <ForeignStateOfFormation />,
        formationFormData: {foreignStateOfFormation: undefined}
      })

      expect(screen.getByText(Config.formation.fields.foreignStateOfFormation.error)).toBeInTheDocument()
      page.fillText("Foreign state of formation", "Alaska");
      expect(screen.queryByText(Config.formation.fields.foreignStateOfFormation.error)).not.toBeInTheDocument()
    })
  })
});