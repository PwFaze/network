export interface User {
  id: string;
  _id?: string;
  username: string;
  socketId?: string;
  friends?: string[];
}

export interface AuthSchema {
  username: string;
  password: string;
}
