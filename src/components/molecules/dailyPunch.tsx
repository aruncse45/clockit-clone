import { type getUserDailyPunchInfo } from "@/utils/punch";
import { cookies } from "next/headers";
import RunningTimer from "./runningTimer";

export default async function DailyPunch() {
  let dailyPunchInfo: ReturnType<typeof getUserDailyPunchInfo> | null = null;
  let error: string | null = null;
  const cookieString = cookies().toString();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/punch`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieString,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error ?? response.statusText);
    }
    const result = await response.json();
    dailyPunchInfo = result.data;
  } catch (err) {
    console.error("Error fetching daily punch info:", err);
    error = err instanceof Error ? err.message : "An unexpected error occurred";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1>Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!dailyPunchInfo) {
    return <p>No punch information available.</p>;
  }

  return <RunningTimer {...dailyPunchInfo} />;
}
