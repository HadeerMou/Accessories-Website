import { Router } from "express";
import { login, register } from "./auth.service.js";
import { requireAuth, type AuthRequest } from "./auth.middleware.js";
export const authRouter = Router();
authRouter.post("/register", async (req, res, next) => { try { res.status(201).json({ data: await register(req.body) }); } catch (e) { next(e); } });
authRouter.post("/login", async (req, res, next) => { try { res.json({ data: await login(req.body.email, req.body.password) }); } catch (e) { next(e); } });
authRouter.get("/me", requireAuth, (req, res) => res.json({ data: (req as AuthRequest).auth }));
