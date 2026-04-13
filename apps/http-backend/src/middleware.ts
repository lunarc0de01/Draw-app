import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] ?? "";

    if (!token) {
        res.status(411).json({
            message: "Empty token"
        })
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // @ts-ignore: TODO fix this
        req.userId = decoded.userId;
        next();
    } catch (e) {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}