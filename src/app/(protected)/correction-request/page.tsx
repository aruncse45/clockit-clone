"use client";
import DayContent from "@/components/molecules/dayContent/DayContent";
import { PunchCalendar } from "@/components/molecules/punchCalendar/PunchCalendar";
import { punchRecordsApi } from "@/constants/apiPath";
import type { PunchCalendarPunchRecord } from "@/constants/type";
import { getMonthStartAndEndDate } from "@/utils/helper";
import { useCallback, useEffect, useState } from "react";
import CorrectionRequestForm from "@/components/organism/correctionRequestForm";
import { isBefore } from "date-fns";
import Corrections from "@/components/organism/corrections";

export default function Page() {
  const date = new Date();
  const [punchRecordsByDate, setPunchRecordsByDate] = useState<{
    [k: number]: PunchCalendarPunchRecord[];
  }>();
  const [isOpenCorrectionForm, setIsOpenCorrectionForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDatePunchRecords, setSelectedDatePunchRecords] = useState<
    PunchCalendarPunchRecord[]
  >(new Array());

  const updatePunchRecords = useCallback(async (start: string, end: string) => {
    const monthWiseMapping = Object.fromEntries(
      Array.from({ length: 31 }, (_, i) => [i + 1, new Array()])
    );
    try {
      const response = await fetch(punchRecordsApi(start, end));
      const records = await response.json();
      for (const record of records.punch_records) {
        const date = new Date(record.punchTime).getDate();
        monthWiseMapping[date].push(record);
      }
      setPunchRecordsByDate(monthWiseMapping);
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

  const onSelectDate = (date: Date | undefined) => {
    if (
      punchRecordsByDate &&
      Object.keys(punchRecordsByDate).length > 0 &&
      date &&
      isBefore(date, new Date())
    ) {
      setSelectedDatePunchRecords(punchRecordsByDate[date.getDate()]);
      setSelectedDate(date);
      setIsOpenCorrectionForm(true);
    }
  };

  return (
    <>
      {punchRecordsByDate && (
        <Corrections
          punchRecords={Object.values(punchRecordsByDate).flat()}
          cancelActionEnabled
          onUpdateCorrectionStatus={() => onMonthChangeHandler(new Date())}
        />
      )}
      <div className="h-2" />
      <PunchCalendar
        mode="single"
        selected={date}
        className="max-w-screen-2xl rounded bg-white p-4"
        onMonthChange={(month: Date) => onMonthChangeHandler(month)}
        components={{
          DayContent: (props) => {
            const date = props.date.getDate();
            return (
              <DayContent
                {...props}
                punchRecords={punchRecordsByDate && punchRecordsByDate[date]}
              />
            );
          },
        }}
        onSelect={onSelectDate}
      />
      {isOpenCorrectionForm && (
        <CorrectionRequestForm
          isOpen={isOpenCorrectionForm}
          setIsOpen={setIsOpenCorrectionForm}
          selectedDate={selectedDate || new Date()}
          selectedDatePunchRecords={selectedDatePunchRecords}
          onSuccess={updatePunchRecords}
        />
      )}
    </>
  );
}
