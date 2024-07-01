import { Checkbox } from "@/components/ui/checkbox";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CORRECTION_ACTION, CORRECTION_STATUS, ROLE } from "@/constants/enum";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CorrectionType } from "@/constants/type";
import { correctionRequestApi } from "@/constants/apiPath";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { memo, useState } from "react";

type CorrectionPropsType = {
  correction: CorrectionType;
  selectFeatureEnabled?: boolean;
  handleCheckboxChange?: (id: string) => void;
  isSelected?: boolean;
  onUpdateCorrectionStatus?: () => void;
};

const Correction = ({
  correction,
  selectFeatureEnabled,
  handleCheckboxChange,
  isSelected,
  onUpdateCorrectionStatus,
}: CorrectionPropsType) => {
  const session = useSession();
  const user = session?.data?.user;
  const [isCorrectionStatusUpdating, setIsCorrectionStatusUpdating] =
    useState(false);

  const updateCorrectionStatus = async (
    correctionId: string,
    status: CORRECTION_STATUS
  ) => {
    setIsCorrectionStatusUpdating(true);
    const payload = {
      correctionIds: [correctionId],
      status,
    };
    try {
      const response = await fetch(correctionRequestApi, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok && response.status === 200) {
        toast({
          title: "Done",
          description: `Correction request ${status}`,
        });
        onUpdateCorrectionStatus?.();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Correction request Error",
      });
    } finally {
      setIsCorrectionStatusUpdating(false);
    }
  };

  return (
    <AccordionItem
      key={correction.correctionId!}
      value={correction.correctionId!}
      className="rounded bg-background px-2"
    >
      <div className="flex items-center gap-4">
        {selectFeatureEnabled && (
          <Checkbox
            id={correction.correctionId}
            checked={isSelected}
            onClick={() => handleCheckboxChange?.(correction?.correctionId!)}
          />
        )}
        <AccordionTrigger className="flex hover:no-underline">
          <div className="flex items-center gap-4">
            <div className="align flex flex-col items-start gap-1">
              {correction?.username && (
                <span className="whitespace-nowrap">
                  {correction?.username}
                </span>
              )}
              <span className="whitespace-nowrap">
                {format(correction.correctionDate!, "MMMM d, yyyy")}
              </span>
              <Badge
                className={cn(
                  `${correction.correctionStatus === CORRECTION_STATUS.PENDING && "bg-blue-500"}`,
                  `${correction.correctionStatus === CORRECTION_STATUS.APPROVED && "bg-green-600"}`,
                  `${correction.correctionStatus === CORRECTION_STATUS.REJECTED && "bg-red-500"}`,
                  "w-fit rounded-sm uppercase"
                )}
              >
                {correction.correctionStatus}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {correction.punchRecords.map((punchRecord, index) => {
                return (
                  <Badge
                    key={index}
                    className={cn(
                      `${punchRecord.correctionAction === CORRECTION_ACTION.ADD ? "bg-green-500" : punchRecord.correctionAction === CORRECTION_ACTION.DELETE ? "bg-red-500" : "bg-gray-400"}`,
                      "h-[20px] w-[58px] rounded-sm p-1 text-[10px] uppercase"
                    )}
                  >
                    {format(punchRecord.punchTime, "hh:mm aa")}
                  </Badge>
                );
              })}
            </div>
          </div>
        </AccordionTrigger>
      </div>
      <AccordionContent className="flex flex-col gap-y-2">
        <div className="flex justify-between">
          <span className="text-blue-700">
            {correction?.username || user?.name}
          </span>
          <span className="text-blue-700">
            Created At:{" "}
            <span className="text-black">
              {format(correction.correctionCreatedAt!, "MMM d, yyyy hh:mm aa")}
            </span>
          </span>
        </div>
        <div className="flex flex-col rounded bg-yellow-100 p-2">
          <span className="text-blue-700">Reason:</span>
          {correction.correctionReason}
        </div>
        {correction.correctionStatus === CORRECTION_STATUS.PENDING && (
          <div className="flex gap-2">
            {!isCorrectionStatusUpdating ? (
              <>
                {user?.role === ROLE.USER && (
                  <Button
                    className="h-8 uppercase text-red-500 shadow-md"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateCorrectionStatus(
                        correction.correctionId!,
                        CORRECTION_STATUS.CANCEL
                      )
                    }
                  >
                    Cancel
                  </Button>
                )}
                {user?.role === ROLE.ADMIN && (
                  <>
                    <Button
                      className="h-8 uppercase text-green-500 shadow-md"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateCorrectionStatus(
                          correction.correctionId!,
                          CORRECTION_STATUS.APPROVED
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      className="h-8 uppercase text-yellow-500 shadow-md"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateCorrectionStatus(
                          correction.correctionId!,
                          CORRECTION_STATUS.REJECTED
                        )
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Spinner size="small" />
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default memo(Correction);
