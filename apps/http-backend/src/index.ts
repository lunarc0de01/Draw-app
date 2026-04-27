import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import prismaClient from "@repo/db/client"
import { CreateUserSchema, SigninSchema, CreateRoomSchema, CreateChatSchema } from "@repo/common/types";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Invalid input"
        })
        return;
    }
    try {
        await prismaClient.user.create({
            data: {
                email: parsedData.data?.email,
                password: parsedData.data?.password,
                name: parsedData.data?.name,
            }
        })
        res.json({
            message: "User created"
        })
    } catch (e) {
        console.log(e);
        res.status(411).json({
            message: "User already exists"
        })
        return;
    }

})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Invalid Input"
        })
        return;
    }
    // add try catch here
    const user = await prismaClient.user.findUnique({
        where: {
            email: parsedData.data?.email,
            password: parsedData.data?.password
        }
    })
    if (user) {
        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET)

        res.status(200).json({
            token
        })
    } else {
        res.status(411).json({
            message: "Invalid username or password"
        })
    }
    return;
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Invalid Input"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })
        res.status(200).json({
            roomId: room.id
        })
    } catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.post("/chat", middleware, async (req, res) => {
    const parsedData = CreateChatSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Invalid Input"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const chat = await prismaClient.chat.create({
            data : {
                message: parsedData.data.message,
                roomId: parsedData.data.roomId,
                userId: userId
            }
        })
        res.status(200).json({
            chat: chat
        })
    } catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/room/:slug", middleware, async (req, res) => {

    const { slug } = req.params;
    try {
        const room = await prismaClient.room.findFirst({
            where: {
                id: Number(slug)
            },
            include: {
                chats: true
            }
        })
        if(!room) {
            return res.status(404).json({
                error: "Not found"
            })
        }
        res.json(room);
    } catch (e) {
        res.status(500).json({ error: "internal server error"})
    }
} )



app.listen(3001, () => {
    console.log("Server is running on port 3001");
})