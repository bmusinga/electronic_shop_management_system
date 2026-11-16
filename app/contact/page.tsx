"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { ContactMessageInput } from "@/lib/types";

const subjects = ["General Inquiry", "Product Availability", "Phone Repair", "Warranty/Support", "Other"];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: ContactMessageInput = { name: formData.name, email: formData.email, subject: formData.subject, message: formData.message };
    try {
      await apiFetch<{ id: string }>("/api/messages", { method: "POST", body: JSON.stringify(payload) });
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      window.alert("Could not send your message. Please try again later.");
    }
  };

  return (
    <main className="bg-[#eef1f4] dark:bg-[#0b1218] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[#14202a] dark:text-[#eaf0f5]">Contact EShop</h1>
          <p className="text-[#5b6b78] dark:text-[#9fb0be]">Sales and mobile phone repairs in Juja Farm, Kenya.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[#14202a] dark:text-[#eaf0f5] mb-4">Send us a message</h2>
            {submitted && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">Thank you! We will get back to you soon.</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#14202a] dark:text-[#eaf0f5] mb-1">Full Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2.5 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5]" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#14202a] dark:text-[#eaf0f5] mb-1">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2.5 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5]" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#14202a] dark:text-[#eaf0f5] mb-1">Subject</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-3 py-2.5 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5]">
                  <option value="">Select a subject</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#14202a] dark:text-[#eaf0f5] mb-1">Message</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full px-3 py-2.5 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5] resize-none" />
              </div>
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 font-semibold bg-[#ff7a1a] text-white hover:bg-[#e66e15]"><Send className="w-4 h-4" /> Send Message</button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] p-5 sm:p-6">
              <h2 className="text-xl font-bold text-[#14202a] dark:text-[#eaf0f5] mb-4">Get in touch</h2>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3"><MapPin className="w-5 h-5 text-[#ff7a1a] mt-0.5" /><span className="text-[#5b6b78] dark:text-[#9fb0be]"><strong className="block text-[#14202a] dark:text-[#eaf0f5]">Location</strong>Juja Farm, Kenya</span></li>
                <li className="flex gap-3"><Phone className="w-5 h-5 text-[#ff7a1a] mt-0.5" /><span className="text-[#5b6b78] dark:text-[#9fb0be]"><strong className="block text-[#14202a] dark:text-[#eaf0f5]">Call or WhatsApp</strong><a href="tel:+254700000000" className="hover:text-[#ff7a1a]">07XX XXX XXX</a></span></li>
                <li className="flex gap-3"><Mail className="w-5 h-5 text-[#ff7a1a] mt-0.5" /><span className="text-[#5b6b78] dark:text-[#9fb0be]"><strong className="block text-[#14202a] dark:text-[#eaf0f5]">Email</strong><a href="mailto:hello@eshop.co.ke" className="hover:text-[#ff7a1a]">hello@eshop.co.ke</a></span></li>
                <li className="flex gap-3"><Clock className="w-5 h-5 text-[#ff7a1a] mt-0.5" /><span className="text-[#5b6b78] dark:text-[#9fb0be]"><strong className="block text-[#14202a] dark:text-[#eaf0f5]">Hours</strong>Mon–Sat: 8:00 AM – 7:00 PM<br />Sun: 10:00 AM – 5:00 PM</span></li>
              </ul>
            </div>
            <div className="bg-[#173f52] text-white rounded-[10px] p-5">
              <h3 className="font-semibold mb-1">Need a phone repair?</h3>
              <p className="text-sm text-white/80 mb-3">Book a repair and we’ll quote first, then call you when it’s ready.</p>
              <Link href="/#repair" className="inline-block px-4 py-2 rounded-full bg-[#ff7a1a] font-semibold hover:bg-[#e66e15]">Book a repair</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}