import {renderFormationComponent} from "@/test/helpers/helpers-formation";
import {screen} from "@testing-library/react";
import {getMergedConfig} from "@/contexts/configContext";
import {AddressLine1} from "@/components/tasks/business-formation/business/AddressLine1";
import {templateEval} from "@/lib/utils/helpers";
import {generateMunicipality} from "@businessnjgovnavigator/shared/test";

const Config = getMergedConfig()

describe('<AddressLine1 />', () => {
  const maxLengthErrorText = templateEval(Config.formation.general.maximumLengthErrorText, {
    field: Config.formation.fields.addressLine1.label,
    maxLen: "35",
  });

  describe('validation', () => {
    it("has error if length is greater than 35 chars", () => {
      const longFormEntry = Array(36).fill("A").join("");
      renderFormationComponent({
        component: <AddressLine1/>,
        formationFormData: { addressLine1: longFormEntry }
      })

      expect(screen.getByText(maxLengthErrorText)).toBeInTheDocument()
    });

    it("has no error if length is less than or equal to 35 chars", () => {
      const longFormEntry = Array(35).fill("A").join("");
      renderFormationComponent({
        component: <AddressLine1/>,
        formationFormData: { addressLine1: longFormEntry }
      })
      expect(screen.queryByText(maxLengthErrorText)).not.toBeInTheDocument()
    });

    describe('when foreign', () => {
      it("has error if missing", () => {
        renderFormationComponent({
          component: <AddressLine1/>,
          formationFormData: { addressLine1: "", businessLocationType: "US" }
        })

        expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument()
      });
    });

    describe('when not foreign', () => {
      it("does not have error if all parts of address missing", () => {
        renderFormationComponent({
          component: <AddressLine1/>,
          formationFormData: { addressLine1: "", addressZipCode: "", addressMunicipality: undefined, businessLocationType: 'NJ' }
        })

        expect(screen.queryByText(Config.formation.general.partialAddressErrorText)).not.toBeInTheDocument()
      });

      it("has partial address error when municipality defined and zip code missing", () => {
        renderFormationComponent({
          component: <AddressLine1/>,
          formationFormData: { addressLine1: "", addressZipCode: "", addressMunicipality: generateMunicipality({}), businessLocationType: 'NJ' }
        })
        expect(screen.getByText(Config.formation.general.partialAddressErrorText)).toBeInTheDocument()
      });

      it("has partial address error when zip code defined and municipality missing", () => {
        renderFormationComponent({
          component: <AddressLine1/>,
          formationFormData: { addressLine1: "", addressZipCode: "11111", addressMunicipality: undefined, businessLocationType: 'NJ' }
        })

        expect(screen.getByText(Config.formation.general.partialAddressErrorText)).toBeInTheDocument()
      });

      it("has partial address error when municipality and zip code defined", () => {
        renderFormationComponent({
          component: <AddressLine1/>,
          formationFormData: { addressLine1: "", addressZipCode: "11111", addressMunicipality: generateMunicipality({}), businessLocationType: 'NJ' }
        })
        expect(screen.getByText(Config.formation.general.partialAddressErrorText)).toBeInTheDocument()
      });
    });
  });
});