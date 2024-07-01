import AttendanceAudit from "@/components/organism/attendanceAudit";
import EmployeeDetails from "@/components/organism/employeeDetails";
import { format } from "date-fns";
import { cookies } from "next/headers";

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string };
}) {
  let punchAuditInfo = {
    totalIn: 0,
    totalOut: 0,
    totalAbsent: 0,
    totalEmployee: 0,
    employees: [],
  };
  let error: string | null = null;
  const cookieString = cookies().toString();
  const date = format(new Date(searchParams?.date ?? new Date()), "yyyy-MM-dd");
  const name = searchParams?.name ?? "";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/punch/audit?date=${date}&name=${name}`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieString,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error ?? response.statusText);
    }
    const result = await response.json();
    punchAuditInfo = result.data;
  } catch (err) {
    console.error("Error fetching daily punch info:", err);
    error = err instanceof Error ? err.message : "An unexpected error occurred";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1>Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const { employees, ...rest } = punchAuditInfo;
  return (
    <main className="flex flex-col gap-y-8">
      <AttendanceAudit {...rest} />
      <EmployeeDetails employees={employees} />
    </main>
  );
}
