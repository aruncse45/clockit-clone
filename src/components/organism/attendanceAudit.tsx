"use client";
import StatusCard from "@/components/molecules/statusCard";
import { TriangleAlert, User, Users, NotebookTabs } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

export default function AttendanceAudit({
  totalIn,
  totalOut,
  totalAbsent,
  totalEmployee,
}: {
  totalIn: number;
  totalOut: number;
  totalAbsent: number;
  totalEmployee: number;
}) {
  const [isCalenderPopoverOpen, setIsCalenderPopoverOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const name = searchParams.get("name") ?? "";

  return (
    <div className="flex flex-col gap-y-3">
      <div className="sticky top-0 z-[1] flex items-center justify-between bg-white px-2 py-2 text-2xl text-gray-500">
        <div className="flex items-center">
          <NotebookTabs className="m-2" /> Attendance Audit
        </div>
        <Popover
          open={isCalenderPopoverOpen}
          onOpenChange={setIsCalenderPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] px-3 text-left font-normal text-muted-foreground"
            >
              {format(date, "dd-MM-yyyy")}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(date)}
              onSelect={(date) => {
                const searchParams = new URLSearchParams({
                  date: format(date ?? new Date(), "yyyy-MM-dd"),
                  name,
                });
                router.push(`${pathname}?${searchParams.toString()}`);
                setIsCalenderPopoverOpen(false);
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          currentValue={totalIn}
          totalValue={totalEmployee}
          title="In now"
          Icon={<User />}
          currentValueColor="text-green-600"
          progressBarColor="bg-green-600"
        />
        <StatusCard
          currentValue={totalOut}
          totalValue={totalEmployee}
          title="Out now"
          Icon={<User />}
          currentValueColor="text-yellow-300"
          progressBarColor="bg-yellow-300"
        />
        <StatusCard
          currentValue={totalAbsent}
          totalValue={totalEmployee}
          title="Not logged in today"
          Icon={<TriangleAlert />}
          currentValueColor="text-red-600"
          progressBarColor="bg-red-600"
        />
        <StatusCard
          currentValue={totalEmployee}
          title="Employees"
          Icon={<Users />}
          currentValueColor="text-gray-400"
          progressBarColor="bg-gray-400"
        />
      </div>
    </div>
  );
}
