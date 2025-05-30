import { UserDTO } from "./UserDTO";
export interface GroupChat {
  name: string;
  id: string;
  _id?: string;
  participants: UserDTO[];
}
export interface MessageDTO {
  id: string;
  sender: UserDTO;
  group?: GroupChat;
  receiver?: UserDTO; // receiver
  content: string;
  timestamp: Date;
  repliedMessage?: MessageDTO;
}
export type ChatTarget = GroupChat | UserDTO;
