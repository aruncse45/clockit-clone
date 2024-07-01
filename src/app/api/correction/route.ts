import { status } from "@/constants/httpResponseStatus";
import { db } from "@/db/db";
import {
  corrections,
  punchRecords,
  punchRecordsCorrections,
  users,
} from "@/db/schema";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { getCurrentUser } from "@/utils/user.server";
import { v4 as uuidv4 } from "uuid";
import {
  CORRECTION_ACTION,
  CORRECTION_STATUS,
  PUNCH_TYPE,
  ROLE,
} from "@/constants/enum";
import { format } from "date-fns";
import { and, asc, between, eq, inArray, ne, sql } from "drizzle-orm";

type punchRecordType = {
  punchId: string | undefined;
  punchTime: string;
  correctionAction: CORRECTION_ACTION.ADD | CORRECTION_ACTION.DELETE;
};

export async function POST(request: Request) {
  try {
    const {
      correctionDate,
      reason,
      punchRecords: punchRecordsData,
    } = await request.json();
    const auth = await isAuthenticated(request);
    const user = await getCurrentUser(auth.email);
    const userId = user?.id;
    if (!userId) {
      return auth.response;
    }
    await db.transaction(async (tx) => {
      // Check if any punch record with correctionAction "delete" does not have a punchId
      for (const punchRecord of punchRecordsData) {
        if (
          punchRecord.correctionAction === CORRECTION_ACTION.DELETE &&
          !punchRecord.punchId
        ) {
          throw new Error(
            `400: Punch record with correctionAction "delete" must have a punchId`
          );
        }
      }

      // Extract punchIds from the correction data
      const punchIds = punchRecordsData
        .filter((punch: punchRecordType) => punch.punchId !== undefined)
        .map((punch: punchRecordType) => punch.punchId);

      // Check if all punchIds exist in the database
      if (punchIds.length > 0) {
        const existingPunchRecords = await tx
          .select()
          .from(punchRecords)
          .where(inArray(punchRecords.id, punchIds));

        const existingPunchIds = existingPunchRecords.map((pr) => pr.id);

        // Find missing punchIds
        const missingPunchIds = punchIds.filter(
          (id: string) => !existingPunchIds.includes(id)
        );

        if (missingPunchIds.length > 0) {
          throw new Error(
            `404: Punch id(s) ${missingPunchIds.join(", ")} don't exist in database`
          );
        }
      }

      const pendingCorrection = await tx.query.corrections.findFirst({
        where: (corrections, { eq, and }) =>
          and(
            eq(corrections.userId, userId),
            eq(corrections.status, CORRECTION_STATUS.PENDING),
            eq(corrections.correctionDate, format(correctionDate, "yyyy-MM-dd"))
          ),
      });
      // update correction or insert
      const correctionId = pendingCorrection?.id || uuidv4();
      if (pendingCorrection) {
        await tx
          .update(corrections)
          .set({ reason: reason })
          .where(
            and(
              eq(corrections.id, correctionId),
              eq(corrections.userId, userId)
            )
          );
      } else {
        await tx.insert(corrections).values({
          id: correctionId,
          userId,
          correctionDate: format(new Date(correctionDate), "yyyy-MM-dd"),
          status: CORRECTION_STATUS.PENDING,
          reason,
          statusUpdatedBy: userId,
          statusUpdatedDate: new Date(),
        });
      }

      // Iterate through each punch record in the correction
      for (const punchRecord of punchRecordsData) {
        const { punchId, punchTime, correctionAction } = punchRecord;

        const punchRecordId = punchId || uuidv4();

        if (!punchId && correctionAction === CORRECTION_ACTION.ADD) {
          // If punchId is not provided, create a new punch record
          await tx.insert(punchRecords).values({
            id: punchRecordId,
            userId,
            punchTime: new Date(punchTime),
            type: PUNCH_TYPE.CORRECTION,
          });
        }

        if (correctionAction) {
          await tx
            .insert(punchRecordsCorrections)
            .values({
              punchRecordId: punchRecordId,
              correctionId: correctionId,
              action: correctionAction,
            })
            .onConflictDoUpdate({
              target: [
                punchRecordsCorrections.punchRecordId,
                punchRecordsCorrections.correctionId,
              ],
              set: { action: correctionAction },
            });
        } else {
          await tx
            .insert(punchRecordsCorrections)
            .values({
              punchRecordId: punchRecordId,
              correctionId: correctionId,
              action: correctionAction,
            })
            .onConflictDoNothing({
              target: [
                punchRecordsCorrections.punchRecordId,
                punchRecordsCorrections.correctionId,
              ],
            });
        }
      }
    });
    return Response.json(
      { message: "Correction request added." },
      { status: status.OK }
    );
  } catch (error) {
    console.error("Error in POST /api/punch:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return Response.json(
      { error: errorMessage },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { correctionIds, status } = await request.json();
    const auth = await isAuthenticated(request);
    const user = await getCurrentUser(auth.email);
    const userId = user?.id;
    if (!userId) {
      return auth.response;
    }

    if (
      status === CORRECTION_STATUS.APPROVED ||
      status === CORRECTION_STATUS.REJECTED
    ) {
      if (user?.role !== ROLE.ADMIN) {
        throw new Error(
          `401: role:${user?.role} is not allowed for approval or rejection.`
        );
      }
    }

    await db
      .update(corrections)
      .set({
        status: status,
        statusUpdatedDate: new Date(),
        statusUpdatedBy: userId,
      })
      .where(inArray(corrections.id, correctionIds));

    return Response.json(
      { message: "correction status updated." },
      { status: status.OK }
    );
  } catch (error) {
    console.error("Error in Patch /api/punch:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return Response.json(
      { error: errorMessage },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}

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

    const records = await db
      .select({
        user: users.fullName,
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
      .leftJoin(
        punchRecordsCorrections,
        sql`${punchRecords.id} = ${punchRecordsCorrections.punchRecordId}`
      )
      .leftJoin(
        corrections,
        sql`${corrections.id} = ${punchRecordsCorrections.correctionId}`
      )
      .leftJoin(users, sql`${users.id} = ${punchRecords.userId}`)
      .where(
        and(
          between(
            corrections.correctionDate,
            format(new Date(startTime), "yyyy-MM-dd"),
            format(new Date(endTime), "yyyy-MM-dd")
          ),
          ne(corrections.status, "cancel")
        )
      )
      .orderBy(asc(users.fullName));

    return Response.json(
      {
        data: { count: records.length, records },
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
