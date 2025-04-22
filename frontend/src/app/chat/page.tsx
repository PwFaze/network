import Chat from "@/components/Chat";
import { useChat } from "@/context/ChatProvider";
export default function Home() {
  const { user } = useChat();
  console.log("user connected", user);
  return (
    <div>
      <Chat />
    </div>
  );
}
