import React from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { GrGroup } from "react-icons/gr";
import { useChat } from "@/hooks/useChat";

interface SidebarProps {
  view: string;
  setView: React.Dispatch<React.SetStateAction<"friends" | "groups">>;
}

export default function Sidebar({ view, setView }: SidebarProps) {
  const { user } = useChat();
  return (
    <div className="md:w-1/12 w-full bg-white text-gray-800 flex md:flex-col justify-between md:justify-start p-4 px-8 md:pt-8 md:gap-12 md:items-center">
      <div className="md:w-20 w-10 md:h-20 h-10 rounded-full bg-sky-600 flex items-center justify-center shadow-md">
        <h1 className="md:text-xl text-sm font-bold text-white">
          {user.username}
        </h1>
      </div>
      <button onClick={() => setView("friends")}>
        <IoChatbubbleEllipsesOutline
          className={`md:text-3xl text-2xl cursor-pointer  ${view != "friends" ? "opacity-50" : ""}`}
        />
      </button>
      <button onClick={() => setView("groups")}>
        <GrGroup
          className={`md:text-3xl text-2xl cursor-pointer ${view != "groups" ? "opacity-50" : ""}`}
        />
      </button>
    </div>
  );
}
