import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DonationCheckout from './components/DonationCheckout';
import AIChatSupport from './components/AIChatSupport';
import heroImage from './assets/hero_generated.jpg';
import logoImage from './assets/logo.jpg';

function App() {
  const [recentDonations, setRecentDonations] = useState([]);
  const [currentDonationIndex, setCurrentDonationIndex] = useState(0);
  const [activePolicy, setActivePolicy] = useState(null);
  const [urgentAppeal, setUrgentAppeal] = useState({
    title: "Urgent Batch Dispatch",
    count: 32,
    message: "Only 32 elders in this verified cohort awaiting mobility walkers before winter frost."
  });

  // Fetch intelligent mock donations from Groq backend
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recent-donations');
        const data = await response.json();
        if (data.donations && data.donations.length > 0) {
          setRecentDonations(data.donations);
        }
      } catch (error) {
        console.error('Failed to fetch recent donations:', error);
      }
    };

    const fetchAppeal = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/urgent-appeal');
        const data = await response.json();
        if (data.title && data.message) {
          setUrgentAppeal(data);
        }
      } catch (error) {
        console.error('Failed to fetch urgent appeal:', error);
      }
    };

    fetchDonations();
    fetchAppeal();
    // Refetch donations every 2 minutes
    const fetchInterval = setInterval(fetchDonations, 120000);
    // Refetch appeal every 5 minutes
    const appealInterval = setInterval(fetchAppeal, 300000);
    return () => {
      clearInterval(fetchInterval);
      clearInterval(appealInterval);
    };
  }, []);

  // Cycle through donations every 5 seconds
  useEffect(() => {
    if (recentDonations.length === 0) return;
    const cycleInterval = setInterval(() => {
      setCurrentDonationIndex((prevIndex) => (prevIndex + 1) % recentDonations.length);
    }, 5000);
    return () => clearInterval(cycleInterval);
  }, [recentDonations]);

  const currentDonation = recentDonations.length > 0 ? recentDonations[currentDonationIndex] : {
    name: "Aarav M.",
    amount: 1500,
    location: "Bengaluru",
    timeAgo: "4m ago"
  };

  const scrollToDonationModule = () => {
    const el = document.getElementById('donation-module');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-brand-amber/50', 'ring-offset-4', 'transition-shadow', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-brand-amber/50', 'ring-offset-4');
      }, 1500);
    }
  };



  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-emerald/5 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-brand-amber/5 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-brand-navy/5 blur-[120px]"></div>
      </div>

      {/* INSTITUTIONAL CREDIBLE HEADER */}
      <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm pt-safe">
        <div className="bg-brand-navy-dark text-slate-200 text-[11px] px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate max-w-5xl mx-auto w-full">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-medium tracking-wide">National Elder Care & Mobility Mission</span>
            <span className="ml-auto text-emerald-300 font-medium whitespace-nowrap pl-2">100% Transparent Operations</span>
          </div>
        </div>
        <div className="h-16 px-4 flex items-center justify-between gap-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <img src={logoImage} alt="Kinship & Care Logo" className="w-10 h-10 rounded-xl shadow-md border border-slate-200 object-cover group-hover:shadow-lg transition-all duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-base bg-gradient-to-r from-brand-navy-dark to-brand-navy bg-clip-text text-transparent leading-tight tracking-tight">SevaSparsh Foundation</span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">National Elder Care & Mobility Mission</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden xs:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-100">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Verified Operations
            </span>
            <button className="bg-gradient-to-r from-brand-amber to-brand-amber-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_4px_14px_rgba(200,90,23,0.3)] hover:shadow-[0_6px_20px_rgba(200,90,23,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2" onClick={scrollToDonationModule}>
              <span>Donate</span>
              <span className="material-symbols-outlined text-[16px]">favorite</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN EDITORIAL & ACTION CONTAINER */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-24 space-y-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/60 border border-white rounded-2xl p-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md"
        >
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 shadow-sm backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2.5 truncate">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={currentDonationIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="font-medium truncate"
                >
                  <span className="font-medium truncate">
              <strong className="font-bold text-emerald-900">{currentDonation.name}</strong> donated <strong className="font-bold text-emerald-900">₹{currentDonation.amount.toLocaleString('en-IN')}</strong> from {currentDonation.location} <span className="text-slate-500">({currentDonation.timeAgo})</span>
            </span>
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold whitespace-nowrap pl-2 bg-white/60 px-2 py-1 rounded-md shrink-0">
              <span className="material-symbols-outlined text-[14px]">verified</span>Live Verified Ledger
            </div>
          </div>
        </motion.div>

        {/* HERO EDITORIAL CARD */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-50px" }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/5 to-transparent pointer-events-none"></div>
          <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] max-h-[450px] bg-slate-100 overflow-hidden">
            <img alt="Elderly grandmother and caring social worker at SevaSparsh senior day shelter, New Delhi" className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.03] origin-bottom" src={heroImage}/>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/90 via-brand-navy-dark/20 to-transparent mix-blend-multiply"></div>
            <div className="absolute bottom-5 left-5 bg-white/10 text-white text-xs px-3.5 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 font-medium shadow-lg border border-white/20">
              <span className="material-symbols-outlined text-[16px] text-brand-amber">photo_camera</span>
              Field Dispatch: Mehrauli Senior Care Centre
            </div>
          </div>
          <div className="p-6 sm:p-10 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-amber bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-2 rounded-xl border border-amber-200/50 uppercase tracking-widest shadow-sm">
              <span className="material-symbols-outlined text-[16px] animate-pulse">emergency</span>
              Verified Field Appeal 2025
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold bg-gradient-to-br from-brand-navy-dark via-brand-navy to-brand-navy-light bg-clip-text text-transparent leading-[1.15] tracking-tight drop-shadow-sm">
              Restoring Dignity, Medical Care, and Mobility to India's Abandoned Elders
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Over 14,200 vulnerable senior citizens across peri-urban settlements live without basic mobility aids, chronic illness medications, or daily nutrition. SevaSparsh provides structured doorstep palliative care, certified orthopedic equipment, and daily hygienic meal distribution with <strong className="text-slate-800 font-bold bg-amber-50 px-1 rounded">100% field audit transparency.</strong>
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">verified_user</span>
              </div>
              <div className="leading-relaxed text-xs sm:text-sm">
                <strong className="text-brand-navy font-semibold block mb-0.5">100% Transparent Operations</strong> 
                Every contribution directly supports our field operations. We pride ourselves on complete transparency, providing donors with regular updates and field impact reports.
              </div>
            </div>
          </div>
        </motion.section>
        {/* IMPACT METRICS BANNER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-brand-navy rounded-3xl p-6 sm:p-10 shadow-lg text-white"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="space-y-2 pt-4 sm:pt-0">
              <span className="text-4xl sm:text-5xl font-display font-bold text-brand-amber drop-shadow-sm">14,200+</span>
              <p className="text-sm text-slate-300 font-medium uppercase tracking-wider">Elders Supported</p>
            </div>
            <div className="space-y-2 pt-6 sm:pt-0">
              <span className="text-4xl sm:text-5xl font-display font-bold text-brand-emerald drop-shadow-sm">50+</span>
              <p className="text-sm text-slate-300 font-medium uppercase tracking-wider">Active Field Clinics</p>
            </div>
            <div className="space-y-2 pt-6 sm:pt-0">
              <span className="text-4xl sm:text-5xl font-display font-bold text-white drop-shadow-sm">100%</span>
              <p className="text-sm text-slate-300 font-medium uppercase tracking-wider">Transparent Delivery</p>
            </div>
          </div>
        </motion.section>

        {/* CORE PROGRAMS GRID */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy tracking-tight">Our Core Programs</h2>
            <p className="text-slate-500 text-sm">Targeted interventions for maximum field impact.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">accessible_forward</span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Mobility Aids</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Providing ergonomic walkers and heavy-duty wheelchairs to restore independence and prevent bedsores.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">home_health</span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Palliative Care</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Doorstep medical assistance, physiotherapy, and chronic illness medications for bedridden seniors.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center mb-4 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">restaurant</span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Nutrition Support</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Daily hot meals, high-protein supplements, and essential grocery rations for abandoned elders.</p>
            </div>
          </div>
        </motion.section>

        {/* WORKFLOW TIMELINE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-slate-100 rounded-3xl p-6 sm:p-10 border border-slate-200/60 space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy tracking-tight">How Your Support Reaches Them</h2>
            <p className="text-slate-500 text-sm">A 100% transparent and verified distribution process.</p>
          </div>
          <div className="relative">
            {/* Connecting line (hidden on mobile) */}
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-0.5 bg-slate-300"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center z-10 relative text-brand-navy">
                  <span className="material-symbols-outlined text-[32px]">person_search</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">1. Identify</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Local volunteers and partner NGOs identify abandoned seniors in urgent need of medical or mobility support.</p>
                </div>
              </div>
              <div className="relative text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center z-10 relative text-brand-amber">
                  <span className="material-symbols-outlined text-[32px]">local_shipping</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">2. Dispatch</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Verified medical equipment and high-priority medicines are dispatched directly to the beneficiary's doorstep.</p>
                </div>
              </div>
              <div className="relative text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center z-10 relative text-emerald-600">
                  <span className="material-symbols-outlined text-[32px]">verified</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">3. Report</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Donors receive field dispatch updates and aggregated medical case studies ensuring complete transparency.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* IMPACT TRACKER */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-50px" }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] space-y-7 relative overflow-hidden group"
        >
          <div className="absolute top-[-50%] right-[-10%] w-[120%] h-[150%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-amber/10 via-transparent to-transparent pointer-events-none transition-opacity duration-1000 group-hover:opacity-70 opacity-40"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/30 border border-amber-200/50 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs shadow-sm">
              <div className="flex items-center gap-3 text-amber-900">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-amber to-brand-amber-hover text-white flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(200,90,23,0.3)]">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                </div>
                <span className="font-medium leading-relaxed">
                  <strong className="text-brand-amber font-bold text-sm">{urgentAppeal.title}:</strong> <span>{urgentAppeal.message}</span>
                </span>
              </div>
              <span className="hidden sm:inline-block bg-gradient-to-r from-brand-amber to-brand-amber-hover text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest whitespace-nowrap shadow-sm">Priority #1</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100/80 pb-5">
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-amber bg-amber-50 px-2 py-1 rounded border border-amber-100/50">Active Campaign</span>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-brand-navy tracking-tight drop-shadow-sm">Elderly Winter Healthcare & Mobility Fund 2025</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-bold bg-white px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-slate-400">group</span><strong className="text-slate-800">1,420</strong> Donors</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-brand-amber animate-pulse">schedule</span><strong className="text-brand-amber">8 Days</strong> Left</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-4xl sm:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-navy-dark to-brand-navy tracking-tight drop-shadow-sm">₹18,40,000</span>
                  <span className="text-sm text-slate-500 font-medium ml-3 block sm:inline mt-1 sm:mt-0">raised of <strong className="text-slate-700">₹25,00,000</strong> target</span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200/50 px-3 py-1.5 rounded-lg shadow-sm">73.6% Disbursed</span>
              </div>
              <div className="w-full bg-slate-100/80 h-4 rounded-full overflow-hidden shadow-inner border border-slate-200/50 p-0.5">
                <div className="bg-gradient-to-r from-brand-navy to-brand-emerald h-full rounded-full relative shadow-[0_0_10px_rgba(13,110,90,0.5)]" style={{ width: '73.6%' }}>
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'}}></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 text-center text-xs">
                <div className="bg-gradient-to-b from-white to-slate-50 p-4 rounded-2xl border border-slate-200/60 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Medicine Supplies</span>
                  <span className="font-extrabold text-brand-navy text-base">₹8.2 Lakhs</span>
                </div>
                <div className="bg-gradient-to-b from-white to-slate-50 p-4 rounded-2xl border border-slate-200/60 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mobility & Walkers</span>
                  <span className="font-extrabold text-brand-navy text-base">₹6.5 Lakhs</span>
                </div>
                <div className="bg-gradient-to-b from-white to-slate-50 p-4 rounded-2xl border border-slate-200/60 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hot Meals Kit</span>
                  <span className="font-extrabold text-brand-navy text-base">₹3.7 Lakhs</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* DONATION CHECKOUT MODULE - REACT COMPONENT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-50px" }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="scroll-mt-24"
        >
          <DonationCheckout />
        </motion.div>

        {/* MEDICAL CASE STUDY 1: Ram Nath Ji */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-50px" }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
        >
          <div className="relative z-10">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-brand-amber">assignment_turned_in</span>
                </div>
                Field Dispatch & Medical Case Study
              </div>
              <div className="hidden sm:block text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wider">
                Verified ID #DL-882
              </div>
            </div>
            <div className="w-full aspect-[4/3] sm:aspect-[2/1] bg-slate-100 relative overflow-hidden">
              <img alt="Ram Nath Ji receiving walker support" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDseqOym5vMkJS_W7sZfTRcIF6PmWqV_ylHhr8n_fu-MvTyFvNqrmR77ZkxTFFI5WCXWd2Wjj5zytvNKJiAhtAVfH7TpVL4GlqAo8-yMUwMGrCd_x5LymZeYZRDUmb3Vh1xe0NWe5f9lOT8BaAZRKBjJuHqxHevJvI7jiQUnwV4-k3p-g-PfwijY6Be6g4QSfzWJj5ubqPI_yCQA3kDmpKjrW8VCpV4WqSMoUKXjHn9RvsfivKSxJ4NBw" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-brand-navy text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-brand-amber">medical_services</span>
                Day 14 Mobility Regained
              </div>
            </div>
            <div className="p-5 sm:p-7 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg sm:text-xl tracking-tight">Ram Nath Ji, 82 yrs</h3>
                <span className="text-slate-500 font-medium text-sm flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-[14px]">location_on</span> Mehrauli Basti, New Delhi</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">Case Managed: 6 Months</span>
            </div>
            <p className="text-sm text-slate-600 italic leading-relaxed border-l-4 border-brand-amber/30 pl-4 py-1">
              "Ram Nath Ji was unable to stand for eight months due to degenerated knee cartilage and no family caregiver. With your contributions, our community team provided a specialized wide-stance orthopedic walker and bi-weekly rehabilitation exercises. Last week, he stood unassisted and took his first steps outdoors in over two years."
            </p>
            <div className="bg-slate-50 rounded-xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-100/80">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium">Assigned Geriatric Therapist</span>
                <strong className="text-slate-800 text-sm">Dr. Ananya Sen</strong>
              </div>
              <div className="flex flex-col gap-0.5 sm:text-right">
                <span className="text-slate-500 font-medium">Current Status</span>
                <strong className="text-emerald-700 text-sm flex items-center sm:justify-end gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Fully Ambulatory</strong>
              </div>
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-0.5 pt-3 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Equipment Provided</span>
                <strong className="text-slate-800">Dual-level Adjustable Walker (Batch #WK-2024-41)</strong>
              </div>
            </div>
            <div className="pt-2 text-[13px] text-slate-600 leading-relaxed bg-brand-navy/5 p-4 rounded-xl">
              <span className="italic">"Chronic mobility impairment leads directly to rapid cognitive decline and depression in abandoned seniors. Supplying a simple ₹1,500 walker halts irreversible bed-confinement and gives an elder back their fundamental human dignity."</span>
              <span className="block mt-2 font-bold text-brand-navy not-italic">— Dr. K. N. Banerjee, MBBS, MD (Geriatrics), Advisory Board Member</span>
            </div>
          </div>
          </div>
        </motion.section>


        {/* GROUND OPERATIONS & FINANCIAL ALLOCATION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-50px" }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
        >
          <div className="space-y-1.5">
            <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Accountability & Governance</span>
            <h3 className="font-display font-bold text-xl text-brand-navy tracking-tight">Where Every Rupee Goes</h3>
            <p className="text-sm text-slate-500">Transparent fund allocation for maximum impact.</p>
          </div>
          <div className="space-y-4 pt-2">
            <div className="group">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">86.4% — Direct Field Program Delivery</span>
                <span className="text-brand-navy font-bold">Medicines, Mobility Equipment, Nutrition</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-navy h-full rounded-full transition-all duration-1000 group-hover:bg-brand-navy-light" style={{ width: '86.4%' }}></div>
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">8.2% — Direct Field Paramedics & Logistics</span>
                <span className="text-slate-500 font-medium">Physiotherapists & Ambulance Care</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full transition-all duration-1000 group-hover:bg-slate-500" style={{ width: '8.2%' }}></div>
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">5.4% — Governance & Audit</span>
                <span className="text-slate-500 font-medium">Statutory Compliance</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-300 h-full rounded-full transition-all duration-1000 group-hover:bg-slate-400" style={{ width: '5.4%' }}></div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-50px" }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">help</span>
            </div>
            <h3 className="font-display font-bold text-lg text-brand-navy tracking-tight">Donor Clarifications</h3>
          </div>
          <div className="space-y-3 text-sm">
            <details className="bg-slate-50 border border-slate-100 rounded-xl p-4 group transition-all open:bg-white open:shadow-sm">
              <summary className="font-semibold text-slate-800 cursor-pointer flex justify-between items-center list-none outline-none">
                <span>Can I donate using UPI (Google Pay, PhonePe, Paytm, BHIM)?</span>
                <span className="material-symbols-outlined text-[20px] text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="text-slate-600 mt-3 leading-relaxed text-xs sm:text-sm pl-1 border-l-2 border-brand-amber/30">
                Yes. Our payment gateway seamlessly supports all UPI applications, direct QR scan, NetBanking across all major public and private banks, and Indian debit/credit cards.
              </div>
            </details>
            <details className="bg-slate-50 border border-slate-100 rounded-xl p-4 group transition-all open:bg-white open:shadow-sm">
              <summary className="font-semibold text-slate-800 cursor-pointer flex justify-between items-center list-none outline-none">
                <span>How can I audit how my donation was utilized?</span>
                <span className="material-symbols-outlined text-[20px] text-slate-400 group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="text-slate-600 mt-3 leading-relaxed text-xs sm:text-sm pl-1 border-l-2 border-brand-amber/30">
                We publish quarterly field dispatch reports detailing beneficiary distribution registries (with names masked for dignity) and medical camp outcomes.
              </div>
            </details>
          </div>
        </motion.section>
      </main>

      {/* STICKY INSTITUTIONAL ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-200/60 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-30 sm:hidden">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">100% Impact</span>
            <span className="text-lg font-display font-bold text-brand-navy leading-tight mt-0.5">Secure</span>
          </div>
          <button className="flex-1 py-3 px-4 bg-brand-amber hover:bg-brand-amber-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-amber/20 transition-all flex items-center justify-center gap-2 active:scale-95" onClick={scrollToDonationModule}>
            <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
            <span>Donate Now</span>
          </button>
        </div>
      </div>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="bg-brand-navy text-slate-300 text-sm border-t border-brand-navy-dark py-10 px-4 mt-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="grid grid-cols-1 pb-8 border-b border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Kinship & Care Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                <span className="font-display font-bold text-white text-base">SevaSparsh Foundation</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                <strong className="text-slate-300">Registered Office:</strong><br/>Institutional Area, Sector 4, R.K. Puram, New Delhi, Delhi 110022<br/><br/>
                <strong className="text-slate-300">National Helpline:</strong><br/>+91 (011) 4920-8100 <span className="opacity-70">(Mon–Sat, 9:30 AM – 6:00 PM IST)</span><br/><br/>
                <strong className="text-slate-300">Email:</strong> donorrelations@sevasparsh.org.in
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400/80 leading-relaxed space-y-4 text-center sm:text-left">
            <p className="max-w-2xl">
              SevaSparsh Foundation operates with complete transparency. We do not accept cash donations above statutory limits. All online contributions are routed through RBI-licensed payment aggregators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <span>© 2025 SevaSparsh Foundation. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <span onClick={() => setActivePolicy('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
                <span onClick={() => setActivePolicy('terms')} className="hover:text-white transition-colors cursor-pointer">Terms & No Refund Policy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Support Widget */}
      <AIChatSupport />

      {/* Policy Modal */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-display font-bold text-xl text-brand-navy">
                  {activePolicy === 'privacy' ? 'Privacy Policy' : 'Terms of Giving & No Refund Policy'}
                </h2>
                <button onClick={() => setActivePolicy(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="p-5 sm:p-6 overflow-y-auto text-sm text-slate-600 space-y-4">
                {activePolicy === 'privacy' ? (
                  <>
                    <h3 className="font-bold text-slate-800">1. Information Collection</h3>
                    <p>We collect essential information such as your name, email, and phone number exclusively to process your contribution securely and provide you with impact updates. We do not sell or share your data with third-party marketers.</p>
                    <h3 className="font-bold text-slate-800">2. Secure Transactions</h3>
                    <p>All financial transactions are routed through RBI-compliant, 256-bit SSL encrypted payment gateways. We do not store your credit card or UPI details on our servers.</p>
                    <h3 className="font-bold text-slate-800">3. Communication</h3>
                    <p>By providing your contact details, you consent to receive transaction receipts and critical project updates. You may opt out of non-transactional communications at any time.</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-800">1. Nature of Contribution</h3>
                    <p>All contributions made to the SevaSparsh Foundation are voluntary and intended to support our field operations for elderly care and mobility.</p>
                    <h3 className="font-bold text-slate-800">2. Strict No-Refund Policy</h3>
                    <p className="text-brand-amber font-semibold bg-amber-50 p-4 rounded-lg border border-amber-100">Please note that all donations are final. Due to the immediate deployment of funds into our critical care programs, we operate under a strict <strong>NO REFUND</strong> policy. By completing your transaction, you acknowledge and agree that your contribution cannot be cancelled or refunded under any circumstances.</p>
                    <h3 className="font-bold text-slate-800">3. Dispute Resolution</h3>
                    <p>Any disputes arising from transactions will be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
