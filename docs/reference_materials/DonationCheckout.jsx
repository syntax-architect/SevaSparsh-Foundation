import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Custom hook to dynamically load the Razorpay checkout script
 * Ensures the script is only loaded once and cleans up on unmount to prevent memory leaks.
 */
const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If already loaded, just return
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
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return isLoaded;
};

const DonationCheckout = ({ initialAmount = 1500 }) => {
  const isRazorpayLoaded = useRazorpay();
  
  // 1. Robust State Management
  const [amount, setAmount] = useState(initialAmount);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    panNumber: '',
    request80G: true
  });
  
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    paymentSuccess: false,
    paymentError: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 3. The Submission Flow
  const processCheckout = async (e) => {
    e.preventDefault();
    
    if (!isRazorpayLoaded) {
      setUiState(prev => ({ ...prev, paymentError: 'Payment gateway is still loading. Please try again in a moment.' }));
      return;
    }
    
    if (amount < 100) {
      setUiState(prev => ({ ...prev, paymentError: 'Minimum donation amount is ₹100' }));
      return;
    }

    setUiState(prev => ({ ...prev, isSubmitting: true, paymentError: null }));

    try {
      // Step A: Create order on backend
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pan_number: formData.request80G ? formData.panNumber : null,
          amount: amount
        })
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create order securely.');
      }

      // Step B: Initialize Razorpay Checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Use your publishable key here
        amount: orderData.amount, // in paise
        currency: orderData.currency,
        name: "SevaSparsh Foundation",
        description: "Elderly Winter Healthcare & Mobility Fund",
        order_id: orderData.order_id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#0f294a" // Matches brand-navy
        },
        // 4. The Callback Handling
        handler: async function (response) {
          try {
            // Verify Payment Signature on Backend
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
      
      // Catch modal closure or failure
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
    <div className="bg-white border-2 border-[#0f294a]/30 rounded-lg p-4 sm:p-6 shadow-sm space-y-5 relative overflow-hidden" id="donation-module">
      <AnimatePresence mode="wait">
        {uiState.paymentSuccess ? (
          // Success State Animation
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-8 space-y-4 text-center z-10 relative"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </motion.div>
            <h3 className="font-display font-bold text-2xl text-slate-900">Thank You, {formData.name}!</h3>
            <p className="text-slate-600 max-w-sm text-sm">
              Your contribution of ₹{amount.toLocaleString('en-IN')} has been securely received. Your 80G tax receipt has been sent to <span className="font-semibold">{formData.email}</span>.
            </p>
          </motion.div>
        ) : (
          // Checkout Form State
          <motion.form 
            key="checkout-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={processCheckout} 
            className="space-y-4 relative z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-[#0f294a]">Complete Contribution</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <span className="material-symbols-outlined text-[14px] text-emerald-700">lock</span>
                256-Bit SSL Encrypted
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="name">Full Legal Name (as on PAN) *</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#0f294a] focus:ring-1 focus:ring-[#0f294a]"
                  placeholder="e.g. Radhika Sundaram" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="phone">WhatsApp Mobile *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 bg-slate-100 border border-r-0 border-slate-300 text-slate-600 text-xs rounded-l">+91</span>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required 
                    pattern="[0-9]{10}"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-r focus:border-[#0f294a] focus:ring-1 focus:ring-[#0f294a]"
                    placeholder="9876543210" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">Email Address (For Tax Form 10BE) *</label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required 
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-[#0f294a] focus:ring-1 focus:ring-[#0f294a]"
                placeholder="radhika@example.com" 
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input 
                type="checkbox" 
                id="request80G"
                name="request80G"
                checked={formData.request80G}
                onChange={handleInputChange}
                className="mt-0.5 rounded border-slate-300 text-[#0f294a] focus:ring-[#0f294a]" 
              />
              <label className="text-xs text-slate-600 leading-snug" htmlFor="request80G">
                I request Section 80G tax exemption certificate. (PAN required)
              </label>
            </div>

            {/* Conditionally reveal PAN input using framer-motion */}
            <AnimatePresence>
              {formData.request80G && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="panNumber">PAN Card Number *</label>
                  <input 
                    type="text" 
                    id="panNumber"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    required={formData.request80G} 
                    pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded uppercase focus:border-[#0f294a] focus:ring-1 focus:ring-[#0f294a]"
                    placeholder="ABCDE1234F" 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Notification Toast */}
            {uiState.paymentError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-xs p-3 rounded border border-red-200 flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{uiState.paymentError}</span>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={uiState.isSubmitting || !isRazorpayLoaded}
              className="w-full py-3.5 px-4 bg-[#c85a17] hover:bg-[#b24d10] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-md shadow transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {uiState.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Proceed to Donate ₹${amount.toLocaleString('en-IN')} Securely`
              )}
            </button>
            
            {/* Safe Badges */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-600">Supported:</span>
                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold">UPI / QR</span>
                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold">Cards</span>
                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold">NetBanking</span>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationCheckout;
