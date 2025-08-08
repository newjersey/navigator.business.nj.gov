import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Autocomplete, Checkbox, InputLabel, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ReactElement, useContext } from "react";

import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DateObject } from "@businessnjgovnavigator/shared/dateHelpers";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

const suppliers = [
  { licenseNumber: 501, name: "A TRENK, INC" },
  { licenseNumber: 539, name: "A WHOLESALERS COMPANY" },
  { licenseNumber: 540, name: "AJJA DISTRIBUTORS, LLC" },
  { licenseNumber: 541, name: "ALL COUNTY WHOLESALE INC" },
  { licenseNumber: 502, name: "ALLEN BROTHERS WHSLE DIST INC" },
  { licenseNumber: 542, name: "ANTHONY'S PHARMACY, LLC" },
  { licenseNumber: 543, name: "ANYA ENTERPRISES INC" },
  { licenseNumber: 544, name: "ARTHUR R. MUSTARDO & SONS, INC." },
  { licenseNumber: 545, name: "BEE GEE CANDY CO., INC." },
  { licenseNumber: 546, name: "BEST MANAGEMENT INC" },
  { licenseNumber: 547, name: "BEST MARK SUPERMARKETS, INC." },
  { licenseNumber: 548, name: "BJ'S WHOLESALE CLUB, INC." },
  { licenseNumber: 503, name: "BOZZUTOS, INC" },
  { licenseNumber: 549, name: "BROAD BEVERAGES, INC." },
  { licenseNumber: 504, name: "BROWNY FOOD PRODUCTS" },
  { licenseNumber: 550, name: "C & J BROTHERS DISTRIBUTORS INC." },
  { licenseNumber: 505, name: "C & S WHOLESALE GROCERS INC." },
  { licenseNumber: 619, name: "CHEERS & COMPANY LLC" },
  { licenseNumber: 506, name: "CONSUMER PRODUCTS DISTRIBUTOR INC" },
  { licenseNumber: 614, name: "CONTINENTAL WHOLESALE DISTRIBUTOR LLC" },
  { licenseNumber: 507, name: "COOPER-BOOTH WHOLESALE CO L L P" },
  { licenseNumber: 508, name: "CORE-MARK MIDCONTINENT INC" },
  { licenseNumber: 509, name: "COSTCO WHOLESALE CORPORATION" },
  { licenseNumber: 551, name: "CREATIVE MANAGEMENT, INCORPORATED" },
  { licenseNumber: 552, name: "D & B BUSSINESS INC." },
  { licenseNumber: 611, name: "D & V WHOLESALE INC" },
  { licenseNumber: 553, name: "EASY WHOLESALE INCORPORATED" },
  { licenseNumber: 554, name: "ESE DISTRIBUTION COMPANY INC." },
  { licenseNumber: 510, name: "FRANCHISE WHOLESALE CO LLC" },
  { licenseNumber: 511, name: "GARBER BROS.INC." },
  { licenseNumber: 555, name: "GARCIA CANDY & TOBACCO, LLC" },
  { licenseNumber: 556, name: "GARCIA,PEDRO" },
  { licenseNumber: 512, name: "GENERAL EQUITIES, INC" },
  { licenseNumber: 557, name: "GLOBE VENDING, INC." },
  { licenseNumber: 558, name: "GROVER WHOLESALE INC" },
  { licenseNumber: 559, name: "GUGLIELMI, RAYMOND J" },
  { licenseNumber: 612, name: "HACA USA CORP" },
  { licenseNumber: 513, name: "HAROLD LEVINSON ASSOC., INC." },
  { licenseNumber: 560, name: "HENRY & LARRY, INC." },
  { licenseNumber: 561, name: "HERITAGE'S DAIRY STORES, INC." },
  { licenseNumber: 514, name: "HERITAGES WHOLESALE,INC" },
  { licenseNumber: 562, name: "HH CHOICE, L.L.C." },
  { licenseNumber: 515, name: "IRVINGTON TABACCO COMPANY" },
  { licenseNumber: 563, name: "J. N. DISTRIBUTOR INCORPORATED" },
  { licenseNumber: 516, name: "JOHN BRICKS, INCORPORATED" },
  { licenseNumber: 517, name: "JOSEPH FRIEDMAN & SONS INC" },
  { licenseNumber: 564, name: "KANDI METRO DISTRIBUTORS LLC" },
  { licenseNumber: 518, name: "KEYSTONE STATE DIST INC" },
  { licenseNumber: 565, name: "KHAN, SHAMIM" },
  { licenseNumber: 519, name: "KING DISTRIBUTORS CORP" },
  { licenseNumber: 520, name: "KRETEK DISTRIBUTORS,INC." },
  { licenseNumber: 566, name: "KRICHIAN,SARKIS" },
  { licenseNumber: 521, name: "L.J.ZUCCA,INCORPORATED" },
  { licenseNumber: 567, name: "LAWS,DONALD A" },
  { licenseNumber: 568, name: "M & J WHOLESALE, INC." },
  { licenseNumber: 522, name: "M.BERNSTEIN & SONS" },
  { licenseNumber: 569, name: "MAHANNA WHOLESALE LLC" },
  { licenseNumber: 617, name: "MAHI MAHI INC." },
  { licenseNumber: 613, name: "MALLIKARJUN WHOLESALE" },
  { licenseNumber: 570, name: "MANCINELLI,LOUIS F" },
  { licenseNumber: 523, name: "MANDEL TOBACCO CO OF NEW JERSEY INC" },
  { licenseNumber: 524, name: "MC LANE PA" },
  { licenseNumber: 525, name: "MC LANE/MID-ATLANTIC,INC" },
  { licenseNumber: 526, name: "MC LANE/NORTHEAST" },
  { licenseNumber: 571, name: "MCLANE NEW JERSEY, INC." },
  { licenseNumber: 572, name: "MCLANE/EASTERN, INC." },
  { licenseNumber: 573, name: "MECCA DISTRIBUTION, INC." },
  { licenseNumber: 574, name: "MINA TOBACCO LIMITED LIABILITY COMPANY" },
  { licenseNumber: 575, name: "MORRIS COUNTY TOBACCO & CANDY CO. INC." },
  { licenseNumber: 527, name: "MOUNTAIN CANDY & CIGAR CO INC" },
  { licenseNumber: 576, name: "N.B.R. CIGARETTE VENDORS" },
  { licenseNumber: 577, name: "NASH DISTRIBUTORS, INC., A NEW JERSEY CORPORATION" },
  { licenseNumber: 528, name: "NAT SHERMAN INCORPORATED" },
  { licenseNumber: 578, name: "NORTH JERSEY DISTRIBUTORS LLC" },
  { licenseNumber: 579, name: "PATRY CONFECTIONARY MARKET, INC." },
  { licenseNumber: 580, name: "PENA,ABILET" },
  { licenseNumber: 581, name: "PHILLY CANDY & TOBACCO WHOLESALER LLC" },
  { licenseNumber: 529, name: "PINE LESSER & SONS" },
  { licenseNumber: 582, name: "PK WHOLESALER LLC" },
  { licenseNumber: 583, name: "PLAINFIELD TOBACCO AND CANDY CO., INC." },
  { licenseNumber: 584, name: "QUALITY PACKING SUPPLIES CORP." },
  { licenseNumber: 585, name: "QUIK PIK, INC." },
  { licenseNumber: 586, name: "R. C. MANNING, INC." },
  { licenseNumber: 587, name: "RAB CORPORATION" },
  { licenseNumber: 588, name: "RAINBOW HEAVEN DISTRIBUTION, L.L.C." },
  { licenseNumber: 589, name: "READ,FRANCIS W JR" },
  { licenseNumber: 590, name: "RED BANK MART INC." },
  { licenseNumber: 591, name: "REEM WHOLESALE INC" },
  { licenseNumber: 530, name: "RESNICK DIST.,DIV.OF PLAINFIELD" },
  { licenseNumber: 592, name: "RESTAURANT DEPOT, LLC" },
  { licenseNumber: 593, name: "RINTEL DISTRIBUTOR'S INC." },
  { licenseNumber: 616, name: "ROYAL WHOLESALE LLC" },
  { licenseNumber: 531, name: "S & K IMPORTS" },
  { licenseNumber: 594, name: "S. C. J. VENDING, INC." },
  { licenseNumber: 595, name: "SAINT MINA WHOLESALE, INC." },
  { licenseNumber: 596, name: "SALDANA,MARTIN & ESTEVEZ,VICTOR" },
  { licenseNumber: 597, name: "SAMS'S WHOLESALE LLC" },
  { licenseNumber: 532, name: "SENECA DISTRBUTIONS" },
  { licenseNumber: 598, name: "SHAKER DISTRIBUTIONS, INC." },
  { licenseNumber: 599, name: "SHRI HARI DISTRIBUTION LIMITED LIABILITY COMPANY" },
  { licenseNumber: 600, name: "SIDNEY & ROBERT ROSENKRANTZ, INC." },
  { licenseNumber: 601, name: "SMOKER CASTLE INC" },
  { licenseNumber: 533, name: "STAR TOBACCO COMPANY" },
  { licenseNumber: 534, name: "STARKMAN GENERAL PRODUCTS" },
  { licenseNumber: 602, name: "SUN WHOLESALE, INC." },
  { licenseNumber: 618, name: "SUNRISE DISTRIBUTORS INC" },
  { licenseNumber: 535, name: "SUPER FOOD SERVICE INC" },
  { licenseNumber: 536, name: "SUPERVALU TTSJ, INC" },
  { licenseNumber: 603, name: "TAVERAS BROTHERS, LLC" },
  { licenseNumber: 604, name: "THE NEW PROVEEDORA LATINA LLC" },
  { licenseNumber: 615, name: "TOBACCO AND CANDY OF NORTH NEW JERSEY LLC" },
  { licenseNumber: 605, name: "TOWN MART, INC." },
  { licenseNumber: 537, name: "UNITED CANDY & TOBACCO COMPANY" },
  { licenseNumber: 606, name: "V & P GARWOOD HESS, INC." },
  { licenseNumber: 607, name: "VALUE KING WHOLESALE LLC" },
  { licenseNumber: 608, name: "VIKISHA CORP" },
  { licenseNumber: 609, name: "WAKEFERN FOOD CORP." },
  { licenseNumber: 538, name: "WAWA PROCUREMENT INC" },
  { licenseNumber: 610, name: "YOUNES,NASHWA" },
];

interface Props {
  setStepIndex: (step: number) => void;
}
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
export const SalesInfo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state: cigaretteLicenseData, setCigaretteLicenseData } =
    useContext(CigaretteLicenseContext);
  return (
    <>
      <h2>Sales Information</h2>

      <InputLabel htmlFor="start-date-picker" className="margin-top-2">
        Start Date of Cigarette Sales
      </InputLabel>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          onChange={(newValue: DateObject | null) => {
            if (newValue) {
              setCigaretteLicenseData((cigaretteLicenseData) => {
                return { ...cigaretteLicenseData, salesInfoStartDate: newValue.format() };
              });
            }
          }}
          value={cigaretteLicenseData.salesInfoStartDate}
          renderInput={(params): JSX.Element => {
            return (
              <div className="width-100">
                <TextField
                  id="start-date-picker"
                  {...params}
                  variant="outlined"
                  error={false}
                  sx={{
                    svg: { fill: "#4b7600" },
                  }}
                  inputProps={{
                    ...params.inputProps,
                    "aria-label": "Start Date of Cigarette Sales",
                  }}
                  value={cigaretteLicenseData.salesInfoStartDate}
                />
              </div>
            );
          }}
        ></DatePicker>
      </LocalizationProvider>

      <InputLabel htmlFor="supplier-select" className="margin-top-2">
        Select a Supplier
      </InputLabel>

      <Autocomplete
        multiple
        id="supplier-select"
        options={suppliers}
        disableCloseOnSelect
        getOptionLabel={(option) => option.name}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.name}
            </li>
          );
        }}
        style={{ width: 500 }}
        renderInput={(params) => <TextField {...params} />}
      />
      <HorizontalLine />
      <span className="h5-styling">{Config.cigaretteLicenseShared.issuingAgencyLabelText}: </span>
      <span className="h6-styling">{Config.cigaretteLicenseShared.issuingAgencyText}</span>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <SecondaryButton
            isColor="primary"
            onClick={() => props.setStepIndex(1)}
            dataTestId="back"
          >
            {Config.cigaretteLicenseStep2.backButtonText}
          </SecondaryButton>
          <PrimaryButton
            isColor="primary"
            onClick={() => props.setStepIndex(3)}
            dataTestId="cta-primary-1"
            isRightMarginRemoved={true}
          >
            {Config.cigaretteLicenseStep2.nextButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
