import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type OrderForEmail = {
  id: string;
  total: unknown;
  user: { fullName: string; email: string } | null;
  address: { street: string; city: string; country: string; apartment: string | null } | null;
  items: Array<{ quantity: number; price: unknown; product: { nameEn: string } | null }>;
};

const money = (value: unknown) => `${Number(value).toFixed(2)} EGP`;

export async function sendOrderConfirmation(order: OrderForEmail) {
  const { host, port, secure, user, pass, from, adminEmail } = env.smtp;
  if (!host || !user || !pass) {
    console.warn(`Order ${order.id} created; confirmation email skipped because SMTP is not configured`);
    return false;
  }

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  const lines = order.items.map(item => `${item.product?.nameEn ?? "Product"} × ${item.quantity} — ${money(Number(item.price) * item.quantity)}`);
  const delivery = order.address ? [order.address.street, order.address.apartment, order.address.city, order.address.country].filter(Boolean).join(", ") : "Not provided";
  const text = `Hello ${order.user?.fullName ?? "Customer"},\n\nYour Aura order #${order.id.slice(0, 8).toUpperCase()} is confirmed for cash on delivery.\n\n${lines.join("\n")}\n\nTotal: ${money(order.total)}\nDelivery: ${delivery}\n\nWe will contact you before delivery.`;

  const messages = [
    order.user?.email ? transporter.sendMail({ from, to: order.user.email, subject: `Aura order confirmation #${order.id.slice(0, 8).toUpperCase()}`, text }) : null,
    adminEmail ? transporter.sendMail({ from, to: adminEmail, subject: `New cash-on-delivery order #${order.id.slice(0, 8).toUpperCase()}`, text: `A new order was placed by ${order.user?.fullName ?? "Customer"} (${order.user?.email ?? "no email"}).\n\n${text}` }) : null,
  ].filter(Boolean);
  const results = await Promise.allSettled(messages);
  return results.length > 0 && results.every(result => result.status === "fulfilled");
}
