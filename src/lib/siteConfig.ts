// Central business configuration. These are the defaults used until the
// Admin > Settings screen overrides them via the SiteSetting table.
// Values below are exactly what was provided — nothing invented.

export const siteConfig = {
  businessName: "CVR Handicrafts",
  tagline: "Crafted with Tradition",
  officePhone: "8220003018",
  contactPersonName: "Muthu MMS",
  contactPersonPhone: "8807173498",
  email: "cvrhandicraftscbe@gmail.com",
  instagramHandle: "@cvrhandicrafts_",
  instagramUrl: "https://instagram.com/cvrhandicraftscbe",
  address: {
    line1: "P70, Dr. Alagappa Road",
    line2: "Tatabad",
    city: "Coimbatore",
    pincode: "641012",
  },
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918220003018",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function getWhatsappLink(message?: string) {
  const defaultMessage = "Hello CVR Handicrafts, I would like to know more about your products.";
  const text = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}
