import { status } from "@/constants/httpResponseStatus";
import { db } from "@/db/db";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { getCurrentUser } from "@/utils/user.server";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const auth = await isAuthenticated(request);
    const user = await getCurrentUser(auth.email);
    const userId = user?.id;

    if (!userId) {
      return auth.response;
    }
    const { searchParams } = new URL(request.url);
    const date = format(searchParams.get("date") ?? new Date(), "yyyy-MM-dd");
    const name = searchParams.get("name") ?? "";

    const userRecords = await db.query.users.findMany({
      with: {
        punchRecords: {
          where: (punchRecords, { eq, sql, and }) =>
            and(eq(sql`DATE(${punchRecords.punchTime})`, date)),
          orderBy: (punchRecords, { asc }) => asc(punchRecords.punchTime),
        },
      },
    });

    let totalIn = 0;
    let totalOut = 0;
    let employees = [];

    for (const record of userRecords) {
      const punchRecords = record.punchRecords.filter(
        (punchRecord) => punchRecord.type === "system"
      );

      if (punchRecords.length > 0) {
        const lastIndex = punchRecords.length - 1;
        if (lastIndex % 2 === 0) {
          employees.push({
            id: record.id,
            name: record.fullName,
            department: null,
            status: ["Present", "In"],
            lastPunchAt: punchRecords[lastIndex].punchTime,
          });
          totalIn += 1;
        } else {
          employees.push({
            id: record.id,
            name: record.fullName,
            department: null,
            status: ["Present", "Out"],
            lastPunchAt: punchRecords[lastIndex].punchTime,
          });
          totalOut += 1;
        }
      } else {
        employees.push({
          id: record.id,
          name: record.fullName,
          department: null,
          status: ["Absent", "Out"],
          lastPunchAt: null,
        });
      }
    }

    const totalEmployee = userRecords.length;
    const totalAbsent = totalEmployee - totalIn - totalOut;
    return Response.json(
      {
        data: {
          totalIn,
          totalOut,
          totalAbsent,
          totalEmployee,
          employees: employees.filter((user) =>
            user?.name?.toLowerCase().includes(name.toLowerCase())
          ),
        },
      },
      { status: status.OK }
    );
  } catch (error) {
    console.error("Error in GET /api/punch/audit:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return Response.json(
      { error: errorMessage },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
