"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Truck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/routing";
import { API_URL, customerSession, customerToken } from "@/lib/api";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    nameEn: string;
    price: string | number;
    discountPrice?: string | number | null;
  };
  productVariant?: { price?: string | number | null } | null;
};
type Address = {
  country: string;
  city: string;
  street: string;
  apartment?: string | null;
  postalCode?: string | null;
};

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const session = customerSession();
  const [form, setForm] = useState({
    fullName: session?.fullName ?? "",
    phone: "",
    country: "Egypt",
    city: "",
    street: "",
    apartment: "",
    postalCode: "",
  });

  useEffect(() => {
    const token = customerToken();
    if (!token) {
      const timer = window.setTimeout(() => {
        setError("Please sign in before checkout.");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    Promise.all([
      fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([cartResponse, addressResponse]) => {
        const cart = await cartResponse.json();
        if (!cartResponse.ok)
          throw new Error(cart.error ?? "Could not load your cart");
        setItems(cart.data.items);
        if (addressResponse.ok) {
          const addresses = await addressResponse.json();
          const address = addresses.data[0] as Address | undefined;
          if (address)
            setForm((value) => ({
              ...value,
              country: address.country,
              city: address.city,
              street: address.street,
              apartment: address.apartment ?? "",
              postalCode: address.postalCode ?? "",
            }));
        }
      })
      .catch((cause) =>
        setError(
          cause instanceof Error ? cause.message : "Could not load checkout",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(
        item.productVariant?.price ??
          item.product.discountPrice ??
          item.product.price,
      ) *
        item.quantity,
    0,
  );
  const change = (field: string, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = customerToken();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Checkout failed");
      setOrderId(String(body.data.id));
      setEmailSent(Boolean(body.data.confirmationEmailSent));
      setItems([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#FAF8F5]">
      <Header />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 md:px-8 md:py-20">
        {orderId ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-black/8 bg-white p-10 text-center shadow-sm">
            <CheckCircle2 className="mx-auto text-[#526956]" size={48} />
            <h1 className="mt-6 font-serif text-4xl">Order confirmed</h1>
            <p className="mt-3 text-sm leading-6 text-black/50">
            Your cash-on-delivery order has been received. {emailSent ? "Confirmation emails were sent to you and the store administrator." : "We will contact you before delivery; email delivery is pending until the store SMTP settings are configured."}
            </p>
            <div className="mt-6 rounded-xl bg-[#f1eee7] p-4 text-xs">
              <span className="text-black/45">Order reference</span>
              <div className="mt-1 font-bold tracking-widest">
                #{orderId.slice(0, 8).toUpperCase()}
              </div>
            </div>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-[#26372f] px-7 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Continue shopping
            </Link>
          </div>
        ) : loading ? (
          <div className="grid min-h-96 place-items-center">
            <LoaderCircle className="animate-spin text-black/30" />
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#927345]">
                Secure checkout
              </div>
              <h1 className="mt-3 font-serif text-5xl">Delivery details</h1>
            </div>
            {error && (
              <div className="mb-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <form
              onSubmit={submit}
              className="grid gap-8 lg:grid-cols-[1fr_360px]"
            >
              <div className="rounded-2xl border border-black/8 bg-white p-6 md:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    value={form.fullName}
                    onChange={(value) => change("fullName", value)}
                  />
                  <Field
                    label="Phone number"
                    value={form.phone}
                    onChange={(value) => change("phone", value)}
                    type="tel"
                  />
                  <Field
                    label="Country"
                    value={form.country}
                    onChange={(value) => change("country", value)}
                  />
                  <Field
                    label="City"
                    value={form.city}
                    onChange={(value) => change("city", value)}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Street address"
                      value={form.street}
                      onChange={(value) => change("street", value)}
                    />
                  </div>
                  <Field
                    label="Apartment (optional)"
                    value={form.apartment}
                    onChange={(value) => change("apartment", value)}
                    required={false}
                  />
                  <Field
                    label="Postal code (optional)"
                    value={form.postalCode}
                    onChange={(value) => change("postalCode", value)}
                    required={false}
                  />
                </div>
                <div className="mt-8 border-t border-black/8 pt-7">
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Payment method
                  </div>
                  <div className="mt-3 flex items-center gap-4 rounded-xl border-2 border-[#526956] bg-[#f2f5f1] p-4">
                    <Truck className="text-[#526956]" />
                    <div>
                      <div className="text-sm font-semibold">
                        Cash on delivery
                      </div>
                      <div className="mt-1 text-xs text-black/45">
                        Pay in cash when your order arrives.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <aside className="h-fit rounded-2xl bg-[#26372f] p-7 text-white">
                <h2 className="font-serif text-2xl">Your order</h2>
                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 text-xs text-white/65"
                    >
                      <span>
                        {item.product.nameEn} × {item.quantity}
                      </span>
                      <span>
                        {(
                          Number(
                            item.productVariant?.price ??
                              item.product.discountPrice ??
                              item.product.price,
                          ) * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between border-t border-white/15 pt-5 font-semibold">
                  <span>Total</span>
                  <span>{total.toFixed(2)} EGP</span>
                </div>
                <button
                  disabled={submitting || items.length === 0}
                  className="mt-7 w-full rounded-full bg-[#d3b47b] py-3 text-xs font-bold uppercase tracking-widest text-[#26372f] disabled:opacity-50"
                >
                  {submitting ? "Placing order…" : "Place order"}
                </button>
              </aside>
            </form>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 h-12 w-full rounded-lg border border-black/10 bg-[#fdfcf9] px-4 font-normal outline-none focus:border-[#667d6b]"
      />
    </label>
  );
}
