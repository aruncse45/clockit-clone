import { status } from "@/constants/httpResponseStatus";
import { db } from "@/db/db";
import {
  corrections,
  punchRecords,
  punchRecordsCorrections,
  users,
} from "@/db/schema";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { format } from "date-fns";
import { and, asc, between, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const auth = await isAuthenticated(request);
    if (!auth.email) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get("start_time") as string;
    let endTime =
      (searchParams.get("end_time") as string) ??
      format(startTime, "yyyy-MM-dd 23:59:59");

    const usersFromDb = await db
      .select()
      .from(users)
      .where(eq(users.email, auth.email));

    const punchRecordList = await db
      .select({
        punchTime: punchRecords.punchTime,
        punchId: punchRecords.id,
        type: punchRecords.type,
        correctionId: corrections.id,
        correctionStatus: corrections.status,
        correctionReason: corrections.reason,
        correctionDate: corrections.correctionDate,
        correctionStatusUpdatedAt: corrections.statusUpdatedDate,
        correctionCreatedAt: corrections.createdAt,
        correctionAction: punchRecordsCorrections.action,
      })
      .from(punchRecords)
      .where(
        and(
          eq(punchRecords.userId, usersFromDb[0].id),
          between(
            punchRecords.punchTime,
            new Date(startTime),
            new Date(endTime)
          )
        )
      )
      .leftJoin(
        punchRecordsCorrections,
        eq(punchRecordsCorrections.punchRecordId, punchRecords.id)
      )
      .leftJoin(
        corrections,
        eq(punchRecordsCorrections.correctionId, corrections.id)
      )
      .orderBy(asc(punchRecords.punchTime));

    return Response.json(
      {
        punch_records: punchRecordList,
      },
      { status: status.OK }
    );
  } catch (error) {
    return Response.json(
      {
        error: error,
      },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
