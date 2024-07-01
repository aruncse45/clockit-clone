import { CORRECTION_STATUS } from "@/constants/enum";

export type PunchCalendarPunchRecord = {
  punchTime: Date;
  punchId: string;
  type: string | null;
  correctionId: string | null;
  correctionStatus: CORRECTION_STATUS | null;
  correctionReason: string;
  correctionDate: string | null;
  correctionCreatedAt: string | null;
  correctionStatusUpdatedAt: Date | null;
  user?: string;
  correctionAction: string | null;
};

export type CorrectionType = {
  correctionId: string;
  correctionStatus: CORRECTION_STATUS;
  correctionReason: string;
  correctionDate: string;
  correctionStatusUpdatedAt: Date | null;
  correctionCreatedAt: string;
  username?: string;
  punchRecords: PunchCalendarPunchRecord[];
};
