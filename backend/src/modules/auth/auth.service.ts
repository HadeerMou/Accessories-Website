import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { UsersRepository } from "../users/users.repository.js";
import { createUser, verifyPassword } from "../users/users.service.js";
import type { CreateUserInput } from "../users/users.types.js";

const users = new UsersRepository();
type Claims = { sub: string; role: "ADMIN" | "CUSTOMER"; email: string; exp: number };
const encode = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64url");
const sign = (value: string) => createHmac("sha256", env.authSecret).update(value).digest("base64url");
export function issueToken(user: { id: string; role: "ADMIN" | "CUSTOMER"; email: string }) { const body = encode({ sub: user.id, role: user.role, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }); return `${body}.${sign(body)}`; }
export function parseToken(token: string): Claims {
  const parts = token.split(".");
  if (parts.length !== 2) throw new HttpError(401, "Invalid access token");
  const [body, signature] = parts;
  if (!body || !signature) throw new HttpError(401, "Invalid access token");
  const expected = sign(body);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new HttpError(401, "Invalid access token");
  let claims: unknown;
  try { claims = JSON.parse(Buffer.from(body, "base64url").toString()); } catch { throw new HttpError(401, "Invalid access token"); }
  if (!claims || typeof claims !== "object") throw new HttpError(401, "Invalid access token");
  const value = claims as Partial<Claims>;
  if (typeof value.sub !== "string" || typeof value.email !== "string" || (value.role !== "ADMIN" && value.role !== "CUSTOMER") || typeof value.exp !== "number") throw new HttpError(401, "Invalid access token");
  if (value.exp < Date.now() / 1000) throw new HttpError(401, "Access token expired");
  return value as Claims;
}
export async function register(input: CreateUserInput) { const user = await createUser({ ...input, role: "CUSTOMER" }); return { user, accessToken: issueToken(user) }; }
export async function login(email: unknown, password: unknown) { if (typeof email !== "string" || typeof password !== "string") throw new HttpError(400, "email and password are required"); const user = await users.findCredentials(email.trim().toLowerCase()); if (!user || !(await verifyPassword(password, user.password))) throw new HttpError(401, "Invalid email or password"); const { password: _password, ...safeUser } = user; return { user: safeUser, accessToken: issueToken(user) }; }
