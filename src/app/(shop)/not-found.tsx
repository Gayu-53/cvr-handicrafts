import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <PackageX className="mb-4 h-16 w-16 text-espresso-300" />
      <h1 className="font-display text-3xl font-bold text-espresso-900">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-espresso-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link href="/" className="btn-gold mt-6">Back to Home</Link>
    </div>
  );
}
