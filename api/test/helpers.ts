import dayjs from "dayjs";

export const determineAnnualFilingDate = (dateOfFormation: string) => {
  const currentDate = dayjs();
  const dateOfFormationDate = dayjs(dateOfFormation);
  let year = currentDate.year();
  if (dateOfFormationDate.month() < currentDate.month()) {
    year = year + 1;
  }
  const nextMonth = dateOfFormationDate.month() + 2;
  return dayjs(`${year}-${nextMonth}-01`).add(-1, "day").format("YYYY-MM-DD");
};
