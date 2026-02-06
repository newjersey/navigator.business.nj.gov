import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
  Checkbox,
  TextField,
} from "@mui/material";
import { HTMLAttributes, ReactElement, SyntheticEvent, useContext, ReactNode } from "react";

const SUPPLIERS = [
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
export const SUPPLIER_NAMES = SUPPLIERS.map(
  (supplier) => `${supplier.name} (${supplier.licenseNumber})`,
);

interface Props {
  CMS_ONLY_show_error?: boolean;
}

export const CigaretteSupplierDropdown = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state: cigaretteLicenseData, setCigaretteLicenseData } =
    useContext(CigaretteLicenseContext);

  const { isFormFieldInvalid, setIsValid } = useFormContextFieldHelpers(
    "salesInfoSupplier",
    DataFormErrorMapContext,
  );

  const onChange = (_: SyntheticEvent<Element, Event>, newValue: string[]): void => {
    setCigaretteLicenseData((data) => {
      return { ...data, salesInfoSupplier: newValue };
    });
    setIsValid(newValue.length > 0);
  };

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement> & {
      key: string;
    },
    option: string,
    { selected }: AutocompleteRenderOptionState,
  ): ReactNode => {
    const { key, ...optionProps } = props;
    return (
      <li key={key} {...optionProps}>
        <Checkbox
          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
          checkedIcon={<CheckBoxIcon fontSize="small" />}
          style={{ marginRight: 8 }}
          checked={selected}
        />
        {option}
      </li>
    );
  };

  const renderInput = (params: AutocompleteRenderInputParams): ReactNode => (
    <TextField
      {...params}
      error={props.CMS_ONLY_show_error || isFormFieldInvalid}
      onBlur={() => {
        if (cigaretteLicenseData.salesInfoSupplier?.length === 0) setIsValid(false);
      }}
      helperText={
        (props.CMS_ONLY_show_error || isFormFieldInvalid) &&
        Config.cigaretteLicenseStep3.fields.selectASupplier.errorRequiredText
      }
    />
  );

  return (
    <div id="question-salesInfoSupplier">
      <WithErrorBar hasError={props.CMS_ONLY_show_error || isFormFieldInvalid} type={"ALWAYS"}>
        <label htmlFor="supplier-select" className="text-bold">
          {Config.cigaretteLicenseStep3.fields.selectASupplier.label}
        </label>

        <Autocomplete
          multiple
          id="supplier-select"
          options={SUPPLIER_NAMES}
          onChange={onChange}
          value={cigaretteLicenseData.salesInfoSupplier}
          disableCloseOnSelect
          getOptionLabel={(option) => option}
          renderOption={renderOption}
          renderInput={renderInput}
          style={{ maxWidth: 450 }}
        />
      </WithErrorBar>
    </div>
  );
};
