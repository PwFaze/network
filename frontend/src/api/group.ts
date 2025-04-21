import { User } from "@/dto/User";
import { Socket } from "socket.io-client";
import axios from "axios";

export const createGroup = async (groupName: string, selectedUsers: User[]) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}api/groups`,
      {
        name: groupName,
        participants: selectedUsers.map((user) => user.id),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 201) {
      const data = response.data;
      console.log("Group created successfully:", data);
    } else {
      console.error("Failed to create group:", response.data);
    }
  } catch (error) {
    console.error("Error creating group:", error);
  }
};

export const leaveGroup = async (groupId: string, userId: string) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}api/groups/${groupId}/leave/${userId}`
    );
    return response.data.success;
  } catch (error) {
    console.error("Error leaving group:", error);
    return false;
  }
};

export const groupUpdated = (
  socket: Socket | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any[]) => void
) => {
  if (!socket) return;
  socket.on("groupUpdated", callback);
};
