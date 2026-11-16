import OffersCarousel from "@/components/home/OffersCarousel";
import CategoryTiles from "@/components/home/CategoryTiles";
import RepairsSection from "@/components/home/RepairsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function Home() {
  return (
    <main className="bg-[#eef1f4] dark:bg-[#0b1218]">
      <OffersCarousel />
      <CategoryTiles />
      <RepairsSection />
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedProducts />
        </div>
      </section>
    </main>
  );
}