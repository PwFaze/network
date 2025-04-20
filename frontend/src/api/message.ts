import axios from "axios";
import { MessageDTO } from "@/dto/Chat";

export const getMessageByUserId = async (userId: string): Promise<{ messages: MessageDTO[] }> => {
  try {
    const response = await axios.get<{ messages: MessageDTO[] }>(
      `http://localhost:4000/api/messages/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages");
    throw error;
  }
};