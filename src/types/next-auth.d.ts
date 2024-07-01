import { User } from "@/db/schema";
import { User as NextAuthUser } from "next-auth";

type SessionUser = Partial<NextAuthUser> & Partial<User>;

declare module "next-auth" {
  interface Session {
    user: SessionUser | null;
  }
}
