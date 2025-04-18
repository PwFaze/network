import React, { useEffect, useState } from "react";
import { User } from "@/dto/User";
import { useChat } from "@/hooks/useChat";
import { ChatTarget } from "@/dto/Chat";
interface ContactListProps {
  view: "friends" | "groups";
  friends: User[];
  groups: any[];
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatTarget | null>>;
}

export default function ContactList({
  view,
  friends,
  groups,
  setSelectedChat,
}: ContactListProps) {
  const [search, setSearch] = useState("");
  const [filteredFriends, setFilteredFriends] = useState(friends);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const { user } = useChat();

  const [showCreateGroup, setShowCreateGroup] = useState(false); // Toggle for group creation modal
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]); // Selected users for the group
  const [groupName, setGroupName] = useState(""); // Group name

  useEffect(() => {
    if (view === "friends") {
      if (!friends) return;
      setFilteredFriends(
        friends.filter((friend: User) =>
          friend.username.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    } else {
      if (!groups) return;
      setFilteredGroups(
        groups.filter((group) =>
          group.chatName.toLowerCase().includes(search.toLowerCase()),
        ),
      );
      console.log("groups (in contact list)", groups);
      console.log("filteredGroups", filteredGroups);
    }
  }, [search, friends, groups, view]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Please provide a group name and select at least one user.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          participants: selectedUsers.map((user) => user.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Group created successfully:", data);
        setShowCreateGroup(false); // Close the modal
        setGroupName(""); // Reset group name
        setSelectedUsers([]); // Reset selected users
      } else {
        console.error("Failed to create group:", await response.text());
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <div className="md:w-1/5 w-full bg-slate-100 border-x-2 border-gray-200 text-gray-800 p-6 md:pt-12 border-r flex flex-col h-full">
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
          ? filteredGroups.map((group, index) => (
              <div
                key={group._id}
                className="bg-white md:py-2 py-4 px-4 rounded-xl cursor-pointer"
                onClick={() =>
                  setSelectedChat({
                    id: group._id,
                    participants: group.participants || [],
                    name: group.chatName,
                  })
                }
              >
                {group.chatName}
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
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Select Users:</h3>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {friends.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleUserSelection(user)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.some((u) => u.id === user.id)}
                      readOnly
                    />
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}