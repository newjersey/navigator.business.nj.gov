import {renderFormationComponent} from "@/test/helpers/helpers-formation";
import {getMergedConfig} from "@/contexts/configContext";
import { screen } from "@testing-library/react";
import {ForeignCertificate} from "@/components/tasks/business-formation/business/ForeignCertificate";

const Config = getMergedConfig()

describe('<ForeignCertificate />', () => {
  describe('validation', () => {
    it('displays error if invalid on mount', () => {
      renderFormationComponent({
        component: <ForeignCertificate />,
        formationFormData: {},
        initialForeignGoodStandingFile: undefined
      })
      expect(screen.getByText(Config.formation.fields.foreignGoodStandingFile.errorMessageRequired)).toBeInTheDocument()
    })
  })
});