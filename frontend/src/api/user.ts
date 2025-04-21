import axios from "axios";
import { Group } from "@/dto/Chat";

// Get groups for a specific user
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}api/groups/${userId}`
    );
    if (response.status === 200 && response.data.success) {
      return response.data.groups;
    }
    return [];
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return [];
  }
};

// Register a new user
export const registerUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}api/auth/register`,
      { username, password },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.status === 200 ? response.data.data : null;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};

// Log in a user
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}api/auth/login`,
      { username, password },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

// Leave a group
export const leaveGroup = async (
  groupId: string,
  userId: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}api/groups/leave`,
      { groupId, userId },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.status === 200 && response.data.success;
  } catch (error) {
    console.error("Error leaving group:", error);
    return false;
  }
};
