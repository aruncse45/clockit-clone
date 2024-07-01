import { status } from "@/constants/httpResponseStatus";
import { db } from "@/db/db";
import { punchRecords } from "@/db/schema";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { getUserDailyPunchInfo } from "@/utils/punch";
import { getCurrentUser } from "@/utils/user.server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    const auth = await isAuthenticated(request);
    const user = await getCurrentUser(auth.email);
    const userId = user?.id;
    if (!userId) {
      return auth.response;
    }
    const punch = await db
      .insert(punchRecords)
      .values({
        id: uuidv4(),
        userId,
        type,
      })
      .returning();
    return Response.json(punch, { status: status.OK });
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

export async function GET(request: Request) {
  try {
    const auth = await isAuthenticated(request);
    const user = await getCurrentUser(auth.email);
    const userId = user?.id;

    if (!userId) {
      return auth.response;
    }
    const date = new Date().toISOString().split("T")[0];
    const records = await db.query.punchRecords.findMany({
      where: (punchRecords, { eq, and, sql }) =>
        and(
          eq(punchRecords.userId, userId),
          sql`DATE(${punchRecords.punchTime}) = ${date}`
        ),
    });

    return Response.json(
      {
        data: { ...getUserDailyPunchInfo(records) },
      },
      { status: status.OK }
    );
  } catch (error) {
    console.error("Error in GET /api/punch:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return Response.json(
      { error: errorMessage },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
