"use client";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import type { ReactNode } from "react";

type HeaderProps = {
  children?: ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  const session = useSession();

  return (
    <nav className="flex flex-col items-center gap-y-4 bg-background py-4">
      <div className="flex w-full items-center justify-between">
        <Link className="text-3xl text-blue-700" href="/">
          Monstarlog
        </Link>
        <div className="sm: hidden lg:block">{children}</div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={session?.data?.user?.image ?? ""}
                alt="Profile"
              />
              <AvatarFallback>
                {session?.data?.user?.name?.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href={"/correction-request"}>Correction Request</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut()}
              asChild
            >
              <Link href="#">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:block lg:hidden">{children}</div>
    </nav>
  );
};

export default Header;
