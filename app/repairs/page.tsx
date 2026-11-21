import RepairsSection from "@/components/home/RepairsSection";

export default function RepairsPage() {
  return (
    <main className="bg-[#eef1f4] dark:bg-[#0b1218] py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <h1 className="text-3xl font-bold text-[#14202a] dark:text-[#eaf0f5]">Book or track a repair</h1>
        <p className="text-[#5b6b78] dark:text-[#9fb0be] mt-1">Fast mobile phone repairs in Juja Farm. We quote first and call you when it is ready.</p>
      </div>
      <RepairsSection />
    </main>
  );
}