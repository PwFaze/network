import React, { useState } from "react";
import { ChatTarget } from "./Chat";

interface ContactListProps {
  view: "friends" | "groups";
  friends: { name: string; isOnline: boolean }[];
  groups: { name: string }[];
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatTarget | null>>;
}

export default function ContactList({
  view,
  friends,
  groups,
  setSelectedChat,
}: ContactListProps) {
  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="md:w-1/5 w-full bg-slate-100 border-x-2 border-gray-200 text-gray-800 p-6 md:pt-12 border-r flex flex-col h-full">
      <h1 className="md:text-3xl text-xl text-gray-800 font-bold md:mb-8 mb-4">
        {view === "groups" ? "Groups" : "Chat"}
      </h1>

      <input
        type="text"
        placeholder={`Search ${view === "groups" ? "groups" : "friends"}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-600 text-sm placeholder:text-gray-400"
      />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {view === "groups"
          ? filteredGroups.map((group, index) => (
              <div
                key={index}
                className="bg-white md:py-2 py-4 px-4 rounded-xl cursor-pointer"
                onClick={() =>
                  setSelectedChat({
                    type: "group",
                    name: group.name,
                    isOnline: false,
                  })
                }
              >
                {group.name}
              </div>
            ))
          : filteredFriends.map((friend, index) => (
              <div
                key={index}
                className="bg-white py-2 px-4 h-fit rounded-md flex items-center gap-4 cursor-pointer"
                onClick={() =>
                  setSelectedChat({
                    type: "user",
                    name: friend.name,
                    isOnline: friend.isOnline,
                  })
                }
              >
                {/* Status Dot for users only */}
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: friend.isOnline ? "green" : "grey",
                  }}
                ></div>
                {friend.name}
              </div>
            ))}
      </div>

      {(view === "groups" ? filteredGroups : filteredFriends).length === 0 && (
        <div className="text-center text-gray-500 mt-4">No matches found</div>
      )}
    </div>
  );
}
