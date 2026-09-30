"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  LogOut,
  ExternalLink,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-espresso-100 bg-white">
      <div className="flex items-center gap-3 border-b border-espresso-100 px-5 py-5">
        <Image src="/logo.png" alt="CVR" width={36} height={36} className="h-9 w-9 object-contain" />
        <div>
          <p className="font-display text-sm font-bold text-espresso-900">CVR Admin</p>
          <p className="text-[11px] text-espresso-400">Management Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-espresso-900 text-gold-300"
                  : "text-espresso-600 hover:bg-espresso-50"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-espresso-100 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-espresso-600 hover:bg-espresso-50"
        >
          <ExternalLink className="h-[18px] w-[18px]" /> View Website
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-[18px] w-[18px]" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
