"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import EmptyState from "@/components/EmptyState";
import { formatINR } from "@/lib/format";

const STATUS_FILTERS = [
  "ALL", "PENDING", "PAYMENT_PENDING", "PAID", "CONFIRMED",
  "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data.orders);
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-espresso-900">Orders</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              status === s ? "bg-espresso-900 text-cream" : "bg-white text-espresso-500 border border-espresso-200"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-espresso-400">Loading...</p>
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders matching this filter will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-espresso-100 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-espresso-100 text-left text-xs uppercase text-espresso-400">
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-espresso-50 last:border-none">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-espresso-800 hover:text-gold-600">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-espresso-600">{order.customer?.name}</td>
                  <td className="px-5 py-3 text-espresso-500">{order.customer?.phone}</td>
                  <td className="px-5 py-3 font-medium text-espresso-800">{formatINR(order.total)}</td>
                  <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 text-espresso-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
