// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import {
//   Dumbbell, Phone, Mail, MapPin, MessageSquare,
//   ArrowRight, CheckCircle2, Send, User, Building2,
//   Users, ChevronDown, Loader2,
// } from "lucide-react";

// const INTERESTS = [
//   "Starter Plan (₹999/mo)",
//   "Growth Plan (₹1,999/mo)",
//   "Enterprise — 3 Gyms (₹3,999/mo)",
//   "Enterprise — 10 Gyms (₹7,999/mo)",
//   "Custom / Demo Request",
//   "General Inquiry",
// ];

// const GYM_SIZES = [
//   "Under 50 members",
//   "50–150 members",
//   "150–500 members",
//   "500+ members",
//   "Multiple branches",
// ];

// const CONTACT_INFO = [
//   {
//     icon: Phone,
//     label: "Call Us",
//     value: "+91 7015822199",
//     sub: "Mon–Sat, 9am–7pm IST",
//     href: "tel:+917201000220",
//     color: "orange",
//   },
//   {
//     icon: MessageSquare,
//     label: "WhatsApp",
//     value: "Chat with Us",
//     sub: "Quick replies guaranteed",
//     href: "https://wa.me/917201000220",
//     color: "green",
//   },
//   {
//     icon: Mail,
//     label: "Email",
//     value: "hello@managegym24.com",
//     sub: "We reply within 2 hours",
//     href: "mailto:hello@managegym24.com",
//     color: "blue",
//   },
//   {
//     icon: MapPin,
//     label: "Office",
//     value: "Bangalore, India",
//     sub: "Serving gyms pan-India",
//     href: "#",
//     color: "red",
//   },
// ];

// const colorMap = {
//   orange: {
//     bg: "bg-orange-100 dark:bg-orange-950/40",
//     icon: "text-orange-500 dark:text-orange-400",
//     border: "border-orange-200 dark:border-orange-800",
//     hover: "hover:border-orange-400 dark:hover:border-orange-600",
//   },
//   green: {
//     bg: "bg-green-100 dark:bg-green-950/40",
//     icon: "text-green-600 dark:text-green-400",
//     border: "border-green-200 dark:border-green-800",
//     hover: "hover:border-green-400 dark:hover:border-green-600",
//   },
//   blue: {
//     bg: "bg-blue-100 dark:bg-blue-950/40",
//     icon: "text-blue-600 dark:text-blue-400",
//     border: "border-blue-200 dark:border-blue-800",
//     hover: "hover:border-blue-400 dark:hover:border-blue-600",
//   },
//   red: {
//     bg: "bg-red-100 dark:bg-red-950/40",
//     icon: "text-red-500 dark:text-red-400",
//     border: "border-red-200 dark:border-red-800",
//     hover: "hover:border-red-400 dark:hover:border-red-600",
//   },
// };

// export default function ContactForm() {
//   const [form, setForm] = useState({
//     name: "", gymName: "", phone: "", email: "",
//     gymSize: "", interest: "", message: "",
//   });
//   const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [focused, setFocused] = useState("");

//   const validate = () => {
//     const e: Partial<Record<keyof typeof form, string>> = {};
//     if (!form.name.trim())    e.name    = "Your name is required";
//     if (!form.phone.trim())   e.phone   = "Phone number is required";
//     else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
//                               e.phone   = "Enter a valid 10-digit Indian number";
//     if (form.email && !/\S+@\S+\.\S+/.test(form.email))
//                               e.email   = "Enter a valid email address";
//     if (!form.interest)       e.interest = "Please select your interest";
//     return e;
//   };

//   const handleSubmit = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setLoading(true);
//     await new Promise((r) => setTimeout(r, 1800));
//     setLoading(false);
//     setSubmitted(true);
//   };

//   const set = (field: keyof typeof form) => (ev: { target: { value: unknown; }; }) => {
//     setForm((f) => ({ ...f, [field]: ev.target.value }));
//     if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
//   };

//   const inputBase = (field: keyof typeof form) =>
//     `w-full bg-zinc-50 dark:bg-zinc-800/60 border rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600
//     ${errors[field]
//       ? "border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-950/10"
//       : focused === field
//       ? "border-orange-400 dark:border-orange-500 shadow-sm shadow-orange-500/15 bg-white dark:bg-zinc-800"
//       : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
//     } text-zinc-800 dark:text-zinc-100`;

//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-20">
//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
//           * { font-family: 'Outfit', sans-serif; }
//           .gradient-text {
//             background: linear-gradient(135deg,#f97316 0%,#ef4444 100%);
//             -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
//           }
//           @keyframes pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
//           .pop { animation: pop .5s cubic-bezier(.34,1.56,.64,1) forwards; }
//           @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
//           .float { animation: float 3s ease-in-out infinite; }
//         `}</style>
//         <div className="text-center max-w-md">
//           <div className="pop w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 float">
//             <CheckCircle2 className="w-12 h-12 text-white" />
//           </div>
//           <h2 className="text-4xl font-black text-white mb-4">
//             We&apos;ll Be in <span className="gradient-text">Touch!</span>
//           </h2>
//           <p className="text-zinc-400 leading-relaxed mb-8">
//             Thanks <span className="text-white font-bold">{form.name.split(" ")[0]}</span>! Our team will reach out within
//             <span className="text-orange-400 font-bold"> 2 hours</span> on WhatsApp or phone.
//           </p>
//           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 text-left">
//             <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-3">Your submission</p>
//             {[
//               { label: "Name", value: form.name },
//               { label: "Phone", value: form.phone },
//               { label: "Gym", value: form.gymName || "Not provided" },
//               { label: "Interest", value: form.interest },
//             ].map((r) => (
//               <div key={r.label} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
//                 <span className="text-xs text-zinc-500">{r.label}</span>
//                 <span className="text-xs text-zinc-300 font-semibold">{r.value}</span>
//               </div>
//             ))}
//           </div>
//           <Link href="/"
//             className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all">
//             Back to Home <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
//         * { font-family: 'Outfit', sans-serif; }

//         .gradient-text {
//           background: linear-gradient(135deg,#f97316 0%,#ef4444 100%);
//           -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
//         }

//         @keyframes ping {
//           75%,100% { transform:scale(2.2); opacity:0; }
//         }
//         .ping-dot { animation: ping 2s cubic-bezier(0,0,.2,1) infinite; }

//         @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
//         .shimmer::after {
//           content:''; position:absolute; inset:0;
//           background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
//           animation:shimmer 2.8s infinite;
//         }

//         @keyframes float-in {
//           from { opacity:0; transform:translateY(24px); }
//           to   { opacity:1; transform:translateY(0); }
//         }
//         .float-in { animation: float-in .55s ease forwards; }
//         .float-in-1 { animation-delay:.05s; opacity:0; }
//         .float-in-2 { animation-delay:.12s; opacity:0; }
//         .float-in-3 { animation-delay:.20s; opacity:0; }
//         .float-in-4 { animation-delay:.28s; opacity:0; }

//         .hero-glow {
//           position:absolute; border-radius:50%; pointer-events:none;
//           background:radial-gradient(circle,rgba(249,115,22,.13) 0%,transparent 70%);
//         }

//         .contact-card { transition: transform .3s ease, box-shadow .3s ease; }
//         .contact-card:hover { transform:translateY(-4px); }

//         /* Label float animation */
//         .input-wrap { position:relative; }
//         .floating-label {
//           position:absolute; left:16px; top:50%; transform:translateY(-50%);
//           font-size:13px; font-weight:500; color:#a1a1aa;
//           transition:all .2s ease; pointer-events:none;
//         }
//         .input-wrap:focus-within .floating-label,
//         .input-wrap.has-value .floating-label {
//           top:6px; transform:translateY(0); font-size:10px; color:#f97316; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
//         }
//         .floating-input {
//           padding-top:18px !important; padding-bottom:8px !important;
//         }
//       `}</style>

//       {/* ── NAV ── */}
//       <nav className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-18 py-4">
//           <Link href="/" className="flex items-center gap-3 group">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
//               <Dumbbell className="w-5 h-5" />
//             </div>
//             <span className="text-2xl font-extrabold tracking-tight">
//               Manage<span className="text-orange-500">Gym</span><span className="text-zinc-400 dark:text-zinc-500">24</span>
//             </span>
//           </Link>
//           <Link href="/"
//             className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-1.5">
//             ← Back to Home
//           </Link>
//         </div>
//       </nav>

//       {/* ── HERO ── */}
//       <div className="relative bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 overflow-hidden py-16 md:py-20">
//         <div className="hero-glow w-[600px] h-[600px] top-[-200px] right-[-100px]" />
//         <div className="hero-glow w-[400px] h-[400px] bottom-[-100px] left-[-50px]"
//           style={{ background: "radial-gradient(circle,rgba(239,68,68,.09) 0%,transparent 70%)" }} />

//         <div className="relative max-w-4xl mx-auto px-6 text-center">
//           <div className="float-in float-in-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-100/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-6 border border-orange-200/70 dark:border-orange-700/40">
//             <span className="relative flex h-2.5 w-2.5">
//               <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
//               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
//             </span>
//             60-Day Free Trial · No Credit Card Required
//           </div>
//           <h1 className="float-in float-in-2 text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5">
//             Let&apos;s Grow Your<br />
//             <span className="gradient-text">Gym Together</span>
//           </h1>
//           <p className="float-in float-in-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8">
//             Fill in your details and our team will reach out within <span className="font-bold text-zinc-800 dark:text-zinc-200">2 hours</span> to get you set up.
//           </p>

//           {/* Quick contact chips */}
//           <div className="float-in float-in-4 flex flex-wrap justify-center gap-3">
//             {[
//               { label: "📞 Call Now", href: "tel:+917015822199" },
//               { label: "💬 WhatsApp", href: "https://wa.me/7201000220" },
//               { label: "✉️ Email Us", href: "mailto:hello@managegym24.com" },
//             ].map((c) => (
//               <a key={c.label} href={c.href}
//                 className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-orange-400 dark:hover:border-orange-600 hover:text-orange-500 shadow-sm hover:shadow-md transition-all">
//                 {c.label}
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── MAIN CONTENT ── */}
//       <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 grid lg:grid-cols-5 gap-12">

//         {/* ── LEFT — Contact Info ── */}
//         <div className="lg:col-span-2 space-y-5">
//           <div>
//             <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Get in Touch</p>
//             <h2 className="text-3xl font-black mb-3">We&apos;re Here to Help</h2>
//             <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
//               Whether you&apos;re a single gym or running multiple branches, we have the right plan for you. Reach out and let&apos;s talk.
//             </p>
//           </div>

//           {/* Contact cards */}
//           <div className="space-y-3">
//             {CONTACT_INFO.map((c) => {
//               const col = colorMap[c.color as keyof typeof colorMap];
//               return (
//                 <a key={c.label} href={c.href}
//                   className={`contact-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border ${col.border} ${col.hover} shadow-sm hover:shadow-lg transition-all group`}>
//                   <div className={`w-12 h-12 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
//                     <c.icon className={`w-5 h-5 ${col.icon}`} />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-0.5">{c.label}</p>
//                     <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{c.value}</p>
//                     <p className="text-xs text-zinc-500">{c.sub}</p>
//                   </div>
//                   <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
//                 </a>
//               );
//             })}
//           </div>

//           {/* Trust badges */}
//           <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
//             <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Why 500+ Gyms Trust Us</p>
//             <div className="space-y-3">
//               {[
//                 { icon: "⚡", text: "Setup done in under 1 day" },
//                 { icon: "🛡️", text: "99% uptime, your data is safe" },
//                 { icon: "🎯", text: "Dedicated onboarding support" },
//                 { icon: "💰", text: "30-day free trial, no card needed" },
//               ].map((b) => (
//                 <div key={b.text} className="flex items-center gap-3 text-sm">
//                   <span className="text-base">{b.icon}</span>
//                   <span className="text-zinc-600 dark:text-zinc-400 font-medium">{b.text}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ── RIGHT — Form ── */}
//         <div className="lg:col-span-3">
//           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-10 shadow-xl shadow-zinc-900/5 dark:shadow-none">
//             <div className="mb-8">
//               <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Contact Form</p>
//               <h3 className="text-2xl font-black">Tell Us About Your Gym</h3>
//               <p className="text-sm text-zinc-500 mt-1">All fields marked <span className="text-red-500 font-bold">*</span> are required</p>
//             </div>

//             <div className="space-y-5">
//               {/* Name + Gym row */}
//               <div className="grid sm:grid-cols-2 gap-4">
//                 {/* Name */}
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
//                     Your Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
//                     <input
//                       type="text" placeholder="e.g. Rahul Sharma"
//                       value={form.name} onChange={set("name")}
//                       onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
//                       className={`${inputBase("name")} pl-10`}
//                     />
//                   </div>
//                   {errors.name && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name}</p>}
//                 </div>

//                 {/* Gym Name */}
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
//                     Gym Name
//                   </label>
//                   <div className="relative">
//                     <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
//                     <input
//                       type="text" placeholder="e.g. Iron Temple"
//                       value={form.gymName} onChange={set("gymName")}
//                       onFocus={() => setFocused("gymName")} onBlur={() => setFocused("")}
//                       className={`${inputBase("gymName")} pl-10`}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Phone + Email row */}
//               <div className="grid sm:grid-cols-2 gap-4">
//                 {/* Phone */}
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
//                     Phone Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
//                       <span className="text-sm">🇮🇳</span>
//                       <span className="text-xs font-bold text-zinc-500">+91</span>
//                     </div>
//                     <input
//                       type="tel" placeholder="98765 43210"
//                       value={form.phone} onChange={set("phone")}
//                       onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
//                       className={`${inputBase("phone")} pl-16`}
//                       maxLength={10}
//                     />
//                   </div>
//                   {errors.phone && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone}</p>}
//                 </div>

//                 {/* Email */}
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
//                     Email Address
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
//                     <input
//                       type="email" placeholder="you@example.com"
//                       value={form.email} onChange={set("email")}
//                       onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
//                       className={`${inputBase("email")} pl-10`}
//                     />
//                   </div>
//                   {errors.email && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>}
//                 </div>
//               </div>

//               {/* Gym size + Interest row */}
//               <div className="grid sm:grid-cols-2 gap-4">
//                 {/* Gym Size */}
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
//                     Gym Size
//                   </label>
//                   <div className="relative">
//                     <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
//                     <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
//                     <select
//                       value={form.gymSize} onChange={set("gymSize")}
//                       onFocus={() => setFocused("gymSize")} onBlur={() => setFocused("")}
//                       className={`${inputBase("gymSize")} pl-10 pr-10 appearance-none cursor-pointer`}>
//                       <option value="">Select size...</option>
//                       {GYM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Interest */}
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
//                     I&apos;m Interested In <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
//                     <select
//                       value={form.interest} onChange={set("interest")}
//                       onFocus={() => setFocused("interest")} onBlur={() => setFocused("")}
//                       className={`${inputBase("interest")} pr-10 appearance-none cursor-pointer`}>
//                       <option value="">Select plan...</option>
//                       {INTERESTS.map((s) => <option key={s} value={s}>{s}</option>)}
//                     </select>
//                   </div>
//                   {errors.interest && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.interest}</p>}
//                 </div>
//               </div>

//               {/* Message */}
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
//                   Message <span className="text-zinc-400 font-normal normal-case">(optional)</span>
//                 </label>
//                 <textarea
//                   rows={4} placeholder="Tell us more about your gym, current challenges, or any questions..."
//                   value={form.message} onChange={set("message")}
//                   onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
//                   className={`${inputBase("message")} resize-none leading-relaxed`}
//                 />
//               </div>

//               {/* Submit */}
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="relative overflow-hidden shimmer w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-zinc-400 disabled:to-zinc-500 text-white font-bold rounded-xl shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-base"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Sending your message…
//                   </>
//                 ) : (
//                   <>
//                     <Send className="w-5 h-5" />
//                     Send Message & Get Callback
//                   </>
//                 )}
//               </button>

//               <p className="text-center text-xs text-zinc-400 leading-relaxed">
//                 🔒 Your details are 100% private and never shared.
//                 We&apos;ll contact you within <span className="font-bold text-zinc-600 dark:text-zinc-300">2 hours</span> on your phone or WhatsApp.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── FOOTER ── */}
//       <footer className="border-t border-zinc-100 dark:border-zinc-900 py-8 text-center text-xs text-zinc-500">
//         <div className="flex items-center justify-center gap-3 mb-3">
//           <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
//             <Dumbbell className="w-3.5 h-3.5" />
//           </div>
//           <span className="font-extrabold text-zinc-700 dark:text-zinc-300 text-sm">
//             Manage<span className="text-orange-500">Gym</span><span className="text-zinc-400">24</span>
//           </span>
//         </div>
//         © {new Date().getFullYear()} ManageGym24 · Made with ❤️ for Indian Gym Owners
//       </footer>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dumbbell, Phone, Mail, MapPin, MessageSquare,
  ArrowRight, CheckCircle2, Send, User, Building2,
  Users, ChevronDown, Loader2, X,
} from "lucide-react";

const INTERESTS = [
  "Starter Plan (₹999/mo)",
  "Growth Plan (₹1,999/mo)",
  "Enterprise — 3 Gyms (₹3,999/mo)",
  "Enterprise — 10 Gyms (₹7,999/mo)",
  "Custom / Demo Request",
  "General Inquiry",
];

const GYM_SIZES = [
  "Under 50 members",
  "50–150 members",
  "150–500 members",
  "500+ members",
  "Multiple branches",
];

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 7015822199",
    sub: "Mon–Sat, 9am–7pm IST",
    href: "tel:+917015822199",
    color: "orange",
  },
  {
    icon: MessageSquare,
    label: "WhatsApp",
    value: "Chat with Us",
    sub: "Quick replies guaranteed",
    href: "https://wa.me/917015822199",
    color: "green",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@managegym24.com",
    sub: "We reply within 2 hours",
    href: "mailto:hello@managegym24.com",
    color: "blue",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Bangalore, India",
    sub: "Serving gyms pan-India",
    href: "#",
    color: "red",
  },
];

const colorMap = {
  orange: {
    bg: "bg-orange-100 dark:bg-orange-950/40",
    icon: "text-orange-500 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    hover: "hover:border-orange-400 dark:hover:border-orange-600",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-950/40",
    icon: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    hover: "hover:border-green-400 dark:hover:border-green-600",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950/40",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:border-blue-400 dark:hover:border-blue-600",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-950/40",
    icon: "text-red-500 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    hover: "hover:border-red-400 dark:hover:border-red-600",
  },
};

const EMPTY_FORM = {
  name: "", gymName: "", phone: "", email: "",
  gymSize: "", interest: "", message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedData, setSubmittedData] = useState(EMPTY_FORM);
  const [focused, setFocused] = useState("");
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim())   e.name     = "Your name is required";
    if (!form.phone.trim())  e.phone    = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
                             e.phone    = "Enter a valid 10-digit Indian number";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
                             e.email    = "Enter a valid email address";
    if (!form.interest)      e.interest = "Please select your interest";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Save submitted data for the popup, then reset form
      setSubmittedName(form.name.split(" ")[0]);
      setSubmittedData({ ...form });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSubmitted(false);

  const set = (field: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const inputBase = (field: keyof typeof form) =>
    `w-full bg-zinc-50 dark:bg-zinc-800/60 border rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600
    ${errors[field]
      ? "border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-950/10"
      : focused === field
      ? "border-orange-400 dark:border-orange-500 shadow-sm shadow-orange-500/15 bg-white dark:bg-zinc-800"
      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
    } text-zinc-800 dark:text-zinc-100`;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }

        .gradient-text {
          background: linear-gradient(135deg,#f97316 0%,#ef4444 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        @keyframes ping {
          75%,100% { transform:scale(2.2); opacity:0; }
        }
        .ping-dot { animation: ping 2s cubic-bezier(0,0,.2,1) infinite; }

        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .shimmer::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
          animation:shimmer 2.8s infinite;
        }

        @keyframes float-in {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .float-in   { animation: float-in .55s ease forwards; }
        .float-in-1 { animation-delay:.05s; opacity:0; }
        .float-in-2 { animation-delay:.12s; opacity:0; }
        .float-in-3 { animation-delay:.20s; opacity:0; }
        .float-in-4 { animation-delay:.28s; opacity:0; }

        .hero-glow {
          position:absolute; border-radius:50%; pointer-events:none;
          background:radial-gradient(circle,rgba(249,115,22,.13) 0%,transparent 70%);
        }

        .contact-card { transition: transform .3s ease, box-shadow .3s ease; }
        .contact-card:hover { transform:translateY(-4px); }

        /* ── Success Modal ── */
        @keyframes modal-pop {
          0%   { transform:scale(.75) translateY(20px); opacity:0; }
          70%  { transform:scale(1.03) translateY(-2px); }
          100% { transform:scale(1) translateY(0);  opacity:1; }
        }
        .modal-pop { animation: modal-pop .45s cubic-bezier(.34,1.56,.64,1) forwards; }

        @keyframes icon-float {
          0%,100% { transform:translateY(0) rotate(0deg); }
          50%     { transform:translateY(-10px) rotate(4deg); }
        }
        .icon-float { animation: icon-float 3s ease-in-out infinite; }

        @keyframes confetti-drop {
          0%   { transform:translateY(-20px) rotate(0deg);  opacity:1; }
          100% { transform:translateY(60px)  rotate(720deg); opacity:0; }
        }
        .confetti-piece { animation: confetti-drop 1.4s ease forwards; }

        @keyframes backdrop-in {
          from { opacity:0; }
          to   { opacity:1; }
        }
        .backdrop-in { animation: backdrop-in .25s ease forwards; }

        @keyframes check-draw {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0; }
        }
        .check-draw {
          stroke-dasharray: 100;
          animation: check-draw .5s .3s ease forwards;
        }
      `}</style>

      {/* ─────────────── SUCCESS MODAL ─────────────── */}
      {submitted && (
        <div
          className="backdrop-in fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-pop relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 max-w-md w-full text-center overflow-hidden">

            {/* Decorative top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-3xl" />

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Confetti dots */}
            {["#f97316","#ef4444","#facc15","#22c55e","#3b82f6"].map((color, i) => (
              <div
                key={i}
                className="confetti-piece absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  background: color,
                  top: "20%",
                  left: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}

            {/* Icon */}
            <div className="icon-float w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              We&apos;ll Be in <span className="gradient-text">Touch!</span>
            </h2>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
              Thanks{" "}
              <span className="text-zinc-900 dark:text-white font-bold">{submittedName}</span>!{" "}
              Our team will reach out within{" "}
              <span className="text-orange-500 font-bold">2 hours</span>{" "}
              on WhatsApp or phone.
            </p>

            {/* Summary card */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden mb-6 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                Your Submission
              </p>
              {[
                { label: "Name",     value: submittedData.name },
                { label: "Phone",    value: `+91 ${submittedData.phone}` },
                { label: "Gym",      value: submittedData.gymName || "Not provided" },
                { label: "Interest", value: submittedData.interest },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-700/60 last:border-0">
                  <span className="text-xs text-zinc-400 font-medium">{r.label}</span>
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold text-right max-w-[60%] truncate">{r.value}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <a
                href="https://wa.me/917201000220"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/30 hover:scale-[1.02]"
              >
                💬 WhatsApp Us
              </a>
              <button
                onClick={closeModal}
                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-bold rounded-xl transition-all hover:scale-[1.02]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── NAV ─────────────── */}
      <nav className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-18 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Manage<span className="text-orange-500">Gym</span>
              <span className="text-zinc-400 dark:text-zinc-500">24</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-1.5"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* ─────────────── HERO ─────────────── */}
      <div className="relative bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 overflow-hidden py-16 md:py-20">
        <div className="hero-glow w-[600px] h-[600px] top-[-200px] right-[-100px]" />
        <div
          className="hero-glow w-[400px] h-[400px] bottom-[-100px] left-[-50px]"
          style={{ background: "radial-gradient(circle,rgba(239,68,68,.09) 0%,transparent 70%)" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="float-in float-in-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-100/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-6 border border-orange-200/70 dark:border-orange-700/40">
            <span className="relative flex h-2.5 w-2.5">
              <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
            60-Day Free Trial · No Credit Card Required
          </div>

          <h1 className="float-in float-in-2 text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5">
            Let&apos;s Grow Your<br />
            <span className="gradient-text">Gym Together</span>
          </h1>

          <p className="float-in float-in-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8">
            Fill in your details and our team will reach out within{" "}
            <span className="font-bold text-zinc-800 dark:text-zinc-200">2 hours</span>{" "}
            to get you set up.
          </p>

          {/* Quick contact chips */}
          <div className="float-in float-in-4 flex flex-wrap justify-center gap-3">
            {[
              { label: "📞 Call Now",  href: "tel:+917015822199" },
              { label: "💬 WhatsApp",  href: "https://wa.me/917015822199" },
              { label: "✉️ Email Us",  href: "mailto:hello@managegym24.com" },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-orange-400 dark:hover:border-orange-600 hover:text-orange-500 shadow-sm hover:shadow-md transition-all"
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────── MAIN GRID ─────────────── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 grid lg:grid-cols-5 gap-12">

        {/* ── LEFT — Contact Info ── */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Get in Touch</p>
            <h2 className="text-3xl font-black mb-3">We&apos;re Here to Help</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Whether you&apos;re a single gym or running multiple branches, we have the right plan
              for you. Reach out and let&apos;s talk.
            </p>
          </div>

          {/* Contact cards */}
          <div className="space-y-3">
            {CONTACT_INFO.map((c) => {
              const col = colorMap[c.color as keyof typeof colorMap];
              return (
                <a
                  key={c.label}
                  href={c.href}
                  className={`contact-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border ${col.border} ${col.hover} shadow-sm hover:shadow-lg transition-all group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <c.icon className={`w-5 h-5 ${col.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-0.5">{c.label}</p>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{c.value}</p>
                    <p className="text-xs text-zinc-500">{c.sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </a>
              );
            })}
          </div>

          {/* Trust badges */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Why 500+ Gyms Trust Us
            </p>
            <div className="space-y-3">
              {[
                { icon: "⚡", text: "Setup done in under 1 day" },
                { icon: "🛡️", text: "99% uptime, your data is safe" },
                { icon: "🎯", text: "Dedicated onboarding support" },
                { icon: "💰", text: "60-day free trial, no card needed" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-3 text-sm">
                  <span className="text-base">{b.icon}</span>
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT — Form ── */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-10 shadow-xl shadow-zinc-900/5 dark:shadow-none">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Contact Form</p>
              <h3 className="text-2xl font-black">Tell Us About Your Gym</h3>
              <p className="text-sm text-zinc-500 mt-1">
                All fields marked <span className="text-red-500 font-bold">*</span> are required
              </p>
            </div>

            <div className="space-y-5">

              {/* Name + Gym row */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={set("name")}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase("name")} pl-10`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name}</p>
                  )}
                </div>

                {/* Gym Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Gym Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Iron Temple"
                      value={form.gymName}
                      onChange={set("gymName")}
                      onFocus={() => setFocused("gymName")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase("gymName")} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Phone + Email row */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <span className="text-sm">🇮🇳</span>
                      <span className="text-xs font-bold text-zinc-500">+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={form.phone}
                      onChange={set("phone")}
                      onFocus={() => setFocused("phone")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase("phone")} pl-16`}
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set("email")}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase("email")} pl-10`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Gym Size + Interest row */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Gym Size */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Gym Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
                    <select
                      value={form.gymSize}
                      onChange={set("gymSize")}
                      onFocus={() => setFocused("gymSize")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase("gymSize")} pl-10 pr-10 appearance-none cursor-pointer`}
                    >
                      <option value="">Select size...</option>
                      {GYM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Interest */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    I&apos;m Interested In <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
                    <select
                      value={form.interest}
                      onChange={set("interest")}
                      onFocus={() => setFocused("interest")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase("interest")} pr-10 appearance-none cursor-pointer`}
                    >
                      <option value="">Select plan...</option>
                      {INTERESTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {errors.interest && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.interest}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Message{" "}
                  <span className="text-zinc-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us more about your gym, current challenges, or any questions..."
                  value={form.message}
                  onChange={set("message")}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused("")}
                  className={`${inputBase("message")} resize-none leading-relaxed`}
                />
              </div>

              {/* API Error */}
              {apiError && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
                  <span className="text-base">⚠️</span>
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="relative overflow-hidden shimmer w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-zinc-400 disabled:to-zinc-500 text-white font-bold rounded-xl shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending your message…
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message &amp; Get Callback
                  </>
                )}
              </button>

              <p className="text-center text-xs text-zinc-400 leading-relaxed">
                🔒 Your details are 100% private and never shared. We&apos;ll contact you within{" "}
                <span className="font-bold text-zinc-600 dark:text-zinc-300">2 hours</span> on your
                phone or WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
            <Dumbbell className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-zinc-700 dark:text-zinc-300 text-sm">
            Manage<span className="text-orange-500">Gym</span>
            <span className="text-zinc-400">24</span>
          </span>
        </div>
        © {new Date().getFullYear()} ManageGym24 · Made with ❤️ for Indian Gym Owners
      </footer>
    </div>
  );
}