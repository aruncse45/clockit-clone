"use client";
import { PunchCalendar } from "@/components/molecules/punchCalendar/PunchCalendar";
import { correctionsPunchRecordsApi } from "@/constants/apiPath";
import type { PunchCalendarPunchRecord } from "@/constants/type";
import { getMonthStartAndEndDate } from "@/utils/helper";
import { useCallback, useEffect, useState } from "react";
import Corrections from "@/components/organism/corrections";

export default function Page() {
  const date = new Date();
  const [punchRecords, setPunchRecords] = useState<PunchCalendarPunchRecord[]>(
    []
  );

  const updatePunchRecords = useCallback(async (start: string, end: string) => {
    try {
      const response = await fetch(correctionsPunchRecordsApi(start, end));
      const correctionRecord = await response.json();
      setPunchRecords(correctionRecord?.data?.records || []);
    } catch {
      // TODO: add toast later
    }
  }, []);

  const onMonthChangeHandler = (month: Date) => {
    const { monthStartDay, monthEndDay } = getMonthStartAndEndDate(month);
    updatePunchRecords(monthStartDay, monthEndDay).then();
  };

  useEffect(() => {
    const { monthStartDay, monthEndDay } = getMonthStartAndEndDate();
    updatePunchRecords(monthStartDay, monthEndDay).then();
  }, [updatePunchRecords]);

  return (
    <>
      <PunchCalendar
        mode="single"
        selected={date}
        className="max-w-screen-2xl rounded bg-white p-4"
        onMonthChange={(month: Date) => onMonthChangeHandler(month)}
      />
      <div className="h-2" />
      {punchRecords?.length && <Corrections punchRecords={punchRecords} />}
    </>
  );
}
