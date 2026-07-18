import { Router } from "express";
import { getUserById, getUsers, postUser, putUser, removeUser } from "./users.controller.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);
usersRouter.get("/", getUsers);
usersRouter.post("/", postUser);
usersRouter.get("/:userId", getUserById);
usersRouter.put("/:userId", putUser);
usersRouter.delete("/:userId", removeUser);
