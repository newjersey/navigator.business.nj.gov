import * as getCurrentDateModule from "@businessnjgovnavigator/shared/dateHelpers";
import dayjs from "dayjs";

const currentDateMock = (getCurrentDateModule as jest.Mocked<typeof getCurrentDateModule>).getCurrentDate;

export const useMockDate = (date: string): void => {
  currentDateMock.mockReturnValue(dayjs(date, "YYYY-MM-DD"));
};
