import { getMergedConfig } from "@/contexts/configContext";
import { createProfileFieldErrorMap, ProfileFieldErrorMap } from "@/lib/types/types";
import { generateProfileData } from "@/test/factories";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { ProfileData, randomInt } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProfileFields } from "../../lib/types/types";
import { getFlow } from "../../lib/utils/helpers";
import { OnboardingTaxId } from "./OnboardingTaxId";

jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
const Config = getMergedConfig();

type ErrorProps = {
  errorMap: ProfileFieldErrorMap;
  onValidation: (valFieldName: ProfileFields, invalid: boolean) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderComponent = (profileData: ProfileData, errorProps: ErrorProps, fieldProps?: any) => {
  render(
    <WithStatefulProfileData initialData={profileData}>
      <OnboardingTaxId
        fieldStates={errorProps.errorMap}
        onValidation={errorProps.onValidation}
        {...fieldProps}
      />
    </WithStatefulProfileData>
  );
};

describe("<OnboardingTaxId />", () => {
  let profileData: ProfileData;
  let errorProps: ErrorProps;

  beforeEach(() => {
    jest.resetAllMocks();
    errorProps = {
      errorMap: createProfileFieldErrorMap(),
      onValidation: jest.fn((valFieldName: ProfileFields, invalid: boolean) => {
        errorProps.errorMap[valFieldName] = { ...errorProps.errorMap[valFieldName], invalid };
      }),
    };
    profileData = generateProfileData({
      businessPersona: "STARTING",
    });
  });

  it("renders taxIdLocation field with an existing 9 digit taxId", () => {
    renderComponent(
      {
        ...profileData,
        taxId: randomInt(9).toString(),
      },
      errorProps
    );
    expect(screen.getByLabelText("Tax id location")).toBeInTheDocument();
  });

  it("does not render taxIdLocation field with an existing 12 digit taxId", () => {
    renderComponent(
      {
        ...profileData,
        taxId: randomInt(12).toString(),
      },
      errorProps
    );
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
  });

  it("does not render taxIdLocation field with no taxId", () => {
    renderComponent(
      {
        ...profileData,
        taxId: "",
      },
      errorProps
    );
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
  });

  describe("Single TaxId Field", () => {
    it("pre-populates from profileData", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789000",
        },
        errorProps
      );
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789/000");
    });

    it("successfully saves to profileData", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789000" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(currentProfileData().taxId).toEqual("123456789000");
      expect(
        screen.queryByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).not.toBeInTheDocument();
    });

    it("fires validation for less than 12 characters", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "1234" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(
        screen.getByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("retains initial field type", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
    });
  });

  describe("Split TaxId Field", () => {
    it("pre-populates from profileData", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "12345678912",
        },
        errorProps
      );
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789");
      expect((screen.getByLabelText("Tax id location") as HTMLInputElement).value).toEqual("12");
    });

    it("does not fire validation on blur of Tax id when at 9 digits", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(
        screen.queryByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).not.toBeInTheDocument();
    });

    it("fires validation on blur of Tax id", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(
        screen.getByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("fires validation on blur of Tax id location", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "12" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      expect(
        screen.getByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("fires validation on blur of empty Tax id location", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps,
        { required: true }
      );
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      expect(
        screen.getByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("shifts focus from Tax id to Tax id location fields", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      expect(screen.getByLabelText("Tax id location")).toHaveFocus();
      expect(
        screen.queryByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).not.toBeInTheDocument();
    });

    it("does not shift focus back from Tax id location to Tax id field", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      expect(screen.getByLabelText("Tax id location")).toHaveFocus();
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "123" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "" },
      });
      expect(screen.getByLabelText("Tax id location")).toHaveFocus();
      expect(
        screen.queryByText(Config.profileDefaults[getFlow(profileData)].taxId.errorTextRequired)
      ).not.toBeInTheDocument();
    });

    it("updates profileData", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "123" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      expect(currentProfileData().taxId).toEqual("123456789123");
    });
  });
});
