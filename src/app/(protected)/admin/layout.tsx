import React from "react";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ROOT, SIGN_IN } from "@/constants/routes";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(SIGN_IN);
  }

  if (session?.user?.role !== "admin") {
    redirect(ROOT);
  }

  return <>{children}</>;
}
