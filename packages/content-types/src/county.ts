/** All New Jersey counties plus the "All" wildcard value. */
export const AllCounties = [
  "All",
  "Atlantic",
  "Bergen",
  "Burlington",
  "Camden",
  "Cape May",
  "Cumberland",
  "Essex",
  "Gloucester",
  "Hudson",
  "Hunterdon",
  "Mercer",
  "Middlesex",
  "Monmouth",
  "Morris",
  "Ocean",
  "Passaic",
  "Salem",
  "Somerset",
  "Sussex",
  "Union",
  "Warren",
] as const;

/** A New Jersey county name or "All" to indicate all counties. */
export type County = (typeof AllCounties)[number];
