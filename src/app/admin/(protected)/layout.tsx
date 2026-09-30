import AdminSidebar from "@/components/admin/AdminSidebar";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-espresso-50/40">
      <AdminSidebar />
      <main className="min-h-screen flex-1 overflow-x-hidden p-6 sm:p-8">{children}</main>
    </div>
  );
}
