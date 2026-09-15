import HeroCarousel from "@/components/home/HeroCarousel";
import BusinessInfo from "@/components/home/BusinessInfo";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FAQ from "@/components/home/FAQ";

export default function Home() {
  return (
    <main>
      <section>
        <HeroCarousel />
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BusinessInfo />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedProducts />
        </div>
      </section>

      <FAQ />
    </main>
  );
}
