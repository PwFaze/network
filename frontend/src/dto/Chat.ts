import { User } from "./User";
export interface Group {
  name: string;
  id: string;
  _id?: string;
  participants: User[];
}
export interface MessageDTO {
  id: string;
  _id?: string;
  sender: User;
  group?: Group;
  receiver?: User; // receiver
  content: string;
  timestamp: Date;
}
export type ChatTarget = Group | User;
