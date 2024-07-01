"use client";

import { PunchText } from "@/constants/punch";
import { Button } from "../ui/button";
import { useFormState, useFormStatus } from "react-dom";
import { createPunch } from "@/app/actions";
import { memo } from "react";

function PunchForm({ nextAction }: { nextAction: PunchText }) {
  const [state, formAction] = useFormState(createPunch, {
    error: null,
  });

  return (
    <form action={formAction}>
      <PunchButton nextAction={nextAction} />
      {state.error && (
        <span className="ml-5 border border-black text-red-500">
          {state.error ?? "An unexpected error occurred. Please try again."}
        </span>
      )}
    </form>
  );
}

export default memo(PunchForm);

function PunchButton({ nextAction }: { nextAction: PunchText }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      className={`rounded text-sm shadow ${nextAction === PunchText.PUNCHED_IN ? "text-gray-700" : "bg-red-200 text-red-800"} h-9 w-[135px] px-4 py-2`}
      disabled={pending}
    >
      {nextAction.toUpperCase()}
    </Button>
  );
}
