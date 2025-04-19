import axios from "axios";

export const getUserGroups = async (userId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:4000/api/groups/${userId}`,
    );
    const data = response.data;
    return response.status === 200 ? data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const registerUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      `http://localhost:4000/api/auth/register`,
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log(response);
    return response.status === 200 ? response.data.data : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      `http://localhost:4000/api/auth/login`,
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = response.data.data;
    return response.data.success ? data : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
