"use server";

import { ROOT } from "@/constants/routes";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createPunch() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/punch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({ type: "system" }),
    });

    revalidatePath(ROOT);
    return { error: null };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create punch. Something went wrong";
    return { error: message };
  }
}
