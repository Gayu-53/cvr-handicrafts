import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import "../globals.css";

export const metadata = {
  title: "Admin | CVR Handicrafts",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
