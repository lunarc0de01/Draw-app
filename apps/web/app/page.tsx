"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className="text-white">
      <div className="flex justify-center">
        <div className="flex justify-center items-center flex-col mt-8 bg-navy-900 w-[40vw] rounded-md p-8">
          <div className="text-3xl mb-4">Enter Room</div>
          <div>
            <input
              className="bg-navy-700 border rounded-md px-3 py-2 focus:outline-none"
              type="text"
              onChange={(e) => {
                setRoomId(e.target.value);
              }}
            />
            <button
              className="bg-navy-1000 px-6 ml-2 py-2.5 text-white font-semibold rounded-lg shadow-md  focus:outline-none focus:ring-2  focus:ring-offset-2 transition-all active:scale-95"
              onClick={() => {
                router.push(`/room/${roomId}`);
              }}
            >
              Join room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
