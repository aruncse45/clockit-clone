import { format, lastDayOfMonth } from "date-fns";

export const getMonthStartAndEndDate = (monthFromProps?: Date) => {
  let month = new Date();
  if (monthFromProps) {
    month = monthFromProps;
  }

  const monthStartDay = format(month, "yyyy-MM-01 00:00:00");
  const monthEndDay = format(lastDayOfMonth(month), "yyyy-MM-dd 23:59:59");

  return {
    monthStartDay,
    monthEndDay,
  };
};

export const getStartAndEndOfADay = (dayFromPops?: Date) => {
  let day = new Date();
  if (dayFromPops) {
    day = dayFromPops;
  }

  const startOfTheDay = format(day, "yyyy-MM-dd 00:00:00");
  const endOfTheDay = format(day, "yyyy-MM-dd 23:59:59");

  return {
    startOfTheDay,
    endOfTheDay,
  };
};
