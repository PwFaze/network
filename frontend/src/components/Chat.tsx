"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;
    socket.emit("chat message", message);
    setMessage("");
  };

  return (
    <div>
      <h1>Chat</h1>
      <ul>
        {chat.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          placeholder="Type something..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
