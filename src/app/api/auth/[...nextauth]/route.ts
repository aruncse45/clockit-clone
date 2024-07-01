import { ROOT, SIGN_IN } from "@/constants/routes";
import { authOptions } from "@/lib/authOptions";
import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest, res: NextResponse) => {
  if (req.url?.match(SIGN_IN)) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      redirect(ROOT);
    }
  }
  return NextAuth(authOptions)(req, res);
};

export { handler as GET, handler as POST };
