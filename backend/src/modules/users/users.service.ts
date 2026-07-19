import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { UserRole } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import { UsersRepository } from "./users.repository.js";
import type { CreateUserInput, UpdateUserInput, UserFilters } from "./users.types.js";

const scrypt = promisify(scryptCallback);
const repository = new UsersRepository();

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  if (!/^[a-f\d]{128}$/i.test(hash)) return false;
  const stored = Buffer.from(hash, "hex");
  const supplied = (await scrypt(password, salt, stored.length)) as Buffer;
  return timingSafeEqual(stored, supplied);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validatePassword(password: string) {
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");
}

export async function listUsers(filters: UserFilters) {
  const page = Number.isFinite(filters.page) && filters.page > 0 ? Math.floor(filters.page) : 1;
  const limit = Number.isFinite(filters.limit) && filters.limit > 0 ? Math.min(Math.floor(filters.limit), 50) : 10;
  const result = await repository.list({ ...filters, page, limit, search: filters.search?.trim() || undefined });
  return { ...result, page, limit, pages: Math.ceil(result.total / limit) };
}

export async function getUser(id: string) {
  const user = await repository.findById(id);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export async function createUser(input: CreateUserInput) {
  if (!input.fullName?.trim() || !input.email?.trim() || !input.password) {
    throw new HttpError(400, "fullName, email, and password are required");
  }
  validatePassword(input.password);
  const email = normalizeEmail(input.email);
  if (await repository.findByEmail(email)) throw new HttpError(409, "Email is already in use");

  return repository.create({
    fullName: input.fullName.trim(),
    email,
    password: await hashPassword(input.password),
    phone: input.phone?.trim() || null,
    role: input.role ?? UserRole.CUSTOMER,
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await getUser(id);
  const data: UpdateUserInput = { ...input };
  if (data.fullName !== undefined) {
    data.fullName = data.fullName.trim();
    if (!data.fullName) throw new HttpError(400, "fullName cannot be empty");
  }
  if (data.email !== undefined) {
    data.email = normalizeEmail(data.email);
    const existing = await repository.findByEmail(data.email);
    if (existing && existing.id !== id) throw new HttpError(409, "Email is already in use");
  }
  if (data.password !== undefined) {
    validatePassword(data.password);
    data.password = await hashPassword(data.password);
  }
  if (data.phone !== undefined) data.phone = data.phone?.trim() || null;
  return repository.update(id, data);
}

export async function deleteUser(id: string) {
  await getUser(id);
  return repository.delete(id);
}
