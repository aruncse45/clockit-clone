import { db } from "@/db/db";

export async function getCurrentUser(email?: string) {
  if (!email) return null;
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });

  return user;
}
