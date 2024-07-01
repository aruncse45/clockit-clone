import { PUNCH_TYPE } from "@/constants/enum";

export type PunchRecordType = {
  punchTime: string;
  punchId: string;
  type: PUNCH_TYPE;
  correctionStatus: string | null;
  correctionDate: string | null;
  correctionStatusUpdatedAt: Date | null;
  correctionAction?: string | null;
  isAdded?: boolean;
  isDeleted?: boolean;
};
