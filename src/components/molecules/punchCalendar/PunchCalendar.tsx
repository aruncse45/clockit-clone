"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function PunchCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      modifiers={{
        outsideCurrentMonth: (date) => date.getMonth() > new Date().getMonth(),
      }}
      modifiersClassNames={{
        outsideCurrentMonth: "cursor-default", // Custom class for days outside the current month
      }}
      showOutsideDays={showOutsideDays}
      className={cn("", className)}
      classNames={{
        caption_start: "w-full",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full space-y-1 border border-slate-300",
        head_row: "flex",
        head_cell:
          "w-full text-muted-foreground font-normal text-2 [&:not(:last-child)]:border-r border-slate-300 bg-gray-100",
        row: "flex",
        cell: "border-t border-r border-slate-300 w-full [&:last-child]:border-r-0 p-0",
        day: "h-full min-h-16 w-full bg-transparent",
        day_range_end: "day-range-end",
        day_today: "text-accent text-black bg-yellow-50",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
PunchCalendar.displayName = "PunchCalendar";

export { PunchCalendar };
