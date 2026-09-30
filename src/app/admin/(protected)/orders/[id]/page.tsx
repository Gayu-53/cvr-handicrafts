"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatINR } from "@/lib/format";

const STATUS_OPTIONS = [
  "PENDING", "PAYMENT_PENDING", "PAID", "CONFIRMED",
  "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    setUpdating(false);
    if (json.success) {
      toast.success("Order status updated");
      setOrder(json.data);
    } else {
      toast.error(json.error || "Unable to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-espresso-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading order...
      </div>
    );
  }

  if (!order) return <p className="text-espresso-500">Order not found.</p>;

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso-900">{order.orderNumber}</h1>
          <p className="text-sm text-espresso-400">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-card">
          <h2 className="mb-3 font-display font-semibold text-espresso-900">Customer</h2>
          <p className="text-sm text-espresso-600">{order.customer?.name}</p>
          <p className="text-sm text-espresso-600">{order.customer?.phone}</p>
          {order.customer?.email && <p className="text-sm text-espresso-600">{order.customer.email}</p>}
        </div>

        <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-card">
          <h2 className="mb-3 font-display font-semibold text-espresso-900">Shipping Address</h2>
          <p className="text-sm text-espresso-600">{order.addressLine}</p>
          <p className="text-sm text-espresso-600">{order.city}, {order.state} – {order.pincode}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-espresso-100 bg-white p-5 shadow-card">
        <h2 className="mb-3 font-display font-semibold text-espresso-900">Items</h2>
        <ul className="divide-y divide-espresso-50">
          {order.items.map((item: any) => (
            <li key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-espresso-800">{item.productName}</p>
                <p className="text-xs text-espresso-400">Qty: {item.quantity} × {formatINR(item.unitPrice)}</p>
              </div>
              <p className="text-sm font-semibold text-espresso-800">{formatINR(item.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-espresso-100 pt-3 text-sm">
          <div className="flex justify-between text-espresso-500">
            <span>Subtotal</span><span>{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-espresso-500">
            <span>Shipping</span><span>{formatINR(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-display text-base font-bold text-espresso-900">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      {order.payment && (
        <div className="mt-6 rounded-2xl border border-espresso-100 bg-white p-5 shadow-card">
          <h2 className="mb-3 font-display font-semibold text-espresso-900">Payment</h2>
          <p className="text-sm text-espresso-600">Status: {order.payment.status}</p>
          {order.payment.razorpayPaymentId && (
            <p className="text-sm text-espresso-600">Payment ID: {order.payment.razorpayPaymentId}</p>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-espresso-100 bg-white p-5 shadow-card">
        <h2 className="mb-3 font-display font-semibold text-espresso-900">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              disabled={updating}
              onClick={() => updateStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                order.status === s
                  ? "bg-espresso-900 text-cream"
                  : "border border-espresso-200 text-espresso-500 hover:border-gold-300"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
