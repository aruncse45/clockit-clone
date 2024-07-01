import { CorrectionType, PunchCalendarPunchRecord } from "@/constants/type";
import { CORRECTION_STATUS } from "@/constants/enum";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import Correction from "@/components/molecules/correction";

type CorrectionListProp = {
  punchRecords: PunchCalendarPunchRecord[];
  onUpdateCorrectionStatus?: () => void;
  correctionStatus?: CORRECTION_STATUS;
  classNames?: string;
  selectFeatureEnabled?: boolean;
  isSelectAll?: boolean;
  sendSelectedPunchRecordsId?: (keys: string[]) => void;
};

type CheckedItem = { [key: string]: boolean };

const CorrectionList = ({
  punchRecords,
  onUpdateCorrectionStatus,
  correctionStatus,
  classNames,
  selectFeatureEnabled = false,
  isSelectAll,
  sendSelectedPunchRecordsId,
}: CorrectionListProp) => {
  const [selectedCorrections, setSelectedCorrections] = useState<CheckedItem>(
    {}
  );

  const validPunchRecords = punchRecords.filter(
    (punch) => punch.correctionStatus !== CORRECTION_STATUS.CANCEL
  );

  const punchRecordsWithCorrectionId = validPunchRecords.filter(
    (punch) => punch.correctionId
  );

  let uniqueCorrectionIds;
  if (correctionStatus) {
    const punchRecordsOfGivenCorrectionStatus =
      punchRecordsWithCorrectionId.filter(
        (punch) => punch.correctionStatus === correctionStatus
      );
    uniqueCorrectionIds = [
      ...new Set(
        punchRecordsOfGivenCorrectionStatus.map((punch) => punch.correctionId)
      ),
    ];
  } else {
    uniqueCorrectionIds = [
      ...new Set(
        punchRecordsWithCorrectionId.map((punch) => punch.correctionId)
      ),
    ];
  }

  const Corrections: CorrectionType[] = uniqueCorrectionIds
    .map((correctionId) => {
      const punchRecords = validPunchRecords.filter(
        (punch) => punch.correctionId === correctionId
      );
      return {
        correctionId: punchRecords[0]?.correctionId!,
        correctionStatus: punchRecords[0]?.correctionStatus!,
        correctionReason: punchRecords[0]?.correctionReason!,
        correctionDate: punchRecords[0]?.correctionDate!,
        correctionStatusUpdatedAt: punchRecords[0]?.correctionStatusUpdatedAt!,
        correctionCreatedAt: punchRecords[0]?.correctionCreatedAt!,
        username: punchRecords[0]?.user,
        punchRecords: punchRecords,
      };
    })
    .sort(
      (correctionA, correctionB) =>
        new Date(correctionB.correctionDate!).getTime() -
          new Date(correctionA.correctionDate!).getTime() ||
        new Date(correctionB.correctionCreatedAt).getTime() -
          new Date(correctionA.correctionCreatedAt).getTime()
    );

  const handleCheckboxChange = (id: string) => {
    setSelectedCorrections((prev) => {
      const newState = { ...prev };
      if (newState[id]) {
        delete newState[id];
      } else {
        newState[id] = true;
      }
      return newState;
    });
  };

  const selectAll = () => {
    const newCheckedItems = Corrections.reduce(
      (acc: { [key: string]: boolean }, item) => {
        acc[item.correctionId] = true;
        return acc;
      },
      {}
    );
    setSelectedCorrections(newCheckedItems);
  };

  const clearAll = () => {
    setSelectedCorrections({});
  };

  useEffect(() => {
    if (isSelectAll) {
      selectAll();
    } else {
      clearAll();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectAll]);

  useEffect(() => {
    const keys = Object.keys(selectedCorrections);
    sendSelectedPunchRecordsId?.(keys);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCorrections]);

  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "flex h-full w-full flex-col gap-y-3 rounded bg-white",
        classNames
      )}
    >
      {Corrections.length > 0 ? (
        <>
          {Corrections.map((correction) => {
            return (
              <Correction
                key={correction.correctionId}
                correction={correction}
                selectFeatureEnabled={selectFeatureEnabled}
                handleCheckboxChange={handleCheckboxChange}
                isSelected={!!selectedCorrections[correction.correctionId]}
                onUpdateCorrectionStatus={onUpdateCorrectionStatus}
              />
            );
          })}
        </>
      ) : (
        <div className=" fon flex h-full items-center justify-center self-center text-3xl capitalize text-gray-200">{`No ${correctionStatus} requests available`}</div>
      )}
    </Accordion>
  );
};

export default CorrectionList;
