import { Phone, MapPin, Mail } from "lucide-react";

const hours = [
  { day: "Mon - Fri", time: "8AM - 8PM" },
  { day: "Saturday", time: "9AM - 6PM" },
  { day: "Sunday", time: "10AM - 5PM" },
];

const contactInfo = [
  { icon: MapPin, text: "123 Electronics Ave, Tech City, TC 10001" },
  { icon: Phone, text: "+1 (555) 123-4567" },
  { icon: Mail, text: "support@voltex.com" },
];

const headingShadow =
  "[text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]";

export default function BusinessInfo() {
  return (
    <section className="bg-white pt-4 pb-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className={`text-3xl font-bold text-slate-900 dark:text-white ${headingShadow}`}>
              About Voltex
            </h2>

            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
              Voltex has been a leading electronics retailer since 2015,
              providing customers with the latest and most reliable technology
              products on the market. We are committed to offering competitive
              prices, expert guidance, and a seamless shopping experience whether
              you shop online or visit us in store. Our knowledgeable team
              carefully selects every product to ensure quality and performance,
              so you can shop with confidence.
            </p>

            <div className="mt-8 space-y-4">
              <h3 className={`text-lg font-semibold text-slate-900 dark:text-white ${headingShadow}`}>
                Business Hours
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {hours.map(({ day, time }) => (
                  <li key={day} className="flex justify-between items-center px-3 py-2 rounded-lg sk-panel-inset">
                    <span>{day}</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {contactInfo.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sk-icon bg-[#2563EB]/10">
                    <Icon className="h-4 w-4 text-[#2563EB]" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg sk-panel-inset bg-slate-100 dark:bg-slate-800">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.966309594078!2d-73.99078228459418!3d40.74076597932708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle%20New%20York!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Voltex store location"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}