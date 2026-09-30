"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/cartStore";
import { formatINR } from "@/lib/format";
import { useRazorpayScript } from "@/lib/useRazorpayScript";
import EmptyState from "@/components/EmptyState";
import { ShoppingBag, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCartStore();
  const router = useRouter();
  const razorpayReady = useRazorpayScript();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingFee = subtotal() >= 2000 ? 0 : 99;
  const total = subtotal() + (items.length > 0 ? shippingFee : 0);

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!razorpayReady) {
      toast.error("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const orderJson = await orderRes.json();

      if (!orderJson.success) {
        toast.error(orderJson.error || "Unable to create order. Please try again.");
        setSubmitting(false);
        return;
      }

      const { razorpayOrderId, amount, currency, orderNumber, orderId } = orderJson.data;

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "CVR Handicrafts",
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#dead38" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/orders/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson.success) {
              clear();
              router.push(`/checkout/success?order=${orderNumber}`);
            } else {
              toast.error(
                "Payment could not be verified. If you were charged, please contact support."
              );
            }
          } catch {
            toast.error("Payment could not be completed.");
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled.", { icon: "ℹ️" });
            setSubmitting(false);
          },
        },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setSubmitting(false);
      });

      rzp.open();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-cvr py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is currently empty"
          description="Add a few handcrafted pieces before checking out."
        />
        <div className="mt-6 text-center">
          <Link href="/shop" className="btn-gold">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-cvr py-10 sm:py-14">
      <h1 className="section-heading mb-10 text-center">Checkout</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="lg:col-span-3 space-y-5 rounded-2xl border border-espresso-100 bg-white p-6 shadow-card sm:p-8"
        >
          <h2 className="font-display text-lg font-bold text-espresso-900">Shipping Details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" required value={form.name} onChange={(v) => updateField("name", v)} />
            <Field label="Phone Number" required type="tel" value={form.phone} onChange={(v) => updateField("phone", v)} />
          </div>

          <Field label="Email (optional)" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
          <Field label="Address" required value={form.addressLine} onChange={(v) => updateField("addressLine", v)} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="City" required value={form.city} onChange={(v) => updateField("city", v)} />
            <Field label="State" required value={form.state} onChange={(v) => updateField("state", v)} />
            <Field label="Pincode" required value={form.pincode} onChange={(v) => updateField("pincode", v)} />
          </div>

          <button type="submit" disabled={submitting} className="btn-gold mt-4 w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              `Pay ${formatINR(total)}`
            )}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 h-fit rounded-2xl border border-espresso-100 bg-white p-6 shadow-card sm:p-8"
        >
          <h2 className="mb-5 font-display text-lg font-bold text-espresso-900">Order Summary</h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-espresso-50">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-espresso-900">{item.name}</p>
                  <p className="text-xs text-espresso-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-espresso-800">
                  {formatINR((item.salePrice ?? item.price) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-espresso-100 pt-4 text-sm">
            <div className="flex justify-between text-espresso-500">
              <span>Subtotal</span>
              <span>{formatINR(subtotal())}</span>
            </div>
            <div className="flex justify-between text-espresso-500">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatINR(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-espresso-100 pt-2 font-display text-base font-bold text-espresso-900">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-espresso-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-espresso-200 px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
      />
    </label>
  );
}
