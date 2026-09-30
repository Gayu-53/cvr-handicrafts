"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, PackageCheck, FolderTree, ShoppingCart, Clock, IndianRupee } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatINR } from "@/lib/format";
import EmptyState from "@/components/EmptyState";

type DashboardData = {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
  recentOrders: any[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-espresso-400">Loading dashboard...</div>;
  }

  if (!data) {
    return <EmptyState title="Unable to load dashboard" description="Please refresh the page." />;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-espresso-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Package} label="Total Products" value={data.totalProducts} />
        <StatCard icon={PackageCheck} label="Active Products" value={data.activeProducts} accent="green" />
        <StatCard icon={FolderTree} label="Categories" value={data.totalCategories} accent="blue" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={data.totalOrders} />
        <StatCard icon={Clock} label="Pending Orders" value={data.pendingOrders} accent="red" />
        <StatCard icon={IndianRupee} label="Revenue" value={formatINR(data.revenue)} accent="green" />
      </div>

      <div className="mt-8 rounded-2xl border border-espresso-100 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-espresso-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-espresso-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-gold-600 hover:underline">
            View All
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No orders yet" description="Orders will appear here once customers start purchasing." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso-100 text-left text-xs uppercase text-espresso-400">
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-espresso-50 last:border-none">
                    <td className="px-6 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-espresso-800 hover:text-gold-600">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-espresso-600">{order.customer?.name}</td>
                    <td className="px-6 py-3 text-espresso-500">{order.items?.length ?? 0} item(s)</td>
                    <td className="px-6 py-3 font-medium text-espresso-800">{formatINR(order.total)}</td>
                    <td className="px-6 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
