import OffersCarousel from "@/components/home/OffersCarousel";
import CrazyOffersSection from "@/components/home/CrazyOffersSection";
import CategoryTiles from "@/components/home/CategoryTiles";
import { listProducts } from "@/lib/firestore-admin";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let loadFailed = false;
  try {
    products = await listProducts();
  } catch {
    loadFailed = true;
  }

  return (
    <main className="bg-[#eef1f4] dark:bg-[#0A1F44]">
      {loadFailed && (
        <p className="bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          Products are temporarily unavailable. Please try again later.
        </p>
      )}
      <OffersCarousel initialProducts={products} />
      <CrazyOffersSection />
      <CategoryTiles />
    </main>
  );
}
