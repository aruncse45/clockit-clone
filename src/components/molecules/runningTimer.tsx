"use client";

import { useEffect, useState } from "react";
import PunchForm from "./punchForm";
import { PunchText } from "@/constants/punch";
import { convertHoursToTimeFormat } from "@/utils/punch";

export default function RunningTimer({
  nextAction,
  totalPunchInTime,
  totalWorkTime,
  totalPunchOutTime,
}: {
  nextAction: PunchText;
  totalPunchInTime: number;
  totalWorkTime: number;
  totalPunchOutTime: number;
}) {
  const [punchInDuration, setPunchInDuration] = useState(totalPunchInTime);
  const [totalDuration, setTotalDuration] = useState(totalWorkTime);

  useEffect(() => {
    setTotalDuration(totalWorkTime);
    setPunchInDuration(totalPunchInTime);
  }, [totalWorkTime, totalPunchInTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextAction === PunchText.PUNCHED_OUT) {
        setPunchInDuration((prev) => prev + 1000);
        setTotalDuration((prev) => prev + 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextAction]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <TimeBox text="IN" time={punchInDuration} color="bg-green-600" />
      <TimeBox text="OUT" time={totalPunchOutTime} color="bg-yellow-500" />
      <TimeBox text="TOTAL" time={totalDuration} color="bg-blue-500" />
      <PunchForm nextAction={nextAction} />
    </div>
  );
}

function TimeBox({
  text,
  time,
  color,
}: {
  text: string;
  time: number;
  color: string;
}) {
  const className = `text-sm text-center rounded ${color} px-4 py-2 text-white whitespace-nowrap w-[22ch]`;
  return (
    <div className={className}>
      {text.toUpperCase()}: {convertHoursToTimeFormat(time)}
    </div>
  );
}
