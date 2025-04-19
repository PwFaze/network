import { User } from "./User";
export interface GroupChat {
  name: string;
  id: string;
  participants: {
    user: string;
    socket: string;
  }[];
}
export interface Message {
  id: string;
  sender: User;
  groupId?: string; // group
  receiver?: User; // receiver
  content: string;
  timestamp: Date;
}
export type ChatTarget = GroupChat | User;