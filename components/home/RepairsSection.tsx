"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { normalizeKenyanPhone } from "@/lib/phone";

const services = [
  { name: "Screen replacement", emoji: "📱" },
  { name: "Battery replacement", emoji: "🔋" },
  { name: "Charging port", emoji: "🔌" },
  { name: "Water damage", emoji: "💧" },
  { name: "Software & unlocking", emoji: "🛠️" },
];

interface TrackResult {
  reference: string;
  device: string;
  status: string;
}

export default function RepairsSection() {
  const storeInfo = useStoreInfo();
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [trackRef, setTrackRef] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackResult, setTrackResult] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);

  const whatsapp = normalizeKenyanPhone(storeInfo.whatsapp);
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Hello ${storeInfo.storeName}, I need a phone repair`
      )}`
    : null;
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const phone = normalizeKenyanPhone(String(fd.get("phone") || ""));
    if (!phone) {
      setBookingError("Enter a valid Kenyan phone number.");
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const data = await apiFetch<{ reference: string }>("/api/repairs", {
        method: "POST",
        body: JSON.stringify({
          name: String(fd.get("name") || ""),
          phone,
          model: String(fd.get("model") || ""),
          problem: String(fd.get("problem") || ""),
          notes: String(fd.get("notes") || ""),
          preferredDate: String(fd.get("date") || ""),
        }),
      });
      setReference(data.reference);
      form.reset();
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Could not save your booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function track(e: FormEvent) {
    e.preventDefault();
    const phone = normalizeKenyanPhone(trackPhone);
    if (!phone) {
      setTrackResult("Enter a valid Kenyan phone number.");
      return;
    }

    setTracking(true);
    setTrackResult(null);
    try {
      const data = await apiFetch<TrackResult>("/api/repairs/track", {
        method: "POST",
        body: JSON.stringify({ reference: trackRef, phone }),
      });
      setTrackResult(
        `${data.reference} (${data.device}): ${data.status}`
      );
    } catch (error) {
      setTrackResult(
        error instanceof Error ? error.message : "Could not track this repair."
      );
    } finally {
      setTracking(false);
    }
  }

  return (
    <section id="repair" className="py-8 bg-[#eef1f4] dark:bg-[#0b1218] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-xl p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-[#14202a] dark:text-[#eaf0f5]">Mobile phone repairs</h2>
          <p className="text-[#5b6b78] dark:text-[#9fb0be] mt-1">
            Drop your phone at our {storeInfo.address || "Juja Farm"} shop. We quote first and call you when it is ready.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
            {services.map((service) => (
              <div key={service.name} className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg p-3 bg-[#f9fafb] dark:bg-[#0b1218]">
                <div className="text-2xl mb-1" aria-hidden>{service.emoji}</div>
                <div className="font-semibold text-sm text-[#14202a] dark:text-[#eaf0f5]">{service.name}</div>
                <div className="text-sm text-[#5b6b78] dark:text-[#9fb0be]">Quote after inspection</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={() => { setOpen(true); setReference(null); setBookingError(null); }} className="px-5 py-2.5 rounded-full bg-[#ff7a1a] text-white font-semibold hover:bg-[#e66e15]">Book a repair</button>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full bg-[#25D366] text-white font-semibold hover:brightness-95">Chat on WhatsApp</a>
            )}
          </div>

          <div className="mt-6 border-t border-[#d5dce2] dark:border-[#2a3a47] pt-5">
            <h3 className="font-semibold text-[#14202a] dark:text-[#eaf0f5] mb-2">Track my repair</h3>
            <form onSubmit={track} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <input aria-label="Repair reference number" value={trackRef} onChange={(e) => setTrackRef(e.target.value)} placeholder="Reference (e.g. R-0001)" className="flex-1 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5]" />
              <input aria-label="Phone number" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} placeholder="Phone number" className="flex-1 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5]" />
              <button disabled={tracking} className="px-4 py-2 rounded-lg bg-[#173f52] text-white font-medium disabled:opacity-60">{tracking ? "Tracking..." : "Track"}</button>
            </form>
            {trackResult && <p className="mt-2 text-sm text-[#14202a] dark:text-[#eaf0f5]">{trackResult}</p>}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Book a repair">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] p-5 text-[#14202a] dark:text-[#eaf0f5]">
            <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-bold">Book a repair</h3><button onClick={() => setOpen(false)} className="px-2 py-1 border rounded border-[#d5dce2] dark:border-[#2a3a47]">Close</button></div>
            {reference ? (
              <div className="p-4 rounded-lg bg-[#eef1f4] dark:bg-[#0b1218]">
                <p className="font-semibold">Booking confirmed</p>
                <p className="mt-1">Your repair reference number is <span className="font-bold text-[#ff7a1a]">{reference}</span>. Keep it to track your repair.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid grid-cols-1 gap-3">
                <input name="name" required placeholder="Full name" aria-label="Full name" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                <input name="phone" required placeholder="Phone number (e.g. 0712345678)" aria-label="Phone number" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                <input name="model" required placeholder="Phone brand and model" aria-label="Phone brand and model" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                <select name="problem" required aria-label="Problem" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]">
                  <option value="">Select problem</option>
                  {services.map((service) => <option key={service.name} value={service.name}>{service.name}</option>)}
                  <option value="Other">Other</option>
                </select>
                <textarea name="notes" placeholder="Notes (optional)" aria-label="Notes" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" rows={3} />
                <input name="date" type="date" min={today} required aria-label="Preferred drop-off date" className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg px-3 py-2 bg-white dark:bg-[#0b1218]" />
                {bookingError && <p className="text-sm text-red-600 dark:text-red-400">{bookingError}</p>}
                <button disabled={submitting} className="mt-1 px-4 py-2.5 rounded-lg bg-[#ff7a1a] text-white font-semibold disabled:opacity-60">{submitting ? "Saving..." : "Submit booking"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
