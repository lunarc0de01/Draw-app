import axios from "axios";
import { BACKEND_URL } from "@repo/backend-common/config";
import ChatRoom from "../../components/ChatRoom";

export default async function RoomId({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  // import the room data from the backend.
  // the chats and the room

  const roomId = (await params).roomId;
  const room = await axios.get(BACKEND_URL + "room/" + roomId, {
    headers: {
      Authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYWU5NTVkYy0yNzk5LTQ0NmUtYmMzZi05N2I1ZGVjMGU0MDYiLCJpYXQiOjE3NzY4NDI3NDN9.GcJT3J1f_15LEJY4R4b6gxkBhYnluLU7DckkOEK1U4I",
    },
  });
  const currentUserId = "cae955dc-2799-446e-bc3f-97b5dec0e406";

  return (
    <div className="h-screen items-center text-white flex flex-col">
      <div className="flex flex-col justify-center mt-8 bg-gray-700 w-[40vw] h-[85vh] rounded-md p-8">
        <div className="text-center p-4 text-3xl">{room.data.slug}</div>

        <ChatRoom
          initialChats={room.data.chats}
          currentUserId={currentUserId}
          roomId={roomId}
        />
      </div>
    </div>
  );
}
