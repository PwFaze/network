"use client";

import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { GrGroup, GrLogout } from "react-icons/gr";
import { useChat } from "@/context/ChatProvider";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";

interface SidebarProps {
  view: string;
  setView: React.Dispatch<React.SetStateAction<"friends" | "groups">>;
}

export default function Sidebar({ view, setView }: SidebarProps) {
  const { user } = useChat();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Or render a skeleton UI
  return (
    <div className="md:w-1/12 w-full bg-white text-gray-800 flex md:flex-col justify-between md:justify-start p-4 px-8 md:pt-8 md:gap-12 md:items-center">
      {user?.username ? (
        <Avatar
          username={user.username}
          className="w-10 h-10 md:w-20 md:h-20 text-[10px] md:text-xl"
        />
      ) : (
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
      )}
      <button onClick={() => setView("friends")}>
        <IoChatbubbleEllipsesOutline
          className={`md:text-3xl text-2xl cursor-pointer  ${
            view != "friends" ? "opacity-50" : ""
          }`}
        />
      </button>
      <button onClick={() => setView("groups")}>
        <GrGroup
          className={`md:text-3xl text-2xl cursor-pointer ${
            view != "groups" ? "opacity-50" : ""
          }`}
        />
      </button>
      <button
        onClick={() => {
          localStorage.clear();
          router.push("/");
        }}
      >
        <GrLogout
          className={`md:text-3xl text-2xl cursor-pointer ${
            view != "groups" ? "opacity-50" : ""
          }`}
        />
      </button>
    </div>
  );
}
