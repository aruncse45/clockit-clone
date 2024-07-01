"use client";
import { Progress } from "@/components/ui/progress";
import type { ReactElement } from "react";

interface StatusCardTypes {
  currentValue: number;
  currentValueColor?: string;
  totalValue?: number;
  title: string;
  Icon?: ReactElement;
  progressBarColor?: string;
}

export default function StatusCard({
  currentValue,
  totalValue,
  title,
  Icon,
  currentValueColor = "text-gray-800",
  progressBarColor = "text-gray-800",
}: StatusCardTypes) {
  return (
    <div className="flex min-h-[150px] w-[100%] flex-col gap-y-4 rounded-lg bg-white p-4 shadow-lg">
      <div className="flex justify-between">
        <span>
          <span
            className={`text-3xl font-medium uppercase ${currentValueColor}`}
          >
            {currentValue}
          </span>
          <br />
          <span className="text-sm uppercase text-gray-500">{title}</span>
        </span>
        {Icon}
      </div>
      <div className="flex flex-col">
        <Progress
          indicatorColor={progressBarColor}
          className="w-[100%]"
          value={
            totalValue && totalValue > 0
              ? (currentValue * 100) / totalValue
              : 100
          }
        />
        {totalValue && (
          <span className="mt-2 self-end text-sm text-gray-500">
            {totalValue > 0 ? (currentValue * 100) / totalValue : 0}%
          </span>
        )}
      </div>
    </div>
  );
}
