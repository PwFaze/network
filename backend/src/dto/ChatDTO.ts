import { User } from "./UserDTO";
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
  senderId: User;
  groupId?: string; // ID of the group chat (if it's a group message)
  receiver?: User; // receiver
  content: string;
  timestamp: Date;
}
export type ChatTarget = GroupChat | User;
