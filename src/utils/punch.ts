import { PunchText } from "@/constants/punch";
import type { PunchRecord } from "@/db/schema";
import { differenceInMilliseconds, format, intervalToDuration } from "date-fns";

export function getUserDailyPunchInfo(
  records: PunchRecord[] | { punchTime: Date | null }[]
) {
  const nextAction =
    records.length % 2 === 0 ? PunchText.PUNCHED_IN : PunchText.PUNCHED_OUT;

  let totalPunchInTime = 0,
    totalWorkTime = 0,
    totalPunchOutTime = 0;
  if (records.length > 0) {
    totalPunchInTime = calculateTotalPunchInTime(records);
    totalWorkTime = calculateTotalWorkTime(records);
    totalPunchOutTime = differenceInMilliseconds(
      totalWorkTime,
      totalPunchInTime
    );
  }

  return {
    nextAction,
    totalPunchInTime,
    totalWorkTime,
    totalPunchOutTime,
  };
}

function calculateTotalPunchInTime(
  records: PunchRecord[] | { punchTime: Date | null }[]
) {
  let totalPunchInMilliseconds = 0;

  for (let i = 0; i < records.length; i += 2) {
    const punchInTime = records[i].punchTime!;
    let punchOutTime = records[i + 1]?.punchTime!;

    if (!punchOutTime) {
      const today = format(new Date(), "yyyy-MM-dd");
      if (today === format(punchInTime, "yyyy-MM-dd")) {
        punchOutTime = new Date();
      } else {
        punchOutTime = punchInTime;
      }
    }

    totalPunchInMilliseconds += differenceInMilliseconds(
      new Date(punchOutTime),
      new Date(punchInTime)
    );
  }

  return totalPunchInMilliseconds;
}

function calculateTotalWorkTime(
  records: PunchRecord[] | { punchTime: Date | null }[]
) {
  let totalWorkedMilliseconds = 0;
  const firstPunchInTime = records[0]?.punchTime!;
  const totalRecords = records.length;
  let lastPunchOutTime = records[totalRecords - 1].punchTime!;

  if (totalRecords % 2 == 0) {
    lastPunchOutTime = new Date(records[totalRecords - 1]?.punchTime!);
  } else {
    const today = format(new Date(), "yyyy-MM-dd");
    if (today === format(firstPunchInTime!, "yyyy-MM-dd")) {
      lastPunchOutTime = new Date();
    }
  }

  totalWorkedMilliseconds = differenceInMilliseconds(
    lastPunchOutTime,
    firstPunchInTime
  );

  return totalWorkedMilliseconds;
}

export function convertHoursToTimeFormat(totalMilliseconds: number): string {
  const duration = intervalToDuration({ start: 0, end: totalMilliseconds });
  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(duration.hours ?? 0)}H:${pad(duration.minutes ?? 0)}M:${pad(duration.seconds ?? 0)}S`;
}
