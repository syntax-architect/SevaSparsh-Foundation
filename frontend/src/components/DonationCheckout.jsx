import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Custom hook to dynamically load the Razorpay checkout script
 */
const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return isLoaded;
};

const TIERS = [
  {
    amount: 750,
    title: "1 Senior's Monthly Diabetic & Hypertension Prescriptions",
    desc: "Provides a full month of life-saving medications for blood pressure and diabetes.",
    isPopular: false
  },
  {
    amount: 1500,
    title: "Pair of Custom Mobility Walkers + Palliative Nurse Visit",
    desc: "₹1,500 funds 1 pair of custom quad-walkers + 2 home physiotherapy visits, freeing an elder from bed confinement.",
    isPopular: true
  },
  {
    amount: 3500,
    title: "Heavy-duty Ergonomic Wheelchair & 30-Day Nutrition",
    desc: "Provides a heavy-duty wheelchair and a month of high-protein hot meals for a severely disabled elder.",
    isPopular: false
  },
  {
    amount: 5000,
    title: "Complete Critical Medical Foster Kit for a Bedridden Senior",
    desc: "Includes adult diapers, medical bed sore mattress, and complete nursing care for 30 days.",
    isPopular: false
  }
];

const DonationCheckout = ({ initialAmount = 1500 }) => {
  const isRazorpayLoaded = useRazorpay();
  
  const [amount, setAmount] = useState(initialAmount);
  const [frequency, setFrequency] = useState('once');
  const [customAmount, setCustomAmount] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    panNumber: ''
  });
  
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    paymentSuccess: false,
    paymentError: null,
  });

  // Calculate actual active amount (from tier or custom)
  const activeAmount = customAmount ? parseInt(customAmount) || 0 : amount;

  // Determine active impact description based on active amount
  const getImpactDescription = () => {
    if (activeAmount >= 5000) return "Complete Critical Medical Foster Kit for a Bedridden Senior";
    if (activeAmount >= 3500) return "Heavy-duty Ergonomic Wheelchair & 30-Day Nutrition Support";
    if (activeAmount >= 1500) return "₹1,500 funds 1 pair of custom quad-walkers + 2 home physiotherapy visits, freeing an elder from bed confinement.";
    if (activeAmount >= 750) return "1 Senior's Monthly Diabetic & Hypertension Prescriptions";
    return "General field medication & patient mobilization assistance";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTierSelect = (tierAmount) => {
    setAmount(tierAmount);
    setCustomAmount(''); // clear custom amount when a tier is selected
  };

  const processCheckout = async (e) => {
    e.preventDefault();
    
    if (!isRazorpayLoaded) {
      setUiState(prev => ({ ...prev, paymentError: 'Payment gateway is still loading. Please try again in a moment.' }));
      return;
    }
    
    if (activeAmount < 100) {
      setUiState(prev => ({ ...prev, paymentError: 'Minimum donation amount is ₹100' }));
      return;
    }

    setUiState(prev => ({ ...prev, isSubmitting: true, paymentError: null }));

    try {
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: activeAmount
        })
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create order securely.');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SevaSparsh Foundation",
        description: "Elderly Winter Healthcare & Mobility Fund",
        order_id: orderData.order_id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: "#0f294a" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              setUiState({ isSubmitting: false, paymentSuccess: true, paymentError: null });
            } else {
              throw new Error(verifyData.error || 'Payment verification failed at server.');
            }
          } catch (error) {
            console.error("Verification Error:", error);
            setUiState({ isSubmitting: false, paymentSuccess: false, paymentError: 'Verification failed. ' + error.message });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        setUiState({ 
          isSubmitting: false, 
          paymentSuccess: false, 
          paymentError: `Payment cancelled or failed: ${response.error.description}` 
        });
      });
      
      rzp.open();
      
    } catch (error) {
      console.error("Checkout Error:", error);
      setUiState({ isSubmitting: false, paymentSuccess: false, paymentError: error.message });
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] space-y-8 relative overflow-hidden group" id="donation-module">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-emerald/10 via-brand-navy/5 to-transparent rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3 opacity-60"></div>
      
      <AnimatePresence mode="wait">
        {uiState.paymentSuccess ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 space-y-6 text-center z-10 relative"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-2 shadow-[0_10px_30px_rgba(16,185,129,0.2)] border border-white"
            >
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </motion.div>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-brand-navy-dark to-brand-navy tracking-tight">Thank You, {formData.name}!</h3>
            <p className="text-slate-600 max-w-md text-base leading-relaxed">
              Your contribution of <strong className="text-slate-900 font-bold">₹{activeAmount.toLocaleString('en-IN')}</strong> has been securely received. A confirmation receipt has been sent to <strong className="font-bold text-slate-900">{formData.email}</strong>.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="checkout-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 relative z-10"
          >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/60 pb-5 gap-4">
              <div>
                <h3 className="font-display font-extrabold text-2xl text-brand-navy tracking-tight">Select Contribution</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Directly audited support for verified elders</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm self-start sm:self-auto">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
                256-Bit Encrypted
              </div>
            </div>

            {/* Frequency Segment */}
            <div className="grid grid-cols-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 text-sm font-bold shadow-inner">
              <button 
                type="button"
                onClick={() => setFrequency('once')}
                className={`py-3 px-3 rounded-xl text-center transition-all duration-300 ${frequency === 'once' ? 'bg-white text-brand-navy shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
              >
                One-Time
              </button>
              <button 
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`py-3 px-3 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-2 ${frequency === 'monthly' ? 'bg-white text-brand-navy shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
              >
                <span>Monthly</span>
                <span className="bg-gradient-to-r from-brand-amber to-brand-amber-hover text-white text-[10px] px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider hidden xs:inline-block shadow-sm">Impactful</span>
              </button>
            </div>

            {/* Impact Tiers */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Select Impact Tier</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TIERS.map((tier) => {
                  const isActive = !customAmount && amount === tier.amount;
                  return (
                    <button 
                      key={tier.amount}
                      type="button"
                      onClick={() => handleTierSelect(tier.amount)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${isActive ? 'border-brand-navy ring-2 ring-brand-navy/20 bg-gradient-to-b from-brand-navy/5 to-transparent shadow-md scale-[1.02]' : 'border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-brand-navy/30 hover:shadow-sm'}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={`font-display font-extrabold text-xl tracking-tight ${isActive ? 'text-brand-navy' : 'text-slate-700'}`}>₹{tier.amount.toLocaleString('en-IN')}</span>
                        {tier.isPopular && (
                          <span className="text-[10px] bg-gradient-to-r from-brand-amber to-brand-amber-hover text-white font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">Popular</span>
                        )}
                      </div>
                      <p className={`text-sm font-medium mt-3 leading-relaxed ${isActive ? 'text-brand-navy-light' : 'text-slate-500'}`}>
                        {tier.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Impact Banner */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-emerald-200 relative shadow-sm">
                <img alt="Elderly mobility beneficiary" className="w-full h-full object-cover object-center" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDseqOym5vMkJS_W7sZfTRcIF6PmWqV_ylHhr8n_fu-MvTyFvNqrmR77ZkxTFFI5WCXWd2Wjj5zytvNKJiAhtAVfH7TpVL4GlqAo8-yMUwMGrCd_x5LymZeYZRDUmb3Vh1xe0NWe5f9lOT8BaAZRKBjJuHqxHevJvI7jiQUnwV4-k3p-g-PfwijY6Be6g4QSfzWJj5ubqPI_yCQA3kDmpKjrW8VCpV4WqSMoUKXjHn9RvsfivKSxJ4NBw"/>
              </div>
              <div className="flex-1 text-sm text-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm mb-1.5">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Direct Medical Impact:</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {getImpactDescription()}
                </p>
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2.5" htmlFor="customAmount">Or Enter Custom Amount</label>
              <div className="relative flex items-center group">
                <span className="absolute left-5 text-slate-400 font-medium text-xl transition-colors group-focus-within:text-brand-navy">₹</span>
                <input 
                  type="number" 
                  id="customAmount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) setAmount(0); // clear predefined tier
                  }}
                  className="w-full pl-11 pr-5 py-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl font-display font-extrabold text-slate-900 text-xl focus:bg-white focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 transition-all outline-none placeholder:text-slate-300 placeholder:font-normal shadow-inner" 
                  placeholder="Other amount (INR)" 
                  min="100"
                  step="100"
                />
              </div>
              <span className="text-xs text-slate-400 mt-2.5 block pl-1 font-medium">Minimum donation ₹100.</span>
            </div>

            {/* Donor Quick Form */}
            <form onSubmit={processCheckout} className="space-y-5 pt-6 border-t border-slate-200/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 pl-1 uppercase tracking-wider" htmlFor="name">Full Legal Name (as on PAN) <span className="text-brand-amber">*</span></label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                    className="w-full px-5 py-3.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 transition-all outline-none font-medium placeholder:font-normal"
                    placeholder="e.g. Radhika Sundaram" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 pl-1 uppercase tracking-wider" htmlFor="phone">WhatsApp Mobile <span className="text-brand-amber">*</span></label>
                  <div className="flex shadow-sm rounded-xl">
                    <span className="inline-flex items-center px-4 bg-slate-100/80 border border-r-0 border-slate-200/80 text-slate-500 text-sm rounded-l-xl font-bold">+91</span>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required 
                      pattern="[0-9]{10}"
                      className="w-full px-5 py-3.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-r-xl focus:bg-white focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 transition-all outline-none font-medium placeholder:font-normal"
                      placeholder="9876543210" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 pl-1 uppercase tracking-wider" htmlFor="email">Email Address <span className="text-brand-amber">*</span></label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  className="w-full px-5 py-3.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl focus:bg-white focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 transition-all outline-none font-medium placeholder:font-normal shadow-sm"
                  placeholder="radhika@example.com" 
                />
              </div>

              {/* Error Notification Toast */}
              {uiState.paymentError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-start gap-3 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px] text-red-500">error</span>
                  <span className="leading-snug">{uiState.paymentError}</span>
                </motion.div>
              )}

              {/* Primary Institutional CTA Button */}
              <button 
                type="submit" 
                disabled={uiState.isSubmitting || !isRazorpayLoaded}
                className="w-full py-5 px-6 bg-gradient-to-r from-brand-amber to-brand-amber-hover hover:from-brand-amber-hover hover:to-[#9e430d] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white font-display font-extrabold text-lg sm:text-xl rounded-2xl shadow-[0_8px_25px_rgba(200,90,23,0.35)] hover:shadow-[0_12px_30px_rgba(200,90,23,0.45)] transition-all flex items-center justify-center gap-3 mt-6 border border-amber-500/30"
              >
                {uiState.isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
                    <span>Routing to Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                    <span>Proceed to Donate ₹{activeAmount.toLocaleString('en-IN')} Securely</span>
                    <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Official Payment Modes Trust Badges Strip */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span className="font-semibold mr-1">Supported:</span>
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md font-bold text-[10px] text-slate-500 tracking-wider uppercase">UPI</span>
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md font-bold text-[10px] text-slate-500 tracking-wider uppercase">Cards</span>
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md font-bold text-[10px] text-slate-500 tracking-wider uppercase">NetBanking</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">shield</span>
                  Razorpay 256-bit SSL
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DonationCheckout;
