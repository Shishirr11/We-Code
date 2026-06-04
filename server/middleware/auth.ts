import { Request, Response, NextFunction } from "express";
import { getCredentials } from "../services/userService";

export const attachCredentials = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.body;
  const credit = username ? await getCredentials(username) : undefined;
  req.body.credits = credit ?? { csrfToken: "", session: "" };
  next();
};