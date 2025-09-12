import { ReactElement, useState } from "react";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Heading } from "@/components/njwds-extended/Heading";
import { EmployerRatesRequest, EmployerRatesResponse } from "@businessnjgovnavigator/shared/";
import * as api from "@/lib/api-client/apiClient";
import { GenericTextField } from "@/components/GenericTextField";
import { useUserData } from "@/lib/data-hooks/useUserData";

// TODO: clean up component when UI work begins
export const EmployerRates = (): ReactElement => {
  const { userData } = useUserData();

  const [response, setResponse] = useState<EmployerRatesResponse | null>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [ein, setEin] = useState<string>("");
  const [qtr, setQtr] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const handleClick = (): void => {
    if (!userData) return;

    const requestData: EmployerRatesRequest = {
      businessName: businessName,
      email: email,
      ein: ein,
      qtr: Number.parseInt(qtr),
      year: Number.parseInt(year),
    };

    api
      .checkEmployerRates({ employerRates: requestData, userData })
      .then((response: EmployerRatesResponse): void => {
        setResponse(response);
      })
      .catch((error) => {
        console.log("error:", error);
      });
  };

  const renderResults = (responseObj: EmployerRatesResponse): ReactElement[] => {
    const keys = Object.keys(responseObj) as Array<keyof EmployerRatesResponse>;

    return keys.map((key) => {
      return (
        <div key={key}>
          {key}: {responseObj[key]}
        </div>
      );
    });
  };

  return (
    <div data-testid="employer-rates-section">
      Business Name
      <GenericTextField
        fieldName={"business name"}
        handleChange={setBusinessName}
        value={businessName}
      />
      Email
      <GenericTextField fieldName={"email"} handleChange={setEmail} value={email} />
      Ein
      <GenericTextField fieldName={"ein"} handleChange={setEin} value={ein} />
      Quarter
      <GenericTextField fieldName={"qtr"} handleChange={setQtr} value={qtr} />
      Year
      <GenericTextField fieldName={"year"} handleChange={setYear} value={year} />
      <div className="margin-top-4">
        <PrimaryButton isColor="primary" onClick={handleClick}>
          DOL Employer Rates
        </PrimaryButton>
      </div>
      {response && (
        <div className="margin-bottom-4">
          <Heading level={2}>Employer Rates Data</Heading>
          {renderResults(response)}
        </div>
      )}
    </div>
  );
};
