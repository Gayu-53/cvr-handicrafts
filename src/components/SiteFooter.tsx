import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function SiteFooter() {
  return (
    <footer className="bg-espresso-950 text-cream/80">
      <div className="container-cvr grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Image src="/logo.png" alt="CVR Handicrafts" width={44} height={44} className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold text-gold-300">CVR Handicrafts</span>
          </div>
          <p className="text-sm leading-relaxed text-cream/60">
            Traditional Indian handicrafts — statues, Buddha idols and Tanjore
            art — handcrafted with authenticity and care.
          </p>
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-300 hover:text-gold-200"
          >
            <Instagram className="h-4 w-4" /> {siteConfig.instagramHandle}
          </a>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-semibold text-gold-300">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-gold-300">Shop All</Link></li>
            <li><Link href="/about" className="hover:text-gold-300">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-gold-300">Contact</Link></li>
            <li><Link href="/shop?category=statues" className="hover:text-gold-300">Statues</Link></li>
            <li><Link href="/shop?category=buddha" className="hover:text-gold-300">Buddha Collection</Link></li>
            <li><Link href="/shop?category=tanjore" className="hover:text-gold-300">Tanjore Dolls</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-semibold text-gold-300">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <span>
                Office: {siteConfig.officePhone}
                <br />
                {siteConfig.contactPersonName}: {siteConfig.contactPersonPhone}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-gold-300">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <span>
                {siteConfig.address.line1}, {siteConfig.address.line2},
                <br />
                {siteConfig.address.city} – {siteConfig.address.pincode}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-semibold text-gold-300">Our Promise</h4>
          <p className="text-sm text-cream/60">
            Every piece is inspected for quality before it leaves our workshop.
            Authentic materials, traditional techniques, and craftsmanship passed
            down through generations.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-cvr flex flex-col items-center justify-between gap-2 text-xs text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} CVR Handicrafts. All rights reserved.</p>
          <p>Handcrafted with tradition in Coimbatore, India.</p>
        </div>
      </div>
    </footer>
  );
}
