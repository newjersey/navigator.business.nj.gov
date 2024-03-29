export const arrayOfCountriesShortCodes = [
  "AF",
  "AL",
  "DZ",
  "AS",
  "AD",
  "AO",
  "AI",
  "AQ",
  "AG",
  "AR",
  "AM",
  "AW",
  "AU",
  "AT",
  "AZ",
  "BS",
  "BH",
  "BD",
  "BB",
  "BY",
  "BE",
  "BZ",
  "BJ",
  "BM",
  "BT",
  "BO",
  "BQ",
  "BA",
  "BW",
  "BV",
  "BR",
  "IO",
  "BN",
  "BG",
  "BF",
  "BI",
  "CV",
  "KH",
  "CM",
  "CA",
  "KY",
  "CF",
  "TD",
  "CL",
  "CN",
  "CX",
  "CC",
  "CO",
  "KM",
  "CD",
  "CG",
  "CK",
  "CR",
  "HR",
  "CU",
  "CW",
  "CY",
  "CZ",
  "CI",
  "DK",
  "DJ",
  "DM",
  "DO",
  "EC",
  "EG",
  "SV",
  "GQ",
  "ER",
  "EE",
  "SZ",
  "ET",
  "FK",
  "FO",
  "FJ",
  "FI",
  "FR",
  "GF",
  "PF",
  "TF",
  "GA",
  "GM",
  "GE",
  "DE",
  "GH",
  "GI",
  "GR",
  "GL",
  "GD",
  "GP",
  "GU",
  "GT",
  "GG",
  "GN",
  "GW",
  "GY",
  "HT",
  "HM",
  "VA",
  "HN",
  "HK",
  "HU",
  "IS",
  "IN",
  "ID",
  "IR",
  "IQ",
  "IE",
  "IM",
  "IL",
  "IT",
  "JM",
  "JP",
  "JE",
  "JO",
  "KZ",
  "KE",
  "KI",
  "KP",
  "KR",
  "KW",
  "KG",
  "LA",
  "LV",
  "LB",
  "LS",
  "LR",
  "LY",
  "LI",
  "LT",
  "LU",
  "MO",
  "MG",
  "MW",
  "MY",
  "MV",
  "ML",
  "MT",
  "MH",
  "MQ",
  "MR",
  "MU",
  "YT",
  "MX",
  "FM",
  "MD",
  "MC",
  "MN",
  "ME",
  "MS",
  "MA",
  "MZ",
  "MM",
  "NA",
  "NR",
  "NP",
  "NL",
  "NC",
  "NZ",
  "NI",
  "NE",
  "NG",
  "NU",
  "NF",
  "MP",
  "NO",
  "OM",
  "PK",
  "PW",
  "PS",
  "PA",
  "PG",
  "PY",
  "PE",
  "PH",
  "PN",
  "PL",
  "PT",
  "PR",
  "QA",
  "MK",
  "RO",
  "RU",
  "RW",
  "RE",
  "BL",
  "SH",
  "KN",
  "LC",
  "MF",
  "PM",
  "VC",
  "WS",
  "SM",
  "ST",
  "SA",
  "SN",
  "RS",
  "SC",
  "SL",
  "SG",
  "SX",
  "SK",
  "SI",
  "SB",
  "SO",
  "ZA",
  "GS",
  "SS",
  "ES",
  "LK",
  "SD",
  "SR",
  "SJ",
  "SE",
  "CH",
  "SY",
  "TW",
  "TJ",
  "TZ",
  "TH",
  "TL",
  "TG",
  "TK",
  "TO",
  "TT",
  "TN",
  "TR",
  "TM",
  "TC",
  "TV",
  "UG",
  "UA",
  "AE",
  "GB",
  "UM",
  "US",
  "UY",
  "UZ",
  "VU",
  "VE",
  "VN",
  "VG",
  "VI",
  "WF",
  "EH",
  "YE",
  "ZM",
  "ZW",
  "AX",
] as const;

export type CountriesShortCodes = (typeof arrayOfCountriesShortCodes)[number];

export type CountriesObject = {
  shortCode: CountriesShortCodes;
  name: string;
};

export const arrayOfCountriesObjects: CountriesObject[] = [
  { name: "Afghanistan", shortCode: "AF" },
  { name: "Albania", shortCode: "AL" },
  { name: "Algeria", shortCode: "DZ" },
  { name: "American Samoa", shortCode: "AS" },
  { name: "Andorra", shortCode: "AD" },
  { name: "Angola", shortCode: "AO" },
  { name: "Anguilla", shortCode: "AI" },
  { name: "Antarctica", shortCode: "AQ" },
  { name: "Antigua and Barbuda", shortCode: "AG" },
  { name: "Argentina", shortCode: "AR" },
  { name: "Armenia", shortCode: "AM" },
  { name: "Aruba", shortCode: "AW" },
  { name: "Australia", shortCode: "AU" },
  { name: "Austria", shortCode: "AT" },
  { name: "Azerbaijan", shortCode: "AZ" },
  { name: "Bahamas (the)", shortCode: "BS" },
  { name: "Bahrain", shortCode: "BH" },
  { name: "Bangladesh", shortCode: "BD" },
  { name: "Barbados", shortCode: "BB" },
  { name: "Belarus", shortCode: "BY" },
  { name: "Belgium", shortCode: "BE" },
  { name: "Belize", shortCode: "BZ" },
  { name: "Benin", shortCode: "BJ" },
  { name: "Bermuda", shortCode: "BM" },
  { name: "Bhutan", shortCode: "BT" },
  { name: "Bolivia (Plurinational State of)", shortCode: "BO" },
  { name: "Bonaire, Sint Eustatius and Saba", shortCode: "BQ" },
  { name: "Bosnia and Herzegovina", shortCode: "BA" },
  { name: "Botswana", shortCode: "BW" },
  { name: "Bouvet Island", shortCode: "BV" },
  { name: "Brazil", shortCode: "BR" },
  { name: "British Indian Ocean Territory (the)", shortCode: "IO" },
  { name: "Brunei Darussalam", shortCode: "BN" },
  { name: "Bulgaria", shortCode: "BG" },
  { name: "Burkina Faso", shortCode: "BF" },
  { name: "Burundi", shortCode: "BI" },
  { name: "Cabo Verde", shortCode: "CV" },
  { name: "Cambodia", shortCode: "KH" },
  { name: "Cameroon", shortCode: "CM" },
  { name: "Canada", shortCode: "CA" },
  { name: "Cayman Islands (the)", shortCode: "KY" },
  { name: "Central African Republic (the)", shortCode: "CF" },
  { name: "Chad", shortCode: "TD" },
  { name: "Chile", shortCode: "CL" },
  { name: "China", shortCode: "CN" },
  { name: "Christmas Island", shortCode: "CX" },
  { name: "Cocos (Keeling) Islands (the)", shortCode: "CC" },
  { name: "Colombia", shortCode: "CO" },
  { name: "Comoros (the)", shortCode: "KM" },
  { name: "Congo (the Democratic Republic of the)", shortCode: "CD" },
  { name: "Congo (the)", shortCode: "CG" },
  { name: "Cook Islands (the)", shortCode: "CK" },
  { name: "Costa Rica", shortCode: "CR" },
  { name: "Croatia", shortCode: "HR" },
  { name: "Cuba", shortCode: "CU" },
  { name: "Curaçao", shortCode: "CW" },
  { name: "Cyprus", shortCode: "CY" },
  { name: "Czechia", shortCode: "CZ" },
  { name: "Côte d'Ivoire", shortCode: "CI" },
  { name: "Denmark", shortCode: "DK" },
  { name: "Djibouti", shortCode: "DJ" },
  { name: "Dominica", shortCode: "DM" },
  { name: "Dominican Republic (the)", shortCode: "DO" },
  { name: "Ecuador", shortCode: "EC" },
  { name: "Egypt", shortCode: "EG" },
  { name: "El Salvador", shortCode: "SV" },
  { name: "Equatorial Guinea", shortCode: "GQ" },
  { name: "Eritrea", shortCode: "ER" },
  { name: "Estonia", shortCode: "EE" },
  { name: "Eswatini", shortCode: "SZ" },
  { name: "Ethiopia", shortCode: "ET" },
  { name: "Falkland Islands (the) [Malvinas]", shortCode: "FK" },
  { name: "Faroe Islands (the)", shortCode: "FO" },
  { name: "Fiji", shortCode: "FJ" },
  { name: "Finland", shortCode: "FI" },
  { name: "France", shortCode: "FR" },
  { name: "French Guiana", shortCode: "GF" },
  { name: "French Polynesia", shortCode: "PF" },
  { name: "French Southern Territories (the)", shortCode: "TF" },
  { name: "Gabon", shortCode: "GA" },
  { name: "Gambia (the)", shortCode: "GM" },
  { name: "Georgia", shortCode: "GE" },
  { name: "Germany", shortCode: "DE" },
  { name: "Ghana", shortCode: "GH" },
  { name: "Gibraltar", shortCode: "GI" },
  { name: "Greece", shortCode: "GR" },
  { name: "Greenland", shortCode: "GL" },
  { name: "Grenada", shortCode: "GD" },
  { name: "Guadeloupe", shortCode: "GP" },
  { name: "Guam", shortCode: "GU" },
  { name: "Guatemala", shortCode: "GT" },
  { name: "Guernsey", shortCode: "GG" },
  { name: "Guinea", shortCode: "GN" },
  { name: "Guinea-Bissau", shortCode: "GW" },
  { name: "Guyana", shortCode: "GY" },
  { name: "Haiti", shortCode: "HT" },
  { name: "Heard Island and McDonald Islands", shortCode: "HM" },
  { name: "Holy See (the)", shortCode: "VA" },
  { name: "Honduras", shortCode: "HN" },
  { name: "Hong Kong", shortCode: "HK" },
  { name: "Hungary", shortCode: "HU" },
  { name: "Iceland", shortCode: "IS" },
  { name: "India", shortCode: "IN" },
  { name: "Indonesia", shortCode: "ID" },
  { name: "Iran (Islamic Republic of)", shortCode: "IR" },
  { name: "Iraq", shortCode: "IQ" },
  { name: "Ireland", shortCode: "IE" },
  { name: "Isle of Man", shortCode: "IM" },
  { name: "Israel", shortCode: "IL" },
  { name: "Italy", shortCode: "IT" },
  { name: "Jamaica", shortCode: "JM" },
  { name: "Japan", shortCode: "JP" },
  { name: "Jersey", shortCode: "JE" },
  { name: "Jordan", shortCode: "JO" },
  { name: "Kazakhstan", shortCode: "KZ" },
  { name: "Kenya", shortCode: "KE" },
  { name: "Kiribati", shortCode: "KI" },
  { name: "Korea (the Democratic People's Republic of)", shortCode: "KP" },
  { name: "Korea (the Republic of)", shortCode: "KR" },
  { name: "Kuwait", shortCode: "KW" },
  { name: "Kyrgyzstan", shortCode: "KG" },
  { name: "Lao People's Democratic Republic (the)", shortCode: "LA" },
  { name: "Latvia", shortCode: "LV" },
  { name: "Lebanon", shortCode: "LB" },
  { name: "Lesotho", shortCode: "LS" },
  { name: "Liberia", shortCode: "LR" },
  { name: "Libya", shortCode: "LY" },
  { name: "Liechtenstein", shortCode: "LI" },
  { name: "Lithuania", shortCode: "LT" },
  { name: "Luxembourg", shortCode: "LU" },
  { name: "Macao", shortCode: "MO" },
  { name: "Madagascar", shortCode: "MG" },
  { name: "Malawi", shortCode: "MW" },
  { name: "Malaysia", shortCode: "MY" },
  { name: "Maldives", shortCode: "MV" },
  { name: "Mali", shortCode: "ML" },
  { name: "Malta", shortCode: "MT" },
  { name: "Marshall Islands (the)", shortCode: "MH" },
  { name: "Martinique", shortCode: "MQ" },
  { name: "Mauritania", shortCode: "MR" },
  { name: "Mauritius", shortCode: "MU" },
  { name: "Mayotte", shortCode: "YT" },
  { name: "Mexico", shortCode: "MX" },
  { name: "Micronesia (Federated States of)", shortCode: "FM" },
  { name: "Moldova (the Republic of)", shortCode: "MD" },
  { name: "Monaco", shortCode: "MC" },
  { name: "Mongolia", shortCode: "MN" },
  { name: "Montenegro", shortCode: "ME" },
  { name: "Montserrat", shortCode: "MS" },
  { name: "Morocco", shortCode: "MA" },
  { name: "Mozambique", shortCode: "MZ" },
  { name: "Myanmar", shortCode: "MM" },
  { name: "Namibia", shortCode: "NA" },
  { name: "Nauru", shortCode: "NR" },
  { name: "Nepal", shortCode: "NP" },
  { name: "Netherlands (the)", shortCode: "NL" },
  { name: "New Caledonia", shortCode: "NC" },
  { name: "New Zealand", shortCode: "NZ" },
  { name: "Nicaragua", shortCode: "NI" },
  { name: "Niger (the)", shortCode: "NE" },
  { name: "Nigeria", shortCode: "NG" },
  { name: "Niue", shortCode: "NU" },
  { name: "Norfolk Island", shortCode: "NF" },
  { name: "Northern Mariana Islands (the)", shortCode: "MP" },
  { name: "Norway", shortCode: "NO" },
  { name: "Oman", shortCode: "OM" },
  { name: "Pakistan", shortCode: "PK" },
  { name: "Palau", shortCode: "PW" },
  { name: "Palestine, State of", shortCode: "PS" },
  { name: "Panama", shortCode: "PA" },
  { name: "Papua New Guinea", shortCode: "PG" },
  { name: "Paraguay", shortCode: "PY" },
  { name: "Peru", shortCode: "PE" },
  { name: "Philippines (the)", shortCode: "PH" },
  { name: "Pitcairn", shortCode: "PN" },
  { name: "Poland", shortCode: "PL" },
  { name: "Portugal", shortCode: "PT" },
  { name: "Puerto Rico", shortCode: "PR" },
  { name: "Qatar", shortCode: "QA" },
  { name: "Republic of North Macedonia", shortCode: "MK" },
  { name: "Romania", shortCode: "RO" },
  { name: "Russian Federation (the)", shortCode: "RU" },
  { name: "Rwanda", shortCode: "RW" },
  { name: "Réunion", shortCode: "RE" },
  { name: "Saint Barthélemy", shortCode: "BL" },
  { name: "Saint Helena, Ascension and Tristan da Cunha", shortCode: "SH" },
  { name: "Saint Kitts and Nevis", shortCode: "KN" },
  { name: "Saint Lucia", shortCode: "LC" },
  { name: "Saint Martin (French part)", shortCode: "MF" },
  { name: "Saint Pierre and Miquelon", shortCode: "PM" },
  { name: "Saint Vincent and the Grenadines", shortCode: "VC" },
  { name: "Samoa", shortCode: "WS" },
  { name: "San Marino", shortCode: "SM" },
  { name: "Sao Tome and Principe", shortCode: "ST" },
  { name: "Saudi Arabia", shortCode: "SA" },
  { name: "Senegal", shortCode: "SN" },
  { name: "Serbia", shortCode: "RS" },
  { name: "Seychelles", shortCode: "SC" },
  { name: "Sierra Leone", shortCode: "SL" },
  { name: "Singapore", shortCode: "SG" },
  { name: "Sint Maarten (Dutch part)", shortCode: "SX" },
  { name: "Slovakia", shortCode: "SK" },
  { name: "Slovenia", shortCode: "SI" },
  { name: "Solomon Islands", shortCode: "SB" },
  { name: "Somalia", shortCode: "SO" },
  { name: "South Africa", shortCode: "ZA" },
  { name: "South Georgia and the South Sandwich Islands", shortCode: "GS" },
  { name: "South Sudan", shortCode: "SS" },
  { name: "Spain", shortCode: "ES" },
  { name: "Sri Lanka", shortCode: "LK" },
  { name: "Sudan (the)", shortCode: "SD" },
  { name: "Suriname", shortCode: "SR" },
  { name: "Svalbard and Jan Mayen", shortCode: "SJ" },
  { name: "Sweden", shortCode: "SE" },
  { name: "Switzerland", shortCode: "CH" },
  { name: "Syrian Arab Republic", shortCode: "SY" },
  { name: "Taiwan (Province of China)", shortCode: "TW" },
  { name: "Tajikistan", shortCode: "TJ" },
  { name: "Tanzania, United Republic of", shortCode: "TZ" },
  { name: "Thailand", shortCode: "TH" },
  { name: "Timor-Leste", shortCode: "TL" },
  { name: "Togo", shortCode: "TG" },
  { name: "Tokelau", shortCode: "TK" },
  { name: "Tonga", shortCode: "TO" },
  { name: "Trinidad and Tobago", shortCode: "TT" },
  { name: "Tunisia", shortCode: "TN" },
  { name: "Turkey", shortCode: "TR" },
  { name: "Turkmenistan", shortCode: "TM" },
  { name: "Turks and Caicos Islands (the)", shortCode: "TC" },
  { name: "Tuvalu", shortCode: "TV" },
  { name: "Uganda", shortCode: "UG" },
  { name: "Ukraine", shortCode: "UA" },
  { name: "United Arab Emirates (the)", shortCode: "AE" },
  { name: "United Kingdom of Great Britain and Northern Ireland (the)", shortCode: "GB" },
  { name: "United States Minor Outlying Islands (the)", shortCode: "UM" },
  { name: "United States of America (the)", shortCode: "US" },
  { name: "Uruguay", shortCode: "UY" },
  { name: "Uzbekistan", shortCode: "UZ" },
  { name: "Vanuatu", shortCode: "VU" },
  { name: "Venezuela (Bolivarian Republic of)", shortCode: "VE" },
  { name: "Viet Nam", shortCode: "VN" },
  { name: "Virgin Islands (British)", shortCode: "VG" },
  { name: "Virgin Islands (U.S.)", shortCode: "VI" },
  { name: "Wallis and Futuna", shortCode: "WF" },
  { name: "Western Sahara", shortCode: "EH" },
  { name: "Yemen", shortCode: "YE" },
  { name: "Zambia", shortCode: "ZM" },
  { name: "Zimbabwe", shortCode: "ZW" },
  { name: "Åland Islands", shortCode: "AX" },
];
