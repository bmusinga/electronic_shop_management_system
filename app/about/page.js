import { Shield, Heart, Lightbulb } from "lucide-react";
import Link from "next/link";

const teamMembers = [
  {
    name: "James Mitchell",
    role: "Founder & CEO",
    bio: "Visionary leader with 15+ years in tech retail",
    initials: "JM",
  },
  {
    name: "Sarah Chen",
    role: "Head of Operations",
    bio: "Expert in supply chain and customer experience",
    initials: "SC",
  },
  {
    name: "Marcus Rodriguez",
    role: "Tech Lead",
    bio: "Certified specialist in consumer electronics",
    initials: "MR",
  },
  {
    name: "Emily Watson",
    role: "Customer Relations",
    bio: "Dedicated to ensuring customer satisfaction",
    initials: "EW",
  },
];

const values = [
  {
    title: "Quality First",
    icon: Shield,
    description:
      "Every product we stock is rigorously tested and verified for quality and performance.",
  },
  {
    title: "Customer Focus",
    icon: Heart,
    description:
      "Our customers are at the heart of everything we do. We provide personalized support and expert guidance.",
  },
  {
    title: "Innovation",
    icon: Lightbulb,
    description:
      "We stay ahead of the curve, constantly updating our inventory with the latest technology.",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-slate-900 dark:bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            About Voltex
          </h1>
          <p className="text-xl text-slate-300">
            Your trusted partner in technology since 2015
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
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
            <div className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-12 flex items-center justify-center sk-panel-inset">
              <span className="text-2xl font-semibold text-primary [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                Our Store
              </span>
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
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="sk-panel p-8 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-full sk-icon bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="text-center sk-panel p-6"
              >
                <div className="w-20 h-20 rounded-full sk-icon bg-slate-200/70 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-semibold text-slate-600 dark:text-slate-300">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
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
