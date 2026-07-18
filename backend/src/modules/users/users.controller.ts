import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "./users.service.js";

function handle(error: unknown, response: Response, next: NextFunction) {
  if (error instanceof HttpError) return response.status(error.status).json({ error: error.message });
  next(error);
}

function routeParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== "string") throw new HttpError(400, `Invalid ${name}`);
  return value;
}

export async function getUsers(request: Request, response: Response, next: NextFunction) {
  try {
    const role = request.query.role as string | undefined;
    if (role && !Object.values(UserRole).includes(role as UserRole)) throw new HttpError(400, "Invalid user role");
    response.json(await listUsers({
      page: Number(request.query.page ?? 1),
      limit: Number(request.query.limit ?? 10),
      role: role as UserRole | undefined,
      search: request.query.search as string | undefined,
    }));
  } catch (error) { handle(error, response, next); }
}

export async function getUserById(request: Request, response: Response, next: NextFunction) {
  try { response.json({ data: await getUser(routeParam(request.params.userId, "user id")) }); }
  catch (error) { handle(error, response, next); }
}

export async function postUser(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.body.role && !Object.values(UserRole).includes(request.body.role)) throw new HttpError(400, "Invalid user role");
    response.status(201).json({ data: await createUser(request.body) });
  }
  catch (error) { handle(error, response, next); }
}

export async function putUser(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.body.role && !Object.values(UserRole).includes(request.body.role)) throw new HttpError(400, "Invalid user role");
    response.json({ data: await updateUser(routeParam(request.params.userId, "user id"), request.body) });
  }
  catch (error) { handle(error, response, next); }
}

export async function removeUser(request: Request, response: Response, next: NextFunction) {
  try { await deleteUser(routeParam(request.params.userId, "user id")); response.status(204).send(); }
  catch (error) { handle(error, response, next); }
}
