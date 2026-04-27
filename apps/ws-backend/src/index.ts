import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config"
import { BACKEND_URL } from '@repo/backend-common/config';
import prismaClient from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface DecodedToken {
    userId: string;
}

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];


wss.on('connection', function connection(ws, request) {
    const url = request.url;

    if (!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    if (!token) {
        ws.send("token not provided")
        ws.close();
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        if (!decoded || !decoded.userId) {
            ws.close();
            return;
        }

        const userId = decoded.userId;

        ws.on('message', async function message(data) {
            const message = data.toString();
            const parsedData = message ? JSON.parse(message) : {};
            if (parsedData) {
                if (parsedData.type == "join") {
                    const room = parsedData.room;
                    const user = users.find((users) => users.userId == userId);
                    if (user) {
                        if (!user.rooms.includes(room)) {
                            user.rooms.push(room);
                            ws.send(JSON.stringify({ message: "joined", room: room }))
                        } else {
                            ws.send(JSON.stringify({ message: "already_joined", room: room }))
                        }
                    } else {
                        users.push({
                            ws,
                            rooms: [room],
                            userId: userId
                        })
                        ws.send(JSON.stringify({ message: "joined", room: room }))
                    }
                } else if (parsedData.type == "leave") {
                    const room = parsedData.room;
                    const user = users.find((users) => users.userId == userId);
                    if (user) {
                        user.rooms = user.rooms.filter((r) => r != room);
                        ws.send(JSON.stringify({ message: "left", room: room }))
                    } else {
                        ws.send(JSON.stringify({ message: "not_joined", room: room }))
                    }
                } else if (parsedData.type == "send") {
                    // add the chats in db
                    try {
                        const chat = await prismaClient.chat.create({
                            data : {
                                message: parsedData.message,
                                roomId: Number(parsedData.room),
                                userId: userId
                            }
                        })

                        const usersInRoom = users.filter((user) => user.rooms.includes(parsedData.room));
                        usersInRoom.forEach((user) => {
                            if (user.userId != userId) {
                                user.ws.send(JSON.stringify(parsedData.message));
                            }
                        })
                    } catch (e) {   
                        console.log(e)
                        ws.send(JSON.stringify({
                            type: "error",
                            "message": "failed to send chat"
                        }))
                    }
                } else if(parsedData.event == "ping") {
                    ws.send("pong");
                }
            }
        });
    } catch (e) {
        ws.send("Invalid token");
        ws.close();
        return;
    }
});
