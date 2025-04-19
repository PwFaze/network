export interface UserDTO {
  id: string;
  username: string;
  socketId?: string;
  friends?: string[];
}
