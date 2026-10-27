import { Portfolio } from "@/components/portfolio/Portfolio";
import { getContent, publicContent } from "@/lib/content";

// Served from the cache; admin saves call revalidateTag so edits show up within seconds.
export const revalidate = 3600;

export default async function Home() {
  const content = await getContent();
  return <Portfolio content={publicContent(content)} />;
}
