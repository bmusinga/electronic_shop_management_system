"use client";

import { FormEvent, useMemo, useState } from "react";

const WHATSAPP = "254700000000";
const services = [
  { name: "Screen replacement", price: 2500, emoji: "📱" },
  { name: "Battery replacement", price: 1500, emoji: "🔋" },
  { name: "Charging port", price: 1000, emoji: "🔌" },
  { name: "Water damage", price: 1500, emoji: "💧" },
  { name: "Software & unlocking", price: 500, emoji: "🛠️" },
];

const fmt = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

export default function RepairsSection() {
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Record<string, { phone: string; status: string; device: string }>>({});
  const [trackRef, setTrackRef] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackResult, setTrackResult] = useState<string | null>(null);

  const waLink = useMemo(() => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello EShop, I need a phone repair")}`, []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const model = String(fd.get("model") || "").trim();
    const problem = String(fd.get("problem") || "").trim();
    if (!name || !/^(\+?254|0)?7\d{8}$/.test(phone.replace(/\s+/g, "")) || !model || !problem) return;
    const next = `R-${String(Object.keys(bookings).length + 1).padStart(4, "0")}`;
    setBookings((b) => ({ ...b, [next]: { phone, status: "Booked", device: model } }));
    setRef(next);
    e.currentTarget.reset();
  };

  const track = (e: FormEvent) => {
    e.preventDefault();
    const r = trackRef.trim().toUpperCase();
    const b = bookings[r];
    if (!b) { setTrackResult("No repair found. Check your reference number and phone number."); return; }
    if (trackPhone.replace(/\s+/g, "") && b.phone.replace(/\s+/g, "") !== trackPhone.replace(/\s+/g, "")) { setTrackResult("Phone number does not match this repair reference."); return; }
    setTrackResult(`Status for ${r} (${b.device}): ${b.status}`);
  };

  return (
    <section id="repair" className="py-8 bg-[#eef1f4] dark:bg-[#0b1218] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-xl p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-[#14202a] dark:text-[#eaf0f5]">Mobile phone repairs</h2>
          <p className="text-[#5b6b78] dark:text-[#9fb0be] mt-1">Drop your phone at our Juja Farm shop. We quote first and call you when it is ready.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
            {services.map((s) => (
              <div key={s.name} className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg p-3 bg-[#f9fafb] dark:bg-[#0b1218]">
                <div className="text-2xl mb-1" aria-hidden>{s.emoji}</div>
                <div className="font-semibold text-sm text-[#14202a] dark:text-[#eaf0f5]">{s.name}</div>
                <div className="text-sm text-[#5b6b78] dark:text-[#9fb0be]">from {fmt(s.price)}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={() => { setOpen(true); setRef(null); }} className="px-5 py-2.5 rounded-full bg-[#ff7a1a] text-white font-semibold hover:bg-[#e66e15]">Book a repair</button>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full bg-[#25D366] text-white font-semibold hover:brightness-95">Chat on WhatsApp</a>
          </div>

          <div className="mt-6 border-t border-[#d5dce2] dark:border-[#2a3a47] pt-5">
            <h3 className="font-semibold text-[#14202a] dark:text-[#eaf0f5] mb-2">Track my repair</h3>
            <form onSubmit={track} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <input aria-label="Repair reference number" value={trackRef} onChange={(e) => setTrackRef(e.target.value)} placeholder="Reference (e.g. R-0001)" className="flex-1 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5]" />
              <input aria-label="Phone number" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} placeholder="Phone number" className="flex-1 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5]" />
              <button className="px-4 py-2 rounded-lg bg-[#173f52] text-white font-medium">Track</button>
            </form>
            {trackResult && <p className="mt-2 text-sm text-[#14202a] dark:text-[#eaf0f5]">{trackResult}</p>}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Book a repair">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] p-5 text-[#14202a] dark:text-[#eaf0f5]">
            <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-bold">Book a repair</h3><button onClick={() => setOpen(false)} className="px-2 py-1 border rounded border-[#d5dce2] dark:border-[#2a3a47]">Close</button></div>
            {ref ? (
              <div className="p-4 rounded-lg bg-[#eef1f4] dark:bg-[#0b1218]">
                <p className="font-semibold">Booking confirmed</p>
                <p className="mt-1">Your repair reference number is <span className="font-bold text-[#ff7a1a]">{ref}</span>. Keep it to track your repair.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid grid-cols-1 gap-3">
                <input name="name" required placeholder="Full name" aria-label="Full name" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                <input name="phone" required placeholder="Phone number (e.g. 07XX XXX XXX)" aria-label="Phone number" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                <input name="model" required placeholder="Phone brand and model" aria-label="Phone brand and model" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                <select name="problem" required aria-label="Problem" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]">
                  <option value="">Select problem</option>
                  {services.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  <option value="Other">Other</option>
                </select>
                <textarea name="notes" placeholder="Notes (optional)" aria-label="Notes" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" rows={3} />
                <input name="date" type="date" required aria-label="Preferred drop-off date" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                <button className="mt-1 px-4 py-2.5 rounded-lg bg-[#ff7a1a] text-white font-semibold">Submit booking</button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
