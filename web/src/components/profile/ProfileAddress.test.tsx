import { ProfileAddress } from "@/components/profile/ProfileAddress";
import { getMergedConfig } from "@/contexts/configContext";
import { generateAddress } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import {
  createEmptyFormationFormData,
  emptyAddressData,
  emptyFormationAddressData,
} from "@businessnjgovnavigator/shared/formationData";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateMunicipality,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

describe("<ProfileAddress  />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = ({ municipalities }: { municipalities?: Municipality[] }): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulAddressData
          initialData={emptyFormationAddressData}
          municipalities={municipalities || [generateMunicipality({})]}
        >
          <ProfileAddress />
        </WithStatefulAddressData>
      </ThemeProvider>
    );
  };

  describe("NJ business location", () => {
    it("renders profile address line 1 field with input value", () => {
      const address = generateAddress({
        addressLine1: "1111 Home Alone",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address }),
          }),
        })
      );
      renderComponent({});
      expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
    });

    it("renders profile address line 1 and reflects new value on change", () => {
      const address = generateAddress({
        addressLine1: "",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address }),
          }),
        })
      );
      renderComponent({});

      expect(screen.getByLabelText("Address line1")).toHaveValue("");
      fillText("Address line1", "1111 Home Alone");
      expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
    });

    it("displays an error on address line 1 when field is blurred while empty", () => {
      const address = generateAddress({
        addressLine1: "",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address }),
          }),
        })
      );
      renderComponent({});

      blurInput("Address line1");
      expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
    });

    it("renders profile address line 2 field with input value", () => {
      const address = generateAddress({
        addressLine2: "1111 Home Alone",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address }),
          }),
        })
      );
      renderComponent({});

      expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
    });

    it("renders profile address line 2 reflects changed value", () => {
      const address = generateAddress({
        addressLine2: "",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address }),
          }),
        })
      );
      renderComponent({});

      expect(screen.getByLabelText("Address line2")).toHaveValue("");
      fillText("Address line2", "1111 Home Alone");
      expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
    });

    it("renders profile address line errors when only line 2 has input", () => {
      const address = generateAddress({
        ...emptyAddressData,
        addressLine2: "123",
      });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
          }),
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: "NJ" }),
          }),
        })
      );
      renderComponent({});
      blurInput("Address line2");
      expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.addressMunicipality.error)).toBeInTheDocument();
      expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
    });

    it("renders profile address zip code field with input value", () => {
      const address = generateAddress({
        addressZipCode: "08437",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address }),
          }),
        })
      );
      renderComponent({});
      expect(screen.getByLabelText("Address zip code")).toHaveValue("08437");
    });

    it("renders profile address zip code reflects changed value", () => {
      const address = generateAddress({
        addressZipCode: "",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address }),
          }),
        })
      );
      renderComponent({});

      expect(screen.getByLabelText("Address zip code")).toHaveValue("");
      fillText("Address zip code", "08437");
      expect(screen.getByLabelText("Address zip code")).toHaveValue("08437");
    });

    it("updates profile address state field with new jersey value", () => {
      const address = generateAddress({
        addressState: undefined,
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({
              ...address,
              addressState: {
                name: "New Jersey",
                shortCode: "NJ",
              },
              businessLocationType: "NJ",
            }),
          }),
        })
      );
      renderComponent({});

      expect(screen.getByLabelText("Address state")).toHaveValue("NJ");
      expect(screen.getByLabelText("Address state")).toBeDisabled();
    });

    it("renders profile zip code error", () => {
      const address = generateAddress({
        addressZipCode: "",
      });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
          }),
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: "NJ" }),
          }),
        })
      );
      renderComponent({});
      blurInput("Address zip code");
      expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
    });

    it("renders disabled profile address state field", () => {
      const address = generateAddress({
        addressZipCode: "",
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: "NJ" }),
          }),
        })
      );
      renderComponent({});
      expect(screen.getByLabelText("Address state")).toBeDisabled();
    });

    it("renders profile address municipality field with input value", async () => {
      const municipality = generateMunicipality({ displayName: "Newark Display Name", name: "Newark" });
      const address = generateAddress({
        addressMunicipality: municipality,
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: "NJ" }),
          }),
        })
      );
      renderComponent({
        municipalities: [municipality],
      });
      expect(screen.getByLabelText("Address municipality")).toHaveValue("Newark Display Name");
    });

    it("renders profile address municipality field reflects changed value", async () => {
      const municipality = generateMunicipality({ displayName: "Newark Display Name", name: "Newark" });
      const address = generateAddress({
        addressMunicipality: undefined,
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: "NJ" }),
          }),
        })
      );
      renderComponent({
        municipalities: [municipality],
      });
      selectByText("Address municipality", "Newark Display Name");
      expect(screen.getByLabelText("Address municipality")).toHaveValue("Newark Display Name");
    });

    it("renders profile address municipality error", async () => {
      const municipality = generateMunicipality({ displayName: "Newark Display Name", name: "Newark" });
      const address = generateAddress({
        addressMunicipality: undefined,
      });
      useMockBusiness(
        generateBusiness({
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: "NJ" }),
          }),
        })
      );
      renderComponent({
        municipalities: [municipality],
      });
      blurInput("Address municipality");
      expect(screen.getByText(Config.formation.fields.addressMunicipality.error)).toBeInTheDocument();
    });

    it("renders profile locked fields when completed filing payment is true", async () => {
      const municipality = generateMunicipality({ displayName: "Allendale", name: "Allendale" });
      const address = generateAddress({
        addressLine1: "1111 Home Alone",
        addressLine2: "Suite 10",
        addressMunicipality: municipality,
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressZipCode: "00893",
      });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({ businessPersona: "STARTING" }),
          formationData: generateFormationData({
            completedFilingPayment: true,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: "NJ" }),
          }),
        })
      );
      renderComponent({
        municipalities: [municipality],
      });
      expect(screen.getByTestId("locked-profileAddressLine1")).toBeInTheDocument();
      expect(screen.getByTestId("locked-profileAddressLine2")).toBeInTheDocument();
      expect(screen.getByTestId("locked-profileAddressMuniStateZip")).toBeInTheDocument();
    });

    it("does not render profile locked fields when address fields are not entered and completed filing payment is true", async () => {
      const municipality = generateMunicipality({ displayName: "Allendale", name: "Allendale" });
      const address = generateAddress({
        addressLine1: "",
        addressLine2: "",
        addressMunicipality: undefined,
        addressCity: undefined,
        addressProvince: undefined,
        addressState: undefined,
        addressZipCode: "",
      });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({ businessPersona: "STARTING" }),
          formationData: generateFormationData({
            completedFilingPayment: true,
            formationFormData: generateFormationFormData({ ...address, businessLocationType: undefined }),
          }),
        })
      );
      renderComponent({
        municipalities: [municipality],
      });
      expect(screen.queryByTestId("locked-profileAddressLine1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressLine2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressMuniStateZip")).not.toBeInTheDocument();
    });
  });

  describe("non-NJ business location", () => {
    it("renders radio buttons for US and International address options", () => {
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
          }),
          formationData: generateFormationData({
            completedFilingPayment: false,
            formationFormData: generateFormationFormData({ businessLocationType: "US" }),
          }),
        })
      );
      renderComponent({});
      expect(screen.getByLabelText("U.S. address")).toBeInTheDocument();
      expect(screen.getByLabelText("International address")).toBeInTheDocument();
    });

    describe("US business", () => {
      it("displays profile address fields for a US business", () => {
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});
        expect(screen.getByLabelText("Address line1")).toBeInTheDocument();
        expect(screen.getByLabelText("Address line2")).toBeInTheDocument();
        expect(screen.getByLabelText("Address city")).toBeInTheDocument();
        expect(screen.getByLabelText("Address state")).toBeInTheDocument();
        expect(screen.getByLabelText("Address zip code")).toBeInTheDocument();
        expect(screen.queryByLabelText("Address province")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Address country")).not.toBeInTheDocument();
      });

      it("renders profile address line 1 field with input value", () => {
        const address = generateAddress({
          addressLine1: "1111 Home Alone",
        });

        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});
        expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line 1 with changed value", () => {
        const address = generateAddress({
          addressLine1: "",
        });

        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address line1")).toHaveValue("");
        fillText("Address line1", "1111 Home Alone");
        expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line 1 error", () => {
        const address = generateAddress({
          addressLine1: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        blurInput("Address line1");
        expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
      });

      it("renders profile address line 2 field with input value", () => {
        const address = generateAddress({
          addressLine2: "1111 Home Alone",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line 2 with changed value", () => {
        const address = generateAddress({
          addressLine2: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address line2")).toHaveValue("");
        fillText("Address line2", "1111 Home Alone");
        expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line errors when address line 2 has input", () => {
        const address = generateAddress({
          ...emptyAddressData,
          addressLine2: "123",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        blurInput("Address line2");
        expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
        expect(screen.getByText(Config.formation.fields.addressZipCode.foreign.errorUS)).toBeInTheDocument();
      });

      it("renders profile address zip code field with input value", () => {
        const address = generateAddress({
          addressZipCode: "11429",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address zip code")).toHaveValue("11429");
      });

      it("renders profile address zip code with changed value", () => {
        const address = generateAddress({
          addressZipCode: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address zip code")).toHaveValue("");
        fillText("Address zip code", "11429");
        expect(screen.getByLabelText("Address zip code")).toHaveValue("11429");
      });

      it("updates profile address state field with New York value", () => {
        const address = generateAddress({
          addressState: { shortCode: "NY", name: "New York" },
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address state")).toHaveValue("NY");
      });

      it("renders profile zip code error", () => {
        const address = generateAddress({
          addressZipCode: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "US" }),
            }),
          })
        );
        renderComponent({});

        blurInput("Address zip code");
        expect(screen.getByText(Config.formation.fields.addressZipCode.foreign.errorUS)).toBeInTheDocument();
      });
    });

    describe("International business", () => {
      it("displays profile address fields for an International business", () => {
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({
                businessLocationType: "INTL",
              }),
            }),
          })
        );

        renderComponent({});
        expect(screen.getByLabelText("Address line1")).toBeInTheDocument();
        expect(screen.getByLabelText("Address line2")).toBeInTheDocument();
        expect(screen.getByLabelText("Address city")).toBeInTheDocument();
        expect(screen.getByLabelText("Address province")).toBeInTheDocument();
        expect(screen.getByLabelText("Address country")).toBeInTheDocument();
        expect(screen.getByLabelText("Address zip code")).toBeInTheDocument();
        expect(screen.queryByLabelText("Address state")).not.toBeInTheDocument();
      });

      it("renders profile address line 1 field with input value", () => {
        const address = generateAddress({
          addressLine1: "1111 Home Alone",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});
        expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line 1 with changed value", () => {
        const address = generateAddress({
          addressLine1: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address line1")).toHaveValue("");
        fillText("Address line1", "1111 Home Alone");
        expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line 1 error", () => {
        const address = generateAddress({
          addressLine1: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});

        blurInput("Address line1");
        expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
      });

      it("renders profile address line 2 field with input value", () => {
        const address = generateAddress({
          addressLine2: "1111 Home Alone",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line 2 with changed value", () => {
        const address = generateAddress({
          addressLine2: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address line2")).toHaveValue("");
        fillText("Address line2", "1111 Home Alone");
        expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
      });

      it("renders profile address line errors when only address line 2 has input", () => {
        const address = generateFormationFormData({
          ...createEmptyFormationFormData(),
          addressLine2: "Suite 123",
        });

        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({ ...address, municipalities: undefined });
        blurInput("Address line2");
        expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
        expect(screen.getByText(Config.formation.fields.addressCity.error)).toBeInTheDocument();
        expect(
          screen.getByText(Config.formation.fields.addressZipCode.foreign.errorIntl)
        ).toBeInTheDocument();
      });

      it("renders profile address zip code field with input value", () => {
        const address = generateAddress({
          addressZipCode: "ERT45",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address zip code")).toHaveValue("ERT45");
      });

      it("renders profile address zip code with changed value", () => {
        const address = generateAddress({
          addressZipCode: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});

        expect(screen.getByLabelText("Address zip code")).toHaveValue("");
        fillText("Address zip code", "ERT45");
        expect(screen.getByLabelText("Address zip code")).toHaveValue("ERT45");
      });

      it("updates profile address province field with province value", () => {
        const address = generateAddress({
          addressProvince: "some-Province",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});
        expect(screen.getByLabelText("Address province")).toHaveValue("some-Province");
      });

      it("renders profile zip code error", () => {
        const address = generateAddress({
          addressZipCode: "",
        });
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({
              completedFilingPayment: false,
              formationFormData: generateFormationFormData({ ...address, businessLocationType: "INTL" }),
            }),
          })
        );
        renderComponent({});

        blurInput("Address zip code");
        expect(
          screen.getByText(Config.formation.fields.addressZipCode.foreign.errorIntl)
        ).toBeInTheDocument();
      });
    });
  });
});

const selectByText = (label: string, value: string): void => {
  fireEvent.mouseDown(screen.getByLabelText(label));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByText(value));
};

const fillText = (label: string, value: string): void => {
  const item = screen.getByLabelText(label);
  fireEvent.change(item, { target: { value: value } });
  fireEvent.blur(item);
};

const blurInput = (label: string): void => {
  const item = screen.getByLabelText(label);
  fireEvent.blur(item);
};
