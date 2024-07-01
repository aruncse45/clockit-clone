import { status } from "@/constants/httpResponseStatus";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { getCurrentUser } from "@/utils/user.server";

export async function GET(request: Request) {
  try {
    const auth = await isAuthenticated(request);
    const user = await getCurrentUser(auth.email);
    const userId = user?.id;

    if (!userId) {
      return auth.response;
    }

    return Response.json(
      {
        data: user,
      },
      { status: status.OK }
    );
  } catch (error) {
    console.error("Error in GET /api/user-details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return Response.json(
      { error: errorMessage },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
