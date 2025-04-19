import { User } from "@/dto/User";
import axios from "axios";

export const createGroup = async (groupName: string, selectedUsers: User[]) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/api/groups",
      {
        name: groupName,
        participants: selectedUsers.map((user) => user.id),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 200) {
      const data = response.data;
      console.log("Group created successfully:", data);
    } else {
      console.error("Failed to create group:", response.data);
    }
  } catch (error) {
    console.error("Error creating group:", error);
  }
};
