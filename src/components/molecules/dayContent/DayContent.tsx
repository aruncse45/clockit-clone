import {
  CORRECTION_ACTION,
  CORRECTION_STATUS,
  PUNCH_TYPE,
} from "@/constants/enum";
import { PunchCalendarPunchRecord } from "@/constants/type";
import { convertHoursToTimeFormat, getUserDailyPunchInfo } from "@/utils/punch";
import { format } from "date-fns";
import { DayContentProps as DayContentDefaultProps } from "react-day-picker";

type DayContentProps = {
  punchRecords?: PunchCalendarPunchRecord[];
} & DayContentDefaultProps;

function DayContent(props: DayContentProps) {
  const { date, activeModifiers, punchRecords } = props;

  // initially we will only calculate the system provided punch time
  let actualPunchRecords = punchRecords?.filter(
    (punch) => punch.type == PUNCH_TYPE.SYSTEM
  );

  const isApprovedCorrectionPunchExists = punchRecords?.some(
    (punch) => punch.correctionStatus === CORRECTION_STATUS.APPROVED
  );

  const isPendingCorrectionExists = punchRecords?.some(
    (punch) => punch.correctionStatus == CORRECTION_STATUS.PENDING
  );

  // if approved correction request exists we will take those punch time which has the latest corresponding correctionApprovedAt
  if (isApprovedCorrectionPunchExists) {
    const latestApprovedDate = punchRecords
      ?.filter(
        (punch) =>
          punch.correctionStatus === CORRECTION_STATUS.APPROVED &&
          punch.correctionAction == CORRECTION_ACTION.ADD
      )
      .sort((punchA, punchB) => {
        if (
          punchA.correctionStatusUpdatedAt! > punchB.correctionStatusUpdatedAt!
        ) {
          return -1;
        } else {
          return 1;
        }
      })[0].correctionStatusUpdatedAt;

    actualPunchRecords = punchRecords?.filter(
      (punch) => punch.correctionStatusUpdatedAt === latestApprovedDate
    );
  }

  let totalInTime = 0;
  let totalBreakTime = 0;

  if (actualPunchRecords?.length) {
    const { totalPunchInTime, totalPunchOutTime } = getUserDailyPunchInfo(
      actualPunchRecords!
    );
    totalInTime = totalPunchInTime;
    totalBreakTime = totalPunchOutTime;
  }

  const day = date.getDate().toString();

  return (
    <div className="h-full w-full">
      <p className="pr-2 text-right text-xl">{day}</p>
      {!activeModifiers.outside ? (
        <div className="p-[2px] text-[10px] font-semibold text-white [&_p]:rounded-sm [&_p]:px-[8px] [&_p]:py-[4px]">
          {actualPunchRecords?.length && (
            <>
              <p className="mb-[2px] bg-green-600">
                {/* IN TIME */}
                {"IN: " +
                  (actualPunchRecords?.length
                    ? format(actualPunchRecords![0].punchTime, "hh:mm:ss a")
                    : "not available")}
                <br /> {/* OUT TIME */}
                {"OUT: " +
                  (actualPunchRecords!.length > 1
                    ? format(
                        actualPunchRecords![actualPunchRecords!.length - 1]
                          .punchTime,
                        "hh:mm:ss a"
                      )
                    : "not available")}
              </p>
              <p className="mb-[2px] bg-sky-700">
                B: {convertHoursToTimeFormat(totalBreakTime)}
              </p>
              <p className="mb-[2px] bg-fuchsia-600">
                D: {convertHoursToTimeFormat(totalInTime)}
              </p>
              {isApprovedCorrectionPunchExists && (
                <p className="bg-stone-800">Correction Approved</p>
              )}
            </>
          )}
          {isPendingCorrectionExists && (
            <p className="mt-[2px] bg-stone-400">Correction Pending</p>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default DayContent;
