import type { Metadata } from "next";
import { SITE, SITE_URL } from "./constants";

interface PageSEO {
  title: string;
  description: string;
  /** Path relative to root e.g. "/research" */
  path?: string;
  /**
   * Override OG image for this page.
   * Omit to inherit the root app/opengraph-image.tsx automatically.
   * Pass a full URL when the page has its own opengraph-image file.
   */
  image?: { url: string; alt: string };
  /** Set true for pages that should not be indexed (admin, login, etc.) */
  noIndex?: boolean;
}

/**
 * Call this in every page's `export const metadata` or `generateMetadata`.
 * Produces consistent OG, Twitter, canonical, and robot directives.
 *
 * OG image is inherited from app/opengraph-image.tsx unless overridden.
 */
export function buildMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: PageSEO): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title,
      description,
      ...(image && {
        images: [{ url: image.url, width: 1200, height: 630, alt: image.alt }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image.url] }),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
  };
}
