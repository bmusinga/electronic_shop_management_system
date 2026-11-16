const groups = [
  { title: "Phones & tablets", items: [["Smartphones", "📱"], ["Tablets", "📟"], ["Earbuds", "🎧"], ["Watches", "⌚"]] },
  { title: "Computers", items: [["Laptops", "💻"], ["Desktops", "🖥️"], ["Keyboards", "⌨️"], ["Printers", "🖨️"]] },
  { title: "TV & audio", items: [["Smart TVs", "📺"], ["Speakers", "🔊"], ["Mics", "🎙️"], ["Decoders", "📡"]] },
  { title: "Power & accessories", items: [["Power banks", "🔋"], ["Chargers", "🔌"], ["Storage", "💾"], ["Cameras", "📷"]] },
];

export default function CategoryTiles() {
  return (
    <section className="py-6 bg-[#eef1f4] dark:bg-[#0b1218]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((g) => (
          <div key={g.title} className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] p-4">
            <h3 className="font-bold text-[#14202a] dark:text-[#eaf0f5] mb-3">{g.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {g.items.map(([label, emoji]) => (
                <div key={label} className="bg-[#eef1f4] dark:bg-[#0b1218] rounded-md p-2 text-center">
                  <div className="text-2xl mb-1" aria-hidden>{emoji}</div>
                  <div className="text-xs font-medium text-[#14202a] dark:text-[#eaf0f5]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}