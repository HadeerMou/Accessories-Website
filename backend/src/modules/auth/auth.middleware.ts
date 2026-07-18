import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import { parseToken } from "./auth.service.js";
export type AuthRequest = Request & { auth?: ReturnType<typeof parseToken> };
export function requireAuth(req: Request, _res: Response, next: NextFunction) { try { const header = req.headers.authorization; if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Authentication required"); (req as AuthRequest).auth = parseToken(header.slice(7)); next(); } catch (error) { next(error); } }
export function requireAdmin(req: Request, _res: Response, next: NextFunction) { try { if ((req as AuthRequest).auth?.role !== UserRole.ADMIN) throw new HttpError(403, "Administrator access required"); next(); } catch (error) { next(error); } }
