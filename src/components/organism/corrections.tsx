import { PunchCalendarPunchRecord } from "@/constants/type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CORRECTION_STATUS, ROLE } from "@/constants/enum";
import CorrectionList from "@/components/organism/CorrectionList";
import { Button } from "@/components/ui/button";
import { FilePen } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { correctionRequestApi } from "@/constants/apiPath";
import { toast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

type CorrectionsProp = {
  punchRecords: PunchCalendarPunchRecord[];
  cancelActionEnabled?: boolean;
  onUpdateCorrectionStatus?: () => void;
};

const Corrections = ({
  punchRecords,
  cancelActionEnabled = false,
  onUpdateCorrectionStatus,
}: CorrectionsProp) => {
  const session = useSession();
  const user = session?.data?.user;
  const [selectedCorrectionStatus, setSelectedCorrectionStatus] = useState(
    CORRECTION_STATUS.PENDING
  );
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isCorrectionStatusUpdating, setIsCorrectionStatusUpdating] =
    useState(false);
  const [selectedCorrectionsId, setSelectedCorrectionsId] = useState<string[]>(
    []
  );
  const correctionStatusArray: CORRECTION_STATUS[] = Object.values(
    CORRECTION_STATUS
  ).filter((status) => status !== CORRECTION_STATUS.CANCEL);

  const updateCorrectionStatus = async (status: CORRECTION_STATUS) => {
    setIsCorrectionStatusUpdating(true);
    const payload = {
      correctionIds: selectedCorrectionsId,
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
          description: `All Correction request ${status}`,
        });
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
    <Tabs
      defaultValue={selectedCorrectionStatus}
      className="flex h-[400px] flex-col gap-2 rounded bg-white p-4"
    >
      <div className="flex justify-between">
        <span className="flex gap-2 capitalize">
          <FilePen color="rgb(59, 130, 246)" /> Correction Requests
        </span>
        <TabsList className="self-end">
          {correctionStatusArray.map((correctionStatus, index) => (
            <TabsTrigger
              key={index}
              value={correctionStatus}
              className="uppercase"
              onClick={() => {
                setIsSelectAll(false);
                setSelectedCorrectionStatus(correctionStatus);
              }}
            >
              {correctionStatus}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {(selectedCorrectionStatus === CORRECTION_STATUS.PENDING ||
        selectedCorrectionStatus === CORRECTION_STATUS.APPROVED) && (
        <div className="flex gap-2 self-end">
          {!isCorrectionStatusUpdating ? (
            <>
              {user?.role === ROLE.ADMIN && (
                <>
                  {selectedCorrectionStatus !== CORRECTION_STATUS.APPROVED && (
                    <Button
                      className="h-8 uppercase text-green-500 shadow-md"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateCorrectionStatus(CORRECTION_STATUS.APPROVED)
                      }
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    className="h-8 uppercase text-yellow-500 shadow-md"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateCorrectionStatus(CORRECTION_STATUS.REJECTED)
                    }
                  >
                    Reject
                  </Button>
                </>
              )}
              {cancelActionEnabled &&
                selectedCorrectionStatus === CORRECTION_STATUS.PENDING && (
                  <Button
                    className="h-8 uppercase text-red-500 shadow-md"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateCorrectionStatus(CORRECTION_STATUS.CANCEL)
                    }
                  >
                    cancel
                  </Button>
                )}
              {(selectedCorrectionStatus === CORRECTION_STATUS.PENDING ||
                (user?.role === ROLE.ADMIN &&
                  selectedCorrectionStatus === CORRECTION_STATUS.APPROVED)) && (
                <>
                  <Button
                    className="h-8 uppercase text-blue-500 shadow-md"
                    variant="secondary"
                    onClick={() => setIsSelectAll(true)}
                  >
                    Select ALl
                  </Button>
                  <Button
                    className="h-8 uppercase text-yellow-500 shadow-md"
                    variant="secondary"
                    onClick={() => setIsSelectAll(false)}
                  >
                    clear selection
                  </Button>
                </>
              )}
            </>
          ) : (
            <Spinner size="small" />
          )}
        </div>
      )}
      {correctionStatusArray.map((correctionStatus, index) => (
        <TabsContent
          key={index}
          value={correctionStatus}
          className="overflow-auto p-0 uppercase"
        >
          <CorrectionList
            punchRecords={punchRecords}
            correctionStatus={correctionStatus}
            isSelectAll={isSelectAll}
            selectFeatureEnabled
            sendSelectedPunchRecordsId={(keys) =>
              setSelectedCorrectionsId(keys)
            }
            onUpdateCorrectionStatus={onUpdateCorrectionStatus}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default Corrections;
