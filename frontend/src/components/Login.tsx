"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthSchema } from "@/dto/User";
import { loginUser, registerUser } from "@/api/user";
import { useChat } from "@/context/ChatProvider";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const { setUser, joinChat, socket } = useChat();
  const { handleSubmit, register } = useForm<AuthSchema>();
  const [mode, setMode] = useState<"login" | "register">("login");

  const onSubmit = async (data: AuthSchema) => {
    const { username, password } = data;

    if (mode === "register") {
      const data = await registerUser(username, password);
      if (data?.user) {
        const userId = data.user._id;
        localStorage.setItem("token", data.token);
        setUser({ ...data.user, id: userId });
        joinChat({
          username: username,
          id: userId,
          socketId: socket?.id ?? "",
        });
        router.push("/chat");
      } else {
        toast.error("Registration failed");
      }
    } else {
      const data = await loginUser(username, password);
      if (data.user) {
        const userId = data.user._id;
        localStorage.setItem("token", data.token);
        setUser({ ...data.user, id: userId });
        joinChat({
          username: username,
          id: userId,
          socketId: socket?.id ?? "",
        });
        router.push("/chat");
      } else {
        toast.error("Login failed");
      }
    }
  };
  return (
    <div className="absolute z-50 h-full inset-0 flex flex-col items-center text-black justify-center bg-white bg-opacity-90 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded shadow-md p-6">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setMode("register")}
            className={`px-4 py-2 rounded-tl rounded-tr ${
              mode === "register"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-tl rounded-tr ${
              mode === "login"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Login
          </button>
        </div>

        {mode === "register" && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-2xl mb-4 text-center text-black">Register</h2>
            <input
              placeholder="Username"
              {...register("username")}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white w-full px-4 py-2 rounded hover:bg-blue-600"
            >
              Register
            </button>
          </form>
        )}

        {mode === "login" && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-2xl mb-4 text-center text-black">Login</h2>
            <input
              placeholder="Username"
              {...register("username")}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white w-full px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
