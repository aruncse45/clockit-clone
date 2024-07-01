import { ROOT } from "@/constants/routes";
import { getCurrentUser } from "@/utils/user.server";
import { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signOut: ROOT,
  },
  callbacks: {
    async session({ session }: { session: Session }): Promise<Session> {
      const userEmail = session?.user?.email;
      if (userEmail) {
        const currentUser = await getCurrentUser(userEmail);
        session.user = {
          ...currentUser,
          image: session?.user?.image,
          name: session?.user?.name,
        };
        return session;
      }
      session.user = null;
      return session;
    },
  },
};
