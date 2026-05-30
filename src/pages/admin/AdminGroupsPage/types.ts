import { title } from "process";
import {
  AdminGroupStatus,
  AdminGroupType,
} from "../../../services/GroupService";

export type GroupType = "COMMUNITY" | "STUDY";
export type GroupStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DELETED";

export interface GroupRow {
  id: number;
  name: string;
  type: GroupType;
  subjectName: string;
  memberCount: number;
  status: GroupStatus;
  createdAt: string;
}

export interface GroupStats {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface FilterGroup {
  title: string;
  type: AdminGroupType | null;
  status: AdminGroupStatus | null;
  keyword: string | null;
}
