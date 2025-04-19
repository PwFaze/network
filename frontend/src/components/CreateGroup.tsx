import { User } from "@/dto/User";

interface CreateGroupProps {
  handleCreateGroup: () => void;
  setShowCreateGroup: (show: boolean) => void;
  selectedUsers: User[];
  groupName: string;
  setGroupName: (name: string) => void;
  friends: User[];
  toggleUserSelection: (user: User) => void;
}

export default function CreateGroup({
  handleCreateGroup,
  setShowCreateGroup,
  selectedUsers,
  groupName,
  setGroupName,
  friends,
  toggleUserSelection,
}: CreateGroupProps) {
  return (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
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
  );
}
