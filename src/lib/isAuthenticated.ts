import { status } from "@/constants/httpResponseStatus";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { OAuth2Client } from "google-auth-library";

export async function isAuthenticated(request: Request): Promise<{
  email?: string;
  response?: Response;
}> {
  let userEmail = null;
  const idToken = request.headers.get("Authorization");

  if (idToken) {
    userEmail = await verifyIdToken(idToken);
    if (!userEmail || !isMonstarLabEmail(userEmail)) {
      return {
        response: Response.json(
          { error: "Unauthorized" },
          { status: status.UNAUTHORIZED }
        ),
      };
    }
  } else {
    userEmail = (await getServerSession(authOptions))?.user?.email;
    if (!userEmail) {
      return {
        response: Response.json(
          { error: "Unauthorized" },
          { status: status.UNAUTHORIZED }
        ),
      };
    }
  }

  return { email: userEmail };
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: [
      process.env.GOOGLE_CLIENT_ID ?? "",
      process.env.EXPO_PUBLIC_IOS_CLIENT_ID ?? "",
      process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID ?? "",
    ],
  });
  const payload = ticket.getPayload();
  const email = payload?.email;
  return email;
}

function isMonstarLabEmail(email?: string) {
  return email?.endsWith("monstar-lab.com");
}
