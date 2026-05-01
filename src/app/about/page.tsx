import { Mountain, Target, Users, Wallet, Globe, Heart } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">About {SITE_NAME}</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Making Swiss activities accessible, affordable, and easy to compare — for everyone.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-8 md:p-12">
          <Target className="h-10 w-10 text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            Switzerland is home to some of the world&apos;s most incredible experiences — from soaring alpine peaks
            to world-class museums and thrilling adventures. But navigating pricing across different providers,
            especially for students and families, can be overwhelming. {SITE_NAME} exists to bring transparency
            to activity pricing and help everyone discover what Switzerland has to offer, regardless of budget.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What We Stand For</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Wallet className="h-8 w-8 text-green-600" />,
              title: "Price Transparency",
              desc: "Clear pricing for every age group. No hidden fees, no surprises. Compare before you commit.",
            },
            {
              icon: <Users className="h-8 w-8 text-blue-600" />,
              title: "For Everyone",
              desc: "Students, families, seniors — everyone deserves to experience Switzerland's best activities.",
            },
            {
              icon: <Mountain className="h-8 w-8 text-purple-600" />,
              title: "Seasonal Intelligence",
              desc: "We show you what's available now, adapting our recommendations to the current season.",
            },
            {
              icon: <Globe className="h-8 w-8 text-orange-600" />,
              title: "Local & Authentic",
              desc: "We feature authentic Swiss experiences — from iconic landmarks to hidden local gems.",
            },
            {
              icon: <Heart className="h-8 w-8 text-red-600" />,
              title: "Budget-Friendly",
              desc: "Switzerland doesn't have to be expensive. We highlight free and affordable options.",
            },
            {
              icon: <Target className="h-8 w-8 text-teal-600" />,
              title: "Independent",
              desc: "Our recommendations are honest. We're not owned by any activity provider.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border bg-white p-6">
              {item.icon}
              <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl bg-gray-900 p-8 md:p-12 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Get in Touch</h2>
        <p className="text-gray-300 mb-6 max-w-lg mx-auto">
          Have suggestions, found incorrect information, or want to partner with us?
          We&apos;d love to hear from you.
        </p>
        <a
          href="mailto:hello@realswitzerland.ch"
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-medium hover:bg-red-700 transition-colors"
        >
          hello@realswitzerland.ch
        </a>
      </section>
    </div>
  );
}
