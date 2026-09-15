"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. For in-store purchases, we also accept debit cards and cash.",
  },
  {
    question: "Do you offer warranties on your products?",
    answer:
      "Yes, all our products come with a minimum 1-year manufacturer warranty. We also offer extended warranty plans for up to 3 years on select items for added peace of mind.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy on most items. Products must be in their original condition with all packaging. Electronics that have been activated may have different return terms. Contact our support team for specific return requests.",
  },
  {
    question: "Do you provide technical support?",
    answer:
      "Absolutely. Our team of certified technicians can help with product setup, troubleshooting, and repairs. You can reach our support team 24/7 via phone, email, or live chat.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12 [text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]">
          Frequently Asked Questions
        </h2>

        <div className="sk-panel divide-y divide-border-light dark:divide-border-dark overflow-hidden">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index}>
                <button
                  onClick={() => toggle(index)}
                  className={`w-full flex items-center justify-between px-6 py-5 text-left transition-all duration-150 ${
                    isOpen
                      ? "bg-gradient-to-b from-[#eef4fb] to-[#dde6f0] dark:from-[#18202e] dark:to-[#101823] shadow-[inset_0_2px_5px_rgba(15,23,42,0.1)]"
                      : "bg-gradient-to-b from-[var(--sk-panel-top)] to-[var(--sk-panel-bottom)] hover:bg-gradient-to-b hover:from-white hover:to-[#eef2f7] dark:hover:from-[#1d2735] dark:hover:to-[#131c29]"
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-slate-900 dark:text-white pr-4 [text-shadow:0_1px_0_rgba(255,255,255,0.6)] dark:[text-shadow:none]">
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-b from-white to-[#e2e8f0] dark:from-[#2a3a50] dark:to-[#16202f] border border-border-light dark:border-border-dark flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.16)] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(15,23,42,0.2)] transition-all duration-150`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5">
                    <div className="sk-panel-inset px-4 py-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}