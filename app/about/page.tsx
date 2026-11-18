import Link from "next/link";

const values = [
  { title: "Trusted products", description: "Quality phones, laptops, TVs, audio and accessories selected for everyday use in Kenya." },
  { title: "Honest repairs", description: "We diagnose first, quote clearly, and call you when your phone is ready for collection." },
  { title: "Local support", description: "Based in Juja Farm, we offer friendly service and practical help you can rely on." },
];

export default function AboutPage() {
  return (
    <main className="bg-[#eef1f4] dark:bg-[#0A1F44] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <section className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] p-6">
          <h1 className="text-3xl font-bold text-[#14202a] dark:text-[#eaf0f5] mb-3">About EShop</h1>
          <p className="text-[#5b6b78] dark:text-[#9fb0be] leading-relaxed max-w-3xl">EShop is your local electronics store in <strong className="text-[#14202a] dark:text-[#eaf0f5]">Juja Farm, Kenya</strong>. We sell quality electronics and provide fast, reliable mobile phone repairs. Whether you need a new smartphone, a laptop for work, home entertainment, or a quick screen or battery fix, we’re here to help with fair prices and clear service.</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {values.map((v) => (
            <div key={v.title} className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] p-5">
              <h2 className="text-lg font-semibold text-[#14202a] dark:text-[#eaf0f5] mb-2">{v.title}</h2>
              <p className="text-sm text-[#5b6b78] dark:text-[#9fb0be] leading-relaxed">{v.description}</p>
            </div>
          ))}
        </section>

        <section className="bg-[#173f52] text-white rounded-[10px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Need electronics or a repair?</h2>
            <p className="text-white/80 text-sm mt-1">Visit us in Juja Farm or browse our products online.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/products" className="px-4 py-2 rounded-full bg-[#ff7a1a] font-semibold hover:bg-[#e66e15]">Shop products</Link>
          </div>
        </section>
      </div>
    </main>
  );
}