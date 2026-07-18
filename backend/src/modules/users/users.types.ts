import type { UserRole } from "../../generated/prisma/enums.js";

export interface UserFilters {
  page: number;
  limit: number;
  role?: UserRole;
  search?: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
  role?: UserRole;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  role?: UserRole;
  isVerified?: boolean;
}
