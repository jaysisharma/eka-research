import { db } from "@/lib/db";

export type NewsCategory = "announcement" | "publication" | "milestone" | "event" | "media";

export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  date: string;
  imageUrl: string | null;
  href: string;
  featured: boolean;
  published: boolean;
};

type DbNews = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string | null;
  href: string;
  featured: boolean;
  published: boolean;
};

function toNewsPost(n: DbNews): NewsPost {
  return { ...n, category: n.category as NewsCategory };
}

export async function getPublishedNews(): Promise<NewsPost[]> {
  const rows = await db.newsPost.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });
  return rows.map(toNewsPost);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const row = await db.newsPost.findUnique({ where: { slug } });
  return row ? toNewsPost(row) : null;
}
