"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Users, CreditCard, MessageSquare, BarChart3, Calendar, Package,
  QrCode, Smartphone, ArrowRight, CheckCircle2, Star, Phone, Dumbbell,
  X, Shield, Building2, Fingerprint, FileSpreadsheet, Zap,
} from "lucide-react";

/* ─── DATA ─────────────────────────────────────────────── */

type PlanType = {
  name: string;
  price: string | null;
  label: string;
  badge: string | null;
  featured: boolean;
  addons?: { price: string; label: string }[];
  features: { text: string; icon: React.ComponentType }[];
  notIncluded?: string[];
};
const FEATURES = [
  { icon: Users,         title: "Member Management",     desc: "Complete profiles, photos, emergency contacts, renewal history — all in one powerful dashboard." },
  { icon: CreditCard,    title: "Smart Billing",         desc: "Automated invoices, UPI/cash/card, dues tracking and reminders — cut collection time by 70%." },
  { icon: MessageSquare, title: "WhatsApp Automation",   desc: "Renewal reminders, birthday wishes, receipts, offers — sent automatically, zero manual effort." },
  { icon: BarChart3,     title: "Real-time Analytics",   desc: "Live KPIs, revenue trends, member growth and exportable reports for data-driven decisions." },
  { icon: Calendar,      title: "Trainer & Classes",     desc: "Schedules, assignments, performance tracking and trainer payroll all in one place." },
  { icon: Package,       title: "Inventory Control",     desc: "Equipment, supplements and merchandise tracking with smart low-stock alerts." },
  { icon: QrCode,        title: "QR & Biometric Access", desc: "QR check-in, biometric-ready entry, daily logs and real-time occupancy monitoring." },
  { icon: Smartphone,    title: "Branded Member App",    desc: "Class booking, schedules, payments — your gym brand in every member's pocket." },
];

const STEPS = [
  { num: "01", title: "Sign Up Free",       desc: "Create your account in under 60 seconds. No card required." },
  { num: "02", title: "Setup Gym Profile",  desc: "Add plans, trainers, branches & settings in minutes." },
  { num: "03", title: "Import Members",     desc: "Excel upload or manual entry — zero data loss guaranteed." },
  { num: "04", title: "Go Live Instantly",  desc: "Start billing, tracking attendance and sending alerts right away." },
];

const PLANS = [
  {
    name: "Starter",
    price: "999",
    label: "For small gyms",
    badge: null,
    featured: false,
    features: [
      { text: "Up to 150 Members",        icon: Users },
      { text: "2 Admin Accounts",         icon: Shield },
      { text: "WhatsApp Reminders",       icon: MessageSquare },
      { text: "Basic Attendance Tracking",icon: QrCode },
      { text: "Billing & Payments",       icon: CreditCard },
      { text: "Email & Chat Support",     icon: Phone },
    ],
    notIncluded: ["Biometric Access", "Excel Import", "Multi-Branch", "Member App"],
  },
  {
    name: "Growth",
    price: "1,999",
    label: "For growing gyms",
    badge: "Most Popular",
    featured: true,
    features: [
      { text: "Up to 500 Members",            icon: Users },
      { text: "2 Admin Accounts",             icon: Shield },
      { text: "WhatsApp Reminders & Alerts",  icon: MessageSquare },
      { text: "Priority Support System",      icon: Phone },
      { text: "Biometric Access Ready",       icon: Fingerprint },
      { text: "All Members Attendance Log",   icon: QrCode },
      { text: "Excel Import / Export",        icon: FileSpreadsheet },
      { text: "Advanced Analytics",           icon: BarChart3 },
    ],
    notIncluded: ["Multi-Branch", "Member App", "Custom Branding"],
  },
  {
    name: "Enterprise",
    price: null,
    label: "Multi-branch powerhouse",
    badge: "Best Value",
    featured: false,
    addons: [
      { price: "3,999", label: "Up to 3 Gyms" },
      { price: "7,999", label: "Up to 10 Gyms" },
    ],
    features: [
      { text: "Unlimited Members",           icon: Users },
      { text: "Unlimited Admins",            icon: Shield },
      { text: "Everything in Growth",        icon: CheckCircle2 },
      { text: "Multiple Gym Branches",       icon: Building2 },
      { text: "Branded Member App",          icon: Smartphone },
      { text: "Custom Branding & Domain",    icon: Zap },
      { text: "Dedicated Account Manager",   icon: Phone },
      { text: "API Access & Integrations",   icon: Package },
    ],
    notIncluded: [],
  },
];

const TESTIMONIALS = [
  { initials: "RS", name: "Rajesh Sharma", gym: "PowerHouse Gym, Delhi",  text: "Reduced fee collection time by 70%. WhatsApp reminders transformed our retention rate completely." },
  { initials: "PN", name: "Priya Nair",    gym: "FitZone, Bangalore",     text: "Handling 400+ members became effortless. Best decision we made for scaling our business." },
  { initials: "AM", name: "Ankit Mehta",   gym: "Iron Temple, Mumbai",    text: "Analytics gave us insights we never had before — revenue is up 40% this year alone." },
  { initials: "SD", name: "Sunita Devi",   gym: "Flex Studio, Jaipur",    text: "Setup was done in one day. The support team is outstanding. Highly recommended for any gym." },
];

const STATS = [
  { value: "500+", label: "Gyms Onboarded" },
  { value: "50K+", label: "Members Managed" },
  { value: "99%",  label: "Uptime Guaranteed" },
  { value: "24/7", label: "Support Available" },
];

/* ─── HOOKS ─────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const check = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 70)
          el.classList.add("in-view");
      });
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);
}

/* ─── ANIMATED COUNTER ───────────────────────────────────── */
function CounterStat({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.]/g, "");
    let startTime: number | null = null;
    const step = (ts: number | null) => {
      if (!startTime) startTime = ts;
      if (ts !== null) {
        const p = ts !== null ? Math.min((ts - (startTime ?? ts)) / 1800, 1) : 0;
      }
      const p = ts !== null ? Math.min((ts - (startTime ?? ts)) / 1800, 1) : 0;
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(ease * num) + suffix);
      if (p < 1) requestAnimationFrame(step);
      else setDisplay(num + suffix);
    };
    requestAnimationFrame(step);
  }, [started, value]);

  return (
    <div ref={ref} className="bg-white dark:bg-zinc-950 px-8 py-7 text-center">
      <p className="text-3xl md:text-4xl font-black gradient-text">{display}</p>
      <p className="text-sm text-zinc-500 font-medium mt-1">{label}</p>
    </div>
  );
}

/* ─── FLOATING PARTICLES ─────────────────────────────────── */
function Particles({ count = 10 }) {
  const randomValues = useMemo(() => {
    const generateRandomValues = () =>
      Array.from({ length: count }, () => ({
        size: Math.random() * 5 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.35 + 0.08,
        delay: Math.random() * 6,
        duration: Math.random() * 8 + 7,
      }));
    return generateRandomValues();
  }, [count]);

  const items = useMemo(() => {
    return randomValues.map((random, i) => ({
      ...random,
      color: i % 3 === 0 ? "#f97316" : i % 3 === 1 ? "#ef4444" : "#fb923c",
    }));
  }, [randomValues]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((p, i) => (
        <div key={i} className="particle absolute rounded-full"
          style={{
            width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`,
            background: p.color, opacity: p.opacity,
            animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
          }}/>
      ))}
    </div>
  );
}

/* ─── SCROLL PROGRESS BAR ────────────────────────────────── */
function ScrollBar() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setW((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${w}%`,
        height: "4px",
        backgroundColor: "#f97316",
        zIndex: 1000,
        transition: "width 0.2s ease-out",
      }}
    />
  );
}

/* ─── PLAN CARD ───────────────────────────────────────────── */
function PlanCard({ plan, i }: { plan: PlanType; i: number }) {
  return (
    <div
      className={`reveal relative rounded-3xl transition-all duration-500 flex flex-col
        ${plan.featured
          ? "bg-gradient-to-b from-orange-500 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/40 scale-[1.04] md:scale-[1.06] z-10"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1"
        }`}
      style={{ transitionDelay: `${i * 100}ms`, transition: "all .4s ease" }}
    >
      {plan.badge && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap
          ${plan.featured ? "bg-zinc-900 text-white" : "bg-gradient-to-r from-orange-500 to-red-500 text-white"}`}>
          ⭐ {plan.badge}
        </div>
      )}

      <div className="p-8 md:p-10 flex flex-col flex-1">
        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.featured ? "text-orange-100" : "text-orange-500"}`}>{plan.label}</p>
        <h3 className={`text-2xl font-black mb-5 ${plan.featured ? "text-white" : ""}`}>{plan.name}</h3>

        {/* Price */}
        {plan.addons ? (
          <div className="mb-6 space-y-2">
            {plan.addons.map((a) => (
              <div key={a.label} className={`flex items-center justify-between rounded-xl px-4 py-3 ${plan.featured ? "bg-white/10" : "bg-orange-50 dark:bg-zinc-800"}`}>
                <span className={`text-sm font-semibold ${plan.featured ? "text-orange-100" : "text-zinc-600 dark:text-zinc-300"}`}>{a.label}</span>
                <span className={`text-xl font-black ${plan.featured ? "text-white" : "gradient-text"}`}>
                  ₹{a.price}<span className={`text-xs font-normal ml-1 ${plan.featured ? "text-orange-200" : "text-zinc-400"}`}>/mo</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-baseline mb-6">
            <span className={`text-5xl font-black ${plan.featured ? "text-white" : "gradient-text"}`}>₹{plan.price}</span>
            <span className={`ml-2 text-sm ${plan.featured ? "text-orange-100" : "text-zinc-500"}`}>/month</span>
          </div>
        )}

        {/* Feature list */}
        <ul className="space-y-3 mb-6 flex-1">
          {plan.features.map((f) => (
            <li key={f.text} className={`flex items-center gap-3 text-sm ${plan.featured ? "text-orange-50" : "text-zinc-700 dark:text-zinc-300"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.featured ? "bg-white/20" : "bg-orange-100 dark:bg-orange-950/40"}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${plan.featured ? "text-white" : "text-orange-500"}`} />
              </div>
              {f.text}
            </li>
          ))}
          {(plan.notIncluded ?? []).length > 0 && (
            <>
              <li className={`text-xs pt-2 pb-1 font-bold uppercase tracking-wider ${plan.featured ? "text-orange-200" : "text-zinc-400"}`}>Not included</li>
              {(plan.notIncluded ?? []).map((f) => (
                <li key={f} className={`flex items-center gap-3 text-sm opacity-40 ${plan.featured ? "text-white" : "text-zinc-500"}`}>
                  <X className="w-4 h-4 flex-shrink-0" /> {f}
                </li>
              ))}
            </>
          )}
        </ul>

        <Link
          href={plan.addons ? "/contact" : "/signup"}
          className={`block text-center py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
            plan.featured
              ? "bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
              : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/30"
          }`}
        >
          {plan.addons ? "Contact Sales →" : "Start Free Trial →"}
        </Link>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }

        /* Scroll reveal */
        .reveal { opacity:0; transform:translateY(30px); transition:opacity .65s ease, transform .65s ease; }
        .reveal.in-view { opacity:1; transform:translateY(0); }

        /* Gradient text */
        .gradient-text {
          background:linear-gradient(135deg,#f97316 0%,#ef4444 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        /* Glow orb */
        .hero-glow {
          position:absolute; border-radius:50%; pointer-events:none;
          background:radial-gradient(circle,rgba(249,115,22,.13) 0%,transparent 70%);
        }

        /* Floating particle */
        @keyframes float {
          0%,100% { transform:translateY(0) rotate(0deg); }
          33%      { transform:translateY(-20px) rotate(120deg); }
          66%      { transform:translateY(10px) rotate(240deg); }
        }
        .particle { animation:float linear infinite; }

        /* Ping dot */
        @keyframes ping {
          75%,100% { transform:scale(2.2); opacity:0; }
        }
        .ping-dot { animation:ping 2s cubic-bezier(0,0,.2,1) infinite; }

        /* Shimmer */
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .shimmer::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);
          animation:shimmer 2.8s infinite;
        }

        /* Feature icon hover */
        .feature-card:hover .feat-icon {
          background:linear-gradient(135deg,#f97316,#ef4444) !important;
          color:white !important;
          transform:scale(1.12) rotate(-4deg);
        }
        .feat-icon { transition:all .3s ease; }

        /* Tilt hover */
        .tilt:hover { transform:translateY(-6px) rotate(-0.4deg); }
        .tilt { transition:transform .35s ease, box-shadow .35s ease; }

        /* Underline nav anim */
        .nav-link::after {
          content:''; display:block; height:2px; background:#f97316;
          transform:scaleX(0); transform-origin:left; transition:transform .25s ease;
        }
        .nav-link:hover::after { transform:scaleX(1); }

        /* Footer link arrow */
        .footer-link:hover { padding-left:8px; color:#fb923c; }
        .footer-link { transition:padding-left .2s ease, color .2s ease; }

        /* Badge bounce */
        @keyframes badge-bounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%      { transform:translateX(-50%) translateY(-5px); }
        }
        .bounce-badge { animation:badge-bounce 2.8s ease-in-out infinite; }

        /* WhatsApp notification float */
        @keyframes float-up {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-8px); }
        }
        .float-notif { animation:float-up 3s ease-in-out infinite; }
      `}</style>

      <ScrollBar />

      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-sm border-b border-zinc-200 dark:border-zinc-800"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Manage<span className="text-orange-500">Gym</span><span className="text-zinc-400 dark:text-zinc-500">24</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {["Features", "How It Works", "Pricing", "Reviews"].map((label) => (
              <a key={label} href={`#${label.toLowerCase().replace(/\s/g, "-")}`}
                className="nav-link text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 font-medium text-sm tracking-wide transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pages/login"
              className="hidden sm:block px-5 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 font-medium transition text-sm">
              Login
            </Link>
            <Link href="/pages/Contactform"
              className="relative overflow-hidden shimmer px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all text-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 md:pt-44 md:pb-36 bg-gradient-to-br from-zinc-50 via-white to-orange-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 overflow-hidden">
        <Particles count={14} />
        <div className="hero-glow w-[700px] h-[700px] top-[-180px] left-[-180px]" />
        <div className="hero-glow w-[500px] h-[500px] bottom-[-120px] right-[-100px]"
          style={{ background: "radial-gradient(circle,rgba(239,68,68,.09) 0%,transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="reveal inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-100/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-8 border border-orange-200/70 dark:border-orange-700/40">
              <span className="relative flex h-2.5 w-2.5">
                <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              Trusted by 500+ Gyms Across India
            </div>

            <h1 className="reveal text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-8"
              style={{ transitionDelay: "100ms" }}>
              Gym Management
              <span className="block gradient-text mt-2">Made Simple.</span>
              <span className="block text-zinc-400 dark:text-zinc-600 text-4xl md:text-5xl mt-3 font-bold">Built for India.</span>
            </h1>

            <p className="reveal text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-10 max-w-lg"
              style={{ transitionDelay: "200ms" }}>
              One platform for members, billing, attendance, trainers, WhatsApp automation, and analytics — designed for Indian fitness businesses.
            </p>

            <div className="reveal flex flex-wrap gap-4 mb-10" style={{ transitionDelay: "300ms" }}>
              <Link href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-xl hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all text-base">
                Start 30-Day Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl font-semibold text-zinc-700 dark:text-zinc-300 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-500 transition-all text-base">
                See Features
              </a>
            </div>

            <div className="reveal flex flex-wrap gap-6 text-sm text-zinc-500" style={{ transitionDelay: "400ms" }}>
              {["No credit card needed", "30-day free trial", "Cancel anytime"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Mock Dashboard */}
          <div className="reveal hidden lg:flex flex-col gap-4" style={{ transitionDelay: "250ms" }}>
            <div className="tilt rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 rotate-1">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Today&apos;s Overview</p>
                  <p className="text-lg font-black mt-0.5">ManageGym24 Dashboard</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md">
                  <Dumbbell className="w-4 h-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Active Members", value: "248",   sub: "+12 today",      up: true },
                  { label: "Revenue (Month)", value: "₹1.8L", sub: "+18% vs last", up: true },
                  { label: "Renewals Due",   value: "34",    sub: "Action needed",  up: false },
                  { label: "Checked In",     value: "87",    sub: "Live tracking",  up: true },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3.5">
                    <p className="text-xs text-zinc-500 font-medium mb-1">{s.label}</p>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className={`text-xs mt-0.5 font-semibold ${s.up ? "text-emerald-500" : "text-orange-500"}`}>{s.sub}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Monthly Goal Progress</span>
                  <span className="font-bold text-orange-500">72%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="relative overflow-hidden shimmer h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: "72%" }} />
                </div>
              </div>
            </div>

            {/* WhatsApp notification badge */}
            <div className="float-notif self-end">
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 shadow-xl">
                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">WhatsApp Sent ✓</p>
                  <p className="text-xs text-zinc-500">34 renewal reminders · just now</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0 ping-dot" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 mt-20 reveal">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            {STATS.map((s) => <CounterStat key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-28 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-4 border border-orange-200/60 dark:border-orange-700/40">
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">Everything Your Gym Needs</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">A complete, intuitive platform built for Indian gym owners — powerful yet simple.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className="feature-card reveal tilt bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-7 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-2xl hover:shadow-orange-500/8 cursor-default"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="feat-icon w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-500 dark:text-orange-400 mb-5">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-4 border border-orange-200/60 dark:border-orange-700/40">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">Get Started in Minutes</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">No complicated setup — go live fast.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent dark:via-orange-600" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="reveal relative text-center z-10" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/25 hover:scale-105 transition-transform cursor-default">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-4 border border-orange-200/60 dark:border-orange-700/40">
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">Simple & Transparent Plans</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Choose the plan that fits your gym. All plans include a{" "}
              <span className="font-bold text-orange-500">30-day free trial</span>.
            </p>
          </div>

          {/* Trial banner */}
          <div className="reveal mb-12">
            <div className="max-w-2xl mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                🎉 <span className="text-orange-600 dark:text-orange-400">30-Day Free Trial</span> on all plans — No credit card required · Cancel anytime
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {PLANS.map((plan, i) => <PlanCard key={plan.name} plan={plan} i={i} />)}
          </div>

          <p className="text-center text-sm text-zinc-400 mt-10">
            All prices exclude GST · Annual billing available (save 20%) ·{" "}
            <a href="/contact" className="text-orange-500 hover:underline font-semibold">Need a custom quote?</a>
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section id="reviews" className="py-28 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-block px-5 py-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-4 border border-orange-200/60 dark:border-orange-700/40">
              What Gym Owners Say
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">Real Results, Real Stories</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Join hundreds of gym owners already managing smarter.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name}
                className="reveal tilt bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-800"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{t.gym}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current text-orange-400" />)}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">&quot;{t.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden bg-zinc-950 dark:bg-black">
        <Particles count={16} />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-red-500/8 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-orange-500/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold mb-8 border border-orange-500/30">
            🚀 Free for 30 Days — No Credit Card Needed
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-white">
            Ready to Transform<br />
            <span className="gradient-text">Your Gym?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Join 500+ gym owners who save hours every week and grow faster with ManageGym24.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl text-lg shadow-2xl shadow-orange-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all">
              Start Free 30-Day Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="tel:+911234567890"
              className="inline-flex items-center gap-2 px-10 py-5 border-2 border-zinc-700 hover:border-orange-500 text-zinc-300 hover:text-orange-400 font-semibold rounded-xl text-lg transition-all">
              <Phone className="w-5 h-5" /> Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-zinc-950 dark:bg-black border-t border-zinc-900 text-zinc-500 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-white">
                  Manage<span className="text-orange-500">Gym</span><span className="text-zinc-600">24</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-5">Modern gym management built for India.<br />Simple. Powerful. Affordable.</p>
              <div className="flex gap-3">
                {["📘", "🐦", "📸"].map((emoji, idx) => (
                  <a key={idx} href="#"
                    className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-orange-500 hover:text-orange-400 flex items-center justify-center text-sm transition-all hover:scale-110">
                    {emoji}
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Product",  links: ["Features", "Pricing", "Integrations", "What's New"] },
              { title: "Company",  links: ["About Us", "Blog", "Careers", "Contact"] },
              { title: "Support",  links: ["Help Center", "WhatsApp Support", "Privacy Policy", "Terms"] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{group.title}</h4>
                <ul className="space-y-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="footer-link hover:text-orange-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <span>© {new Date().getFullYear()} ManageGym24. All rights reserved.</span>
            <span className="text-zinc-700">Made with ❤️ for Indian Gym Owners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}