"use client";
import { BookUser, X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const EmployeeDetails = ({ employees }: { employees: any[] }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const date = searchParams.get("date");
  const searchQuery = searchParams.get("name");
  const [search, setSearch] = useState(searchQuery ?? "");
  return (
    <div className="flex flex-col gap-y-3">
      <div className="sticky top-0 z-[1] flex items-center justify-between bg-white px-2 py-2 text-2xl text-gray-500">
        <div className="flex items-center">
          <BookUser className="mr-1" /> Employee details
        </div>
        <Input
          value={search}
          className="w-[240px] self-center"
          placeholder="Search employee"
          icon={
            search ? (
              <X
                size={16}
                onClick={() => {
                  setSearch("");
                  const searchParams = new URLSearchParams({
                    date: format(date ?? new Date(), "yyyy-MM-dd"),
                  });
                  router.push(`${pathname}?${searchParams.toString()}`);
                }}
              />
            ) : (
              <Search size={16} />
            )
          }
          iconPosition="right"
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const searchParams = new URLSearchParams({
                date: format(date ?? new Date(), "yyyy-MM-dd"),
                name: search,
              });
              router.push(`${pathname}?${searchParams.toString()}`);
            }
          }}
        />
      </div>
      <Table className="bg-white shadow-lg">
        <TableHeader className="sticky top-[3.5rem] z-[1] bg-white">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Punch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-gray-800">
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.department ?? "N/A"}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    `${employee.status.includes("Present") ? "bg-green-600" : "bg-red-500"}`,
                    "mr-2 rounded-sm uppercase"
                  )}
                >
                  {employee.status[0].toUpperCase()}
                </Badge>
                <Badge
                  className={cn(
                    `${employee.status.includes("In") ? "bg-green-600" : "bg-red-500"}`,
                    "mt-2 rounded-sm uppercase"
                  )}
                >
                  {employee.status[1].toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="flex flex-col gap-y-2">
                <Badge
                  className={cn(
                    `${!employee.lastPunchAt ? "bg-gray-400" : "bg-yellow-500"}`,
                    "w-fit rounded-sm uppercase"
                  )}
                >
                  {employee.lastPunchAt
                    ? format(new Date(employee.lastPunchAt), "PPpp")
                    : "N/A"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeDetails;
