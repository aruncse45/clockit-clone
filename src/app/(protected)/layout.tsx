import React from "react";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SIGN_IN } from "@/constants/routes";
import Header from "@/components/layout/header/header";
import { SessionProvider } from "@/lib/sessionProvider";
import DailyPunch from "@/components/molecules/dailyPunch";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(SIGN_IN);
  }

  return (
    <SessionProvider session={session}>
      <Header>
        <DailyPunch />
      </Header>
      {children}
    </SessionProvider>
  );
}
