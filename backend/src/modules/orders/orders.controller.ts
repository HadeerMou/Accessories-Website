import type { NextFunction, Request, Response } from "express";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import { createOrder, getOrder, listOrders, updateOrder } from "./orders.service.js";
import { type AuthRequest } from "../auth/auth.middleware.js";
import { UserRole } from "../../generated/prisma/enums.js";

function handle(error: unknown, response: Response, next: NextFunction) {
  if (error instanceof HttpError) return response.status(error.status).json({ error: error.message });
  next(error);
}

function routeParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== "string") throw new HttpError(400, `Invalid ${name}`);
  return value;
}

function optionalEnum<T extends string>(value: unknown, values: readonly T[], name: string): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !values.includes(value as T)) throw new HttpError(400, `Invalid ${name}`);
  return value as T;
}

export async function getOrders(request: Request, response: Response, next: NextFunction) {
  try {
    const auth = (request as AuthRequest).auth!;
    response.json(await listOrders({
      page: Number(request.query.page ?? 1),
      limit: Number(request.query.limit ?? 10),
      userId: auth.role === UserRole.ADMIN ? request.query.userId as string | undefined : auth.sub,
      orderStatus: optionalEnum(request.query.orderStatus, Object.values(OrderStatus), "order status"),
      paymentStatus: optionalEnum(request.query.paymentStatus, Object.values(PaymentStatus), "payment status"),
    }));
  } catch (error) { handle(error, response, next); }
}

export async function getOrderById(request: Request, response: Response, next: NextFunction) {
  try { const order = await getOrder(routeParam(request.params.orderId, "order id")); const auth = (request as AuthRequest).auth!; if (auth.role !== UserRole.ADMIN && order.userId !== auth.sub) throw new HttpError(403, "You cannot access this order"); response.json({ data: order }); }
  catch (error) { handle(error, response, next); }
}

export async function postOrder(request: Request, response: Response, next: NextFunction) {
  try { const auth = (request as AuthRequest).auth!; const userId = auth.role === UserRole.ADMIN && request.body.userId ? request.body.userId : auth.sub; response.status(201).json({ data: await createOrder({ ...request.body, userId }) }); }
  catch (error) { handle(error, response, next); }
}

export async function putOrder(request: Request, response: Response, next: NextFunction) {
  try {
    const input = {
      orderStatus: optionalEnum(request.body.orderStatus, Object.values(OrderStatus), "order status"),
      paymentStatus: optionalEnum(request.body.paymentStatus, Object.values(PaymentStatus), "payment status"),
    };
    response.json({ data: await updateOrder(routeParam(request.params.orderId, "order id"), input) });
  } catch (error) { handle(error, response, next); }
}
