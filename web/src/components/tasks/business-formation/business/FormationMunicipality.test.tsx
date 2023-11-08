import {renderFormationComponent} from "@/test/helpers/helpers-formation";
import {screen} from "@testing-library/react";
import { generateMunicipality} from "@businessnjgovnavigator/shared/test";
import {getMergedConfig} from "@/contexts/configContext";
import {FormationMunicipality} from "@/components/tasks/business-formation/business/FormationMunicipality";

const Config = getMergedConfig()

describe('<FormationMunicipality />', () => {
  describe('validation', () => {
    it("has partial address error when it is missing and addressZipCode exists", () => {
      renderFormationComponent({
        component: <FormationMunicipality />,
        formationFormData: {
          addressMunicipality: undefined,
          addressZipCode: "08100",
        },
      })

      expect(screen.getByText(Config.formation.general.partialAddressErrorText)).toBeInTheDocument()
    });

    it("has partial address error when it is missing and addressLine1 exist", () => {
      renderFormationComponent({
        component: <FormationMunicipality />,
        formationFormData: {
          addressLine1: "some-stuff",
          addressMunicipality: undefined,
        },
      })

      expect(screen.getByText(Config.formation.general.partialAddressErrorText)).toBeInTheDocument()
    });

    it("has partial address error when it is missing and addressLine1 and addressZipCode both exist", () => {
      renderFormationComponent({
        component: <FormationMunicipality />,
        formationFormData: {
          addressLine1: "some-stuff",
          addressMunicipality: undefined,
          addressZipCode: "08100",
        },
      })
      expect(screen.getByText(Config.formation.general.partialAddressErrorText)).toBeInTheDocument()
    });

    it("has no error when it is missing and addressMunicipality and addressZipCode are also missing", () => {
      renderFormationComponent({
        component: <FormationMunicipality />,
        formationFormData: {
          addressLine1: "",
          addressMunicipality: undefined,
          addressZipCode: "",
        },
      })
      expect(screen.queryByText(Config.formation.general.partialAddressErrorText)).not.toBeInTheDocument()
    });

    it("runs validation on change", () => {
      const page = renderFormationComponent({
        component: <FormationMunicipality />,
        formationFormData: {
          addressLine1: "some-stuff",
          addressMunicipality: undefined,
          addressZipCode: "",
        },
        municipalities: [generateMunicipality({ displayName: "Newark" })]
      })
      expect(screen.getByText(Config.formation.general.partialAddressErrorText)).toBeInTheDocument()
      page.selectByText("Address municipality", "Newark");
      expect(screen.queryByText(Config.formation.general.partialAddressErrorText)).not.toBeInTheDocument()
    });
  })
})