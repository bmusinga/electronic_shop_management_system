import Link from "next/link";
import Image from "next/image";

const founder = {
  name: "James Mitchell",
  role: "Founder & CEO",
  bio: "With over 15 years of experience in the technology industry, James founded Voltex in 2015 with a clear vision: to make premium electronics accessible to everyone. His deep understanding of consumer technology and passion for exceptional customer service has driven Voltex from a single storefront to one of the region's most trusted electronics retailers.",
  quote: "We believe everyone deserves access to reliable, cutting-edge technology without the premium price tag.",
};

const values = [
  {
    title: "Quality First",
    description:
      "Every product we stock is rigorously tested and verified for quality and performance.",
  },
  {
    title: "Customer Focus",
    description:
      "Our customers are at the heart of everything we do. We provide personalized support and expert guidance.",
  },
  {
    title: "Innovation",
    description:
      "We stay ahead of the curve, constantly updating our inventory with the latest technology.",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                Founded in 2015 with a mission to make quality electronics
                accessible to everyone, Voltex started as a small shop with a
                big dream. Our founders believed that everyone deserves access
                to reliable, cutting-edge technology without the premium
                price tag.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                What began as a single storefront has grown into one of the
                region&apos;s leading electronics retailers. Today, we serve
                thousands of customers, offering an extensive range of products
                backed by expert advice and exceptional customer service. Our
                commitment to quality and value remains the same as day one.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl sk-panel-inset order-1 lg:order-2">
              <Image
                src="/images/photo-1565211604822-2641d0b081a6.avif"
                alt="Our Store"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12 [text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => {
              return (
                <div
                  key={value.title}
                  className="sk-panel p-8 transition-all duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12 [text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                {founder.name}
              </h3>
              <p className="text-primary font-medium mb-4">{founder.role}</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {founder.bio}
              </p>
              <blockquote className="border-l-4 border-primary pl-4 italic text-slate-500 dark:text-slate-400">
                &ldquo;{founder.quote}&rdquo;
              </blockquote>
            </div>
            <div className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-12 flex items-center justify-center sk-panel-inset aspect-square max-h-[400px]">
              <span className="text-2xl font-semibold text-primary [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                Founder Photo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to explore?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Browse our complete collection of premium electronics.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 rounded-lg font-semibold sk-btn-primary"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </main>
  );
}
