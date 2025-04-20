import { User } from "./User";
export interface Group {
  name: string;
  id: string;
  participants: User[];
}
export interface MessageDTO {
  id: string;
  sender: User;
  group?: Group;
  receiver?: User; // receiver
  content: string;
  timestamp: Date;
  repliedMessage?: MessageDTO;
}
export type ChatTarget = Group | User;
