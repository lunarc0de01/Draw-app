"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "@repo/backend-common/config";

export default function ChatRoom({
  roomId,
  currentUserId,
  initialChats,
}: {
  roomId: string;
  currentUserId: string;
  initialChats: {
    message: string;
    userId: string;
    id: number;
  }[];
}) {
  const [chats, setChats] = useState(initialChats);
  const [message, setMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYWU5NTVkYy0yNzk5LTQ0NmUtYmMzZi05N2I1ZGVjMGU0MDYiLCJpYXQiOjE3NzY4NDI3NDN9.GcJT3J1f_15LEJY4R4b6gxkBhYnluLU7DckkOEK1U4I";
    const ws = new WebSocket(WS_URL + `?token=${token}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", room: roomId }));

      ws.onmessage = (event) => {
        //handle messages
      };
      wsRef.current = ws;

      return () => {
        ws.close();
      };
    };
  }, [roomId]);
  return (
    <>
      <div className="flex-1 gap-2 flex flex-col overflow-y-auto p-4">
        {chats.map((chat) => (
          <span
            className={
              (chat.userId === currentUserId ? "self-end " : "self-start ") +
              "bg-slate-600 rounded-lg px-3 py-2 max-w-[70%]"
            }
            key={chat.id}
          >
            {chat.message}
          </span>
        ))}
      </div>
      <div className="p-4 flex gap-2">
        <div className="sm:col-span-4">
          <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
            <input
              id="chatMessage"
              name="chatBox"
              type="text"
              placeholder="message"
              value={message}
              className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
              onChange={(e) => {
                const currentInputValue = e.target.value;
                setMessage(currentInputValue);
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={(e) => {
            if (message) {
              wsRef.current?.send(
                JSON.stringify({
                  type: "send",
                  room: roomId,
                  message: message,
                }),
              );
              setChats((prev) => [
                ...prev,
                {
                  message,
                  userId: currentUserId,
                  id: Date.now(),
                },
              ]);
            } else {
              // focus input element
            }
            setMessage("");
          }}
        >
          Send
        </button>
      </div>
    </>
  );
}
