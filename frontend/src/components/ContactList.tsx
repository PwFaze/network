"use client";
import React, { useEffect, useState } from "react";
import { User } from "@/dto/User";
import { useChat } from "@/context/ChatProvider";
import { ChatTarget, Group } from "@/dto/Chat";
import CreateGroup from "@/components/CreateGroup";
import { createGroup } from "@/api/group";
import Avatar from './Avatar';
interface ContactListProps {
  view: "friends" | "groups";
  friends: User[];
  groups: Group[];
  selectedChat: ChatTarget | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatTarget | null>>;
}

export default function ContactList({
  view,
  friends,
  groups,
  selectedChat,
  setSelectedChat,
}: ContactListProps) {
  const [search, setSearch] = useState("");
  const [filteredFriends, setFilteredFriends] = useState(friends);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const { user } = useChat();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  useEffect(() => {
    if (view === "friends") {
      if (!friends) return;
      setFilteredFriends(
        friends.filter((friend: User) =>
          friend.username?.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    } else {
      if (!groups) return;
      setFilteredGroups(
        groups.filter((group) =>
          group.name?.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, view, groups, friends]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Please provide a group name and select at least one user.");
      return;
    }
    await createGroup(groupName, selectedUsers);
    setSelectedUsers([]);
    setGroupName("");
    setShowCreateGroup(false);
  };
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <div
      className={`${selectedChat ? "hidden md:flex" : "md:flex"} md:w-1/5 w-full bg-slate-100 border-x-2 border-gray-200 text-gray-800 p-6 md:pt-12 border-r  flex-col h-full`}
    >
      <h1 className="md:text-3xl text-xl text-gray-800 font-bold md:mb-8 mb-4">
        {view === "groups" ? "Groups" : "Chat"}
      </h1>

      {view === "groups" && (
        <button
          onClick={() => setShowCreateGroup(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
        >
          Create Group
        </button>
      )}

      <input
        type="text"
        placeholder={`Search ${view === "groups" ? "groups" : "friends"}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-600 text-sm placeholder:text-gray-400"
      />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {view === "groups"
          ? filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white md:py-2 py-4 px-4 rounded-xl cursor-pointer"
                onClick={() =>
                  setSelectedChat({
                    id: group.id,
                    participants: group.participants || [],
                    name: group.name,
                  })
                }
              >
                {group.name}
              </div>
            ))
          : filteredFriends?.map((friend, index) => {
              if (!user || friend.id === user.id) return null; // Use user from useChat

              return (
                <div
                  key={index}
                  className="bg-white py-2 px-4 h-fit rounded-md flex items-center gap-4 cursor-pointer"
                  onClick={() =>
                    setSelectedChat({
                      id: friend.id, // Use friend's ID
                      username: friend.username, // Use friend's username
                      socketId: friend.socketId,
                    })
                  }
                >
                  <Avatar username={friend.username} />
                  {/* Status Dot for users only */}
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: friend.socketId ? "green" : "grey",
                    }}
                  ></div>
                  {friend.username}
                </div>
              );
            })}
      </div>

      {(view === "groups" ? filteredGroups : (filteredFriends ?? [])).length ===
        0 && (
        <div className="text-center text-gray-500 mt-4">No matches found</div>
      )}
      {showCreateGroup && (
        <CreateGroup
          handleCreateGroup={handleCreateGroup}
          setShowCreateGroup={setShowCreateGroup}
          selectedUsers={selectedUsers}
          groupName={groupName}
          setGroupName={setGroupName}
          friends={friends}
          toggleUserSelection={toggleUserSelection}
        />
      )}
    </div>
  );
}
