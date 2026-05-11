export type GroupType = "COMMUNITY" | "STUDY";
export type GroupStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DELETED";

export interface GroupRow {
  id: number;
  name: string;
  type: GroupType;
  subjectName: string;
  termName: string;
  createdBy: string;
  ownerName?: string;
  members: string;
  status: GroupStatus;
  createdAt: string;
}
