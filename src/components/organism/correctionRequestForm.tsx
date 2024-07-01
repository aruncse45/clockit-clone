"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FilePen, RotateCcw, Trash2 } from "lucide-react";
import { compareAsc, format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import TimePicker from "react-time-picker";
import { useState } from "react";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { correctionRequestApi } from "@/constants/apiPath";
import {
  CORRECTION_ACTION,
  CORRECTION_STATUS,
  PUNCH_STATUS,
  PUNCH_TYPE,
} from "@/constants/enum";
import { getMonthStartAndEndDate } from "@/utils/helper";
import CorrectionList from "@/components/organism/CorrectionList";
import { PunchCalendarPunchRecord } from "@/constants/type";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ExtendedPunchRecordType = {
  id: number;
  status?: PUNCH_STATUS;
  correctionAction?: string | null;
  isAdded?: boolean;
  isDeleted?: boolean;
} & Omit<PunchCalendarPunchRecord, "correctionAction">;

interface CorrectionRequestFormProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedDate: Date;
  selectedDatePunchRecords: PunchCalendarPunchRecord[];
  onSuccess: (start: string, end: string) => void;
}

const formSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  isPunchRecordModified: z.boolean().refine((val) => val === true, {
    message: "There should be at least one add or delete in  punch records",
  }),
});

const CorrectionRequestForm = ({
  isOpen,
  setIsOpen,
  selectedDate,
  selectedDatePunchRecords,
  onSuccess,
}: CorrectionRequestFormProps) => {
  const session = useSession();
  const { toast } = useToast();
  const [timeValue, setTimeValue] = useState<string>(
    format(new Date(), "HH:mm")
  );
  const hasCorrections = selectedDatePunchRecords.some(
    (punch) =>
      punch.correctionStatus === CORRECTION_STATUS.PENDING ||
      punch.correctionStatus === CORRECTION_STATUS.APPROVED ||
      punch.correctionStatus === CORRECTION_STATUS.REJECTED
  );
  const filterPunches = (punchRecords: PunchCalendarPunchRecord[]) => {
    const pendingAndApprovedPunchRecords = punchRecords.filter(
      (punch) =>
        punch.correctionStatus === CORRECTION_STATUS.PENDING ||
        punch.correctionStatus === CORRECTION_STATUS.APPROVED
    );
    let validPunchRecords = [];
    if (pendingAndApprovedPunchRecords.length > 0) {
      const sortedPunchRecords = pendingAndApprovedPunchRecords.sort(
        (punchA, punchB) =>
          new Date(punchB.correctionCreatedAt!).getTime() -
          new Date(punchA.correctionCreatedAt!).getTime()
      );
      const latestCorrectionId = sortedPunchRecords[0].correctionId;
      if (
        sortedPunchRecords[0]?.correctionStatus === CORRECTION_STATUS.PENDING
      ) {
        validPunchRecords = pendingAndApprovedPunchRecords.filter(
          (punch) => punch.correctionId === latestCorrectionId
        );
      } else {
        validPunchRecords = pendingAndApprovedPunchRecords.filter(
          (punch) =>
            punch.correctionId === latestCorrectionId &&
            (!punch.correctionAction ||
              punch.correctionAction === CORRECTION_ACTION.ADD)
        );
      }
    } else {
      validPunchRecords = punchRecords.filter(
        (punch) => punch.type === PUNCH_TYPE.SYSTEM
      );
    }
    return validPunchRecords;
  };

  const filteredPunchRecords = filterPunches(selectedDatePunchRecords);
  const derivedPunchRecords = filteredPunchRecords.map(
    (punch: PunchCalendarPunchRecord, index: number) => {
      const derivedItem: ExtendedPunchRecordType = {
        ...punch,
        id: index + 1,
      };
      return derivedItem;
    }
  );

  const updatePunchStatus = (punchRecords: ExtendedPunchRecordType[]) => {
    let lastPunchStatus: string = "";
    punchRecords.forEach((punch) => {
      if (
        punch.correctionStatus === CORRECTION_STATUS.PENDING &&
        punch.correctionAction === CORRECTION_ACTION.DELETE
      ) {
        return;
      } else {
        if (lastPunchStatus === PUNCH_STATUS.IN) {
          punch.status = PUNCH_STATUS.OUT;
          lastPunchStatus = PUNCH_STATUS.OUT;
        } else {
          punch.status = PUNCH_STATUS.IN;
          lastPunchStatus = PUNCH_STATUS.IN;
        }
      }
    });
  };
  updatePunchStatus(derivedPunchRecords);

  const [punchRecords, setPunchRecords] = useState<ExtendedPunchRecordType[]>(
    structuredClone(derivedPunchRecords)
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid, isSubmitting },
    trigger,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "", isPunchRecordModified: false },
  });

  const isDuplicatePunchTime = (punchTime: string) => {
    const newHour = new Date(punchTime).getUTCHours();
    const newMinute = new Date(punchTime).getUTCMinutes();
    const isDuplicate = punchRecords
      .filter(
        (punch) =>
          !punch.isDeleted &&
          !(
            punch.correctionStatus === CORRECTION_STATUS.PENDING &&
            punch.correctionAction === CORRECTION_ACTION.DELETE
          )
      )
      .some((punch) => {
        const existingHour = new Date(punch.punchTime).getUTCHours();
        const existingMinute = new Date(punch.punchTime).getUTCMinutes();
        return existingHour === newHour && existingMinute === newMinute;
      });
    return isDuplicate;
  };

  const handleAddPunch = async () => {
    const [h, m] = timeValue.split(":");
    const ms = new Date(selectedDate).setHours(Number(h), Number(m));
    const newPunchTime = new Date(ms);
    const newPunch = {
      id: punchRecords.length + 1,
      punchTime: newPunchTime.toISOString(),
      correctionAction: CORRECTION_ACTION.ADD,
      isAdded: true,
    };

    if (!isDuplicatePunchTime(newPunch.punchTime)) {
      const updatedRecords = [...punchRecords, newPunch].sort(
        (punchA, punchB) =>
          compareAsc(
            parseISO(new Date(punchA.punchTime).toISOString()),
            parseISO(new Date(punchB.punchTime).toISOString())
          )
      );
      setValue("isPunchRecordModified", true);
      await trigger("isPunchRecordModified");
      updatePunchStatus(updatedRecords as ExtendedPunchRecordType[]);
      setPunchRecords(updatedRecords as ExtendedPunchRecordType[]);
    } else {
      toast({
        title: "Duplicate!",
        variant: "destructive",
        description:
          "Duplicate punch not allowed! Please create a unique punch.",
      });
    }
  };

  const handleDeletePunch = async (itemId: number) => {
    const updatedPunchRecords = punchRecords.filter((punch) => {
      if (itemId === punch.id) {
        if (punch?.isAdded) {
          return false;
        } else {
          punch.isDeleted = true;
          punch.correctionAction = CORRECTION_ACTION.DELETE;
          return true;
        }
      }
      return true;
    });
    const isPunchRecordsModified = updatedPunchRecords.some(
      (punch) => punch?.isAdded || punch?.isDeleted
    );
    setValue("isPunchRecordModified", isPunchRecordsModified);
    await trigger("isPunchRecordModified");
    updatePunchStatus(updatedPunchRecords);
    setPunchRecords(updatedPunchRecords);
  };

  const handleRestorePunch = async (itemId: number) => {
    const updatedRecords = punchRecords.map((punch) => {
      if (itemId === punch.id) {
        if (!isDuplicatePunchTime(new Date(punch.punchTime).toISOString())) {
          punch.isAdded = true;
          punch.correctionAction = CORRECTION_ACTION.ADD;
        } else {
          toast({
            title: "Duplicate!",
            variant: "destructive",
            description:
              "Duplicate punch not allowed! Please create a unique punch.",
          });
        }
      }
      return punch;
    });

    setValue("isPunchRecordModified", true);
    await trigger("isPunchRecordModified");
    updatePunchStatus(updatedRecords);
    setPunchRecords(updatedRecords);
  };

  const onSuccessUpdateCalenderData = () => {
    const { monthStartDay, monthEndDay } = getMonthStartAndEndDate(
      new Date(selectedDate)
    );
    onSuccess(monthStartDay, monthEndDay);
    setIsOpen(false);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const updatedPunchRecords = punchRecords.map((punch) => ({
      punchId: punch?.punchId,
      punchTime: punch.punchTime,
      correctionAction: punch?.isAdded
        ? CORRECTION_ACTION.ADD
        : punch?.isDeleted
          ? CORRECTION_ACTION.DELETE
          : null,
    }));

    const payload = {
      correctionDate: new Date(selectedDate),
      reason: data.reason,
      punchRecords: updatedPunchRecords,
    };
    try {
      const res = await fetch(correctionRequestApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok && res.status === 200) {
        toast({
          title: "Success!",
          description: "Correction request success",
        });
        onSuccessUpdateCalenderData();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Correction request Error",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[98%] max-w-[600px] overflow-y-scroll px-0">
        <DialogHeader className="px-6">
          <DialogTitle className="flex justify-between">
            <span>{session?.data?.user?.name}</span>
            <span className="mr-4">{format(selectedDate, "MMMM d, yyyy")}</span>
          </DialogTitle>
        </DialogHeader>
        {hasCorrections && (
          <div className="mx-4 mt-2 flex flex-col gap-y-2">
            <span className="flex gap-2 capitalize">
              <FilePen color="rgb(59, 130, 246)" /> Correction Requests
            </span>
            <CorrectionList
              onUpdateCorrectionStatus={onSuccessUpdateCalenderData}
              punchRecords={selectedDatePunchRecords}
              classNames="p-2"
            />
          </div>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-y-8 overflow-y-auto px-4 py-4"
        >
          <div>
            <span className="mb-2 block capitalize">
              Punches<span className="text-red-600">*</span>
            </span>
            <Table className="bg-white shadow-lg">
              <TableHeader>
                <TableRow className="capitalize">
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="w-[220px]">Punch Time</TableHead>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead className="w-[50px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="w-[220px] text-gray-800">
                {punchRecords
                  .filter((record) => !record.isDeleted)
                  .map((punchRecord, index) => (
                    <TableRow key={punchRecord.id}>
                      <TableCell className="w-[50px]">{index + 1}</TableCell>
                      <TableCell className="flex items-center gap-x-2">
                        {(punchRecord.correctionStatus ===
                          CORRECTION_STATUS.PENDING &&
                          punchRecord?.correctionAction) ===
                          CORRECTION_ACTION.ADD || punchRecord?.isAdded ? (
                          <Badge className="w-fit rounded-sm bg-green-500 uppercase">
                            {format(punchRecord.punchTime, "hh:mm a")}
                          </Badge>
                        ) : (punchRecord.correctionStatus ===
                            CORRECTION_STATUS.PENDING &&
                            punchRecord?.correctionAction ===
                              CORRECTION_ACTION.DELETE) ||
                          punchRecord?.isDeleted ? (
                          <Badge className="w-fit rounded-sm bg-red-500 uppercase">
                            {format(punchRecord.punchTime, "hh:mm a")}
                          </Badge>
                        ) : (
                          <Badge className="w-fit rounded-sm bg-gray-400 uppercase">
                            {format(punchRecord.punchTime, "hh:mm a")}
                          </Badge>
                        )}

                        <div className="flex flex-col gap-1">
                          {punchRecord?.correctionStatus ===
                          CORRECTION_STATUS.PENDING ? (
                            <Badge className="mr-2 w-fit rounded-sm bg-blue-500 uppercase">
                              {punchRecord?.correctionStatus}
                            </Badge>
                          ) : punchRecord?.correctionStatus ===
                            CORRECTION_STATUS.APPROVED ? (
                            <Badge className="mr-2 w-fit rounded-sm bg-green-600 uppercase">
                              Corrected
                            </Badge>
                          ) : null}
                          {punchRecord?.isAdded && (
                            <Badge className="mr-2 rounded-sm bg-gray-500 uppercase">
                              Correction
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[50px]">
                        {punchRecord?.status && (
                          <Badge
                            className={cn(
                              `${punchRecord?.status === PUNCH_STATUS.OUT ? "bg-yellow-500" : "bg-green-600"}`,
                              "mr-2 rounded-sm uppercase"
                            )}
                          >
                            {punchRecord?.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="flex justify-center gap-y-2">
                        {punchRecord?.status ? (
                          <Trash2
                            color="red"
                            size={20}
                            className="cursor-pointer"
                            onClick={() => handleDeletePunch(punchRecord.id)}
                            aria-disabled={isSubmitting}
                          />
                        ) : (
                          <RotateCcw
                            color="black"
                            size={20}
                            className="cursor-pointer"
                            onClick={() => handleRestorePunch(punchRecord.id)}
                            aria-disabled={isSubmitting}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {punchRecords.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center capitalize text-gray-300"
                    >
                      No Punch Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex">
            <TimePicker
              onChange={(time) => {
                time && setTimeValue(time);
              }}
              value={timeValue}
              isOpen={false}
              className="h-[40px] !flex-1 [&>div]:rounded-[6px] [&>div]:rounded-r-none [&>div]:border-border [&>div]:bg-white [&>div]:pl-2 [&>select]:focus-visible:outline-none"
              disableClock
              autoFocus={false}
              format="hh:mm a"
            />
            <Button
              className="rounded-l-none bg-primary uppercase"
              onClick={handleAddPunch}
              type="button"
              disabled={isSubmitting}
            >
              add punch
            </Button>
          </div>
          <div className="grid w-full gap-1.5">
            <span>
              Reason<span className="text-red-600">*</span>
            </span>
            <Textarea
              placeholder="Type your message here."
              className="bg-white"
              {...register("reason")}
            />
          </div>
          <DialogFooter>
            <Button
              className="uppercase shadow-lg"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              close
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="min-w-[193px] bg-primary uppercase"
            >
              {!isSubmitting ? (
                "request correction"
              ) : (
                <Spinner size="small" className="text-white" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CorrectionRequestForm;
