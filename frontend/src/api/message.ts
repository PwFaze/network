import axios from "axios";
export const getMessageByUserId = async (userId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:4000/api/messages/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages");
    throw error;
  }
};
