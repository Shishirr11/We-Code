import { Router, Request, Response } from "express";
import { registerUser, isSessionTokenValid, getCredentials } from "../services/userService";

const authRoutes = Router();

authRoutes.post("/connect", async (req: Request, res: Response) => {
  const { csrfToken, session } = req.body;
  if (!csrfToken || !session) {
    res.status(400).json({ error: "csrfToken and session are required" });
    return;
  }
  const result = await registerUser(csrfToken, session);
  if ("error" in result) {
    res.status(401).json(result);
    return;
  }
  res.json(result);
});

authRoutes.post("/validate", async (req: Request, res: Response) => {
  const { username, sessionToken } = req.body;
  if (!username || !sessionToken) {
    res.json(false);
    return;
  }
  const tokenValid = isSessionTokenValid(username, sessionToken);
  if (!tokenValid) {
    res.json(false);
    return;
  }
  // Check credentials exist on disk (don't do live health check on every page load)
  const creds = getCredentials(username);
  res.json(!!creds);
});

export default authRoutes;
