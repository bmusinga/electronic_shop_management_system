import OffersCarousel from "@/components/home/OffersCarousel";
import CrazyOffersSection from "@/components/home/CrazyOffersSection";
import CategoryTiles from "@/components/home/CategoryTiles";
import { listProducts } from "@/lib/firestore-admin";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    products = await listProducts();
  } catch {}

  return (
    <main className="bg-[#eef1f4] dark:bg-[#0A1F44]">
      <OffersCarousel initialProducts={products} />
      <CrazyOffersSection />
      <CategoryTiles />
    </main>
  );
}
