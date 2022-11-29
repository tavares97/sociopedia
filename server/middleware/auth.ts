import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let token = req.header("Authorization");
    if (!token) return res.status(403).send("Access Denied");

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimStart();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req["user"] = verified;

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
