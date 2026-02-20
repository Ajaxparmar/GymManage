"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  Calendar,
  Package,
  QrCode,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Star,
  Trophy,
  Phone,
} from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Member Management", desc: "Complete lifecycle — profiles, photos, emergency contacts, custom fields in one powerful dashboard." },
  { icon: CreditCard, title: "Smart Billing & Payments", desc: "Automated invoices, UPI/cash/card, dues tracking, reminders — reduce collection time dramatically." },
  { icon: MessageSquare, title: "WhatsApp Automation", desc: "Renewal reminders, birthday wishes, receipts, offers — sent automatically via WhatsApp." },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Live KPIs, revenue trends, member growth, exportable reports — data-driven decisions." },
  { icon: Calendar, title: "Trainer & Class Management", desc: "Schedules, member assignments, performance tracking, trainer payroll in one place." },
  { icon: Package, title: "Inventory & Supplies", desc: "Equipment, supplements, merchandise tracking with low-stock alerts." },
  { icon: QrCode, title: "Attendance & Access", desc: "QR check-in, biometric ready, daily logs, real-time occupancy insights." },
  { icon: Smartphone, title: "Branded Member App", desc: "Class booking, schedules, payments, updates — your gym in members' pockets." },
];

const STEPS = [
  { icon: CheckCircle2, title: "Sign Up Free", desc: "Create account in under 60 seconds. No card required." },
  { icon: CheckCircle2, title: "Setup Gym Profile", desc: "Add plans, trainers, branches & settings quickly." },
  { icon: CheckCircle2, title: "Import or Add Members", desc: "Excel upload or manual entry — zero data loss." },
  { icon: CheckCircle2, title: "Start Managing", desc: "Go live instantly with billing, alerts & analytics." },
];

const TESTIMONIALS = [
  { initials: "RS", name: "Rajesh Sharma", gym: "PowerHouse Gym, Delhi", text: "Reduced fee collection time by 70%. WhatsApp reminders transformed our retention." },
  { initials: "PN", name: "Priya Nair", gym: "FitZone, Bangalore", text: "Handling 400+ members became effortless. Best decision for scaling." },
  { initials: "AM", name: "Ankit Mehta", gym: "Iron Temple, Mumbai", text: "Analytics gave us insights we never had — revenue up 40% this year." },
  { initials: "SD", name: "Sunita Devi", gym: "Flex Studio, Jaipur", text: "Setup in one day. Support is outstanding. Highly recommended." },
];

const PLANS = [
  { name: "Starter", price: "999", badge: null, featured: false, features: ["Up to 100 Members", "Core Dashboard", "WhatsApp Reminders", "1 Admin", "Email Support"] },
  { name: "Growth", price: "1,999", badge: "Most Popular", featured: true, features: ["Up to 500 Members", "Advanced Analytics", "WhatsApp + SMS", "3 Admins", "Trainer Module", "Priority Support"] },
  { name: "Pro", price: "3,499", badge: null, featured: false, features: ["Unlimited Members", "Full Features", "Custom Branding", "Unlimited Admins", "Member App", "Inventory", "Dedicated Support"] },
];

function useScrollReveal() {
  useEffect(() => {
    const check = () => {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
          el.classList.add("in-view");
        }
      });
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-sm border-b border-slate-200 dark:border-slate-800"
            : "bg-transparent dark:bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-500 dark:from-cyan-500 dark:to-cyan-400 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-105 transition-transform">
              🏋️
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Gym<span className="text-cyan-600 dark:text-cyan-400">Sarathi</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {["Features", "How It Works", "Pricing", "Reviews"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s/g, "-")}`}
                className="text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block px-5 py-2.5 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/60 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 text-sm font-semibold mb-6 border border-cyan-200/70 dark:border-cyan-700/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 dark:bg-cyan-400"></span>
              </span>
              Trusted by 1,500+ Gyms Across India
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-8">
              Smart Gym Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-300 mt-2">
                Built for India
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl">
              One platform for members, billing, attendance, trainers, WhatsApp automation, analytics — designed for Indian fitness businesses.
            </p>

            <div className="flex flex-wrap gap-5">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 dark:from-cyan-500 dark:to-cyan-400 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all text-lg"
              >
                Start 14-Day Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 dark:hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all text-lg"
              >
                See Features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
              {["No credit card needed", "Setup in minutes", "Cancel anytime"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" /> {t}
                </div>
              ))}
            </div>
          </div>

          <div className="reveal hidden lg:block relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-900 dark:bg-black rotate-[-1deg] hover:rotate-0 transition-transform duration-700">
              <div className="bg-slate-800 dark:bg-slate-950 px-4 py-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">GymSarathi Dashboard</span>
              </div>
              <img
                src="/dashboard-preview.png"
                alt="Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-sm font-semibold mb-4">
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Everything Your Gym Needs</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              A complete, intuitive platform built for Indian gym owners — powerful yet simple.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="reveal group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 group-hover:bg-cyan-600 dark:group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Get Started in Minutes</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              No complicated setup — go live fast.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-200 to-cyan-400 dark:from-cyan-800 dark:to-cyan-600 transform -translate-y-1/2" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="reveal relative text-center z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-md">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-sm font-semibold mb-4">
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Simple & Transparent Plans</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">Choose the plan that fits your gym size and needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`reveal relative rounded-3xl p-8 md:p-10 bg-white dark:bg-slate-900 border transition-all duration-300 ${
                  plan.featured
                    ? "border-cyan-500 dark:border-cyan-400 shadow-2xl scale-[1.04] md:scale-[1.06]"
                    : "border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500 hover:shadow-xl"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-600 dark:bg-cyan-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl md:text-5xl font-black">₹{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-4 rounded-xl font-semibold transition ${
                    plan.featured
                      ? "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                      : "border border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section id="reviews" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-sm font-semibold mb-4">
              What Gym Owners Say
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Real Results, Real Stories</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="reveal bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.gym}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">“{t.text}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-cyan-600 to-blue-600 dark:from-cyan-800 dark:to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center reveal">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Ready to Transform Your Gym?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            Join hundreds of gym owners who save time and grow faster with GymSarathi.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-cyan-700 dark:bg-slate-900 dark:text-cyan-300 font-bold rounded-xl text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.03] transition-all"
            >
              Start Free 14-Day Trial
            </Link>
            <Link
              href="tel:+911234567890"
              className="inline-flex items-center gap-2 px-10 py-5 border-2 border-white/40 hover:border-white font-semibold rounded-xl text-lg transition-all"
            >
              <Phone className="w-5 h-5" /> Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-slate-950 dark:bg-black text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-500 flex items-center justify-center text-white text-2xl">
                  🏋️
                </div>
                <span className="text-2xl font-bold text-white">Gym<span className="text-cyan-400">Sarathi</span></span>
              </div>
              <p className="text-sm">
                Modern gym management software built for India.
                <br />
                Simple. Powerful. Affordable.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Integrations", "What's New"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Contact"] },
              { title: "Support", links: ["Help Center", "WhatsApp Support", "Privacy Policy", "Terms"] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-white font-semibold mb-5">{group.title}</h4>
                <ul className="space-y-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-cyan-400 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-sm">
            © {new Date().getFullYear()} GymSarathi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}