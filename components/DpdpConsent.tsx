"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

// The lifespan of the consent in milliseconds (30 minutes)
const CONSENT_LIFESPAN = 30 * 60 * 1000;

interface DpdpContextType {
  hasConsent: boolean;
}

const DpdpContext = createContext<DpdpContextType>({ hasConsent: false });

export const useDpdpConsent = () => useContext(DpdpContext);

export function DpdpProvider({ children }: { children: ReactNode }) {
  const [hasConsent, setHasConsent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkConsent = () => {
      const consentTimestamp = localStorage.getItem("dpdp_consent_time");
      if (!consentTimestamp) {
        setHasConsent(false);
        setShowPopup(true);
        return;
      }

      const timePassed = Date.now() - parseInt(consentTimestamp, 10);
      if (timePassed > CONSENT_LIFESPAN) {
        // Expired
        localStorage.removeItem("dpdp_consent_time");
        setHasConsent(false);
        setShowPopup(true);
      } else {
        // Valid
        setHasConsent(true);
        setShowPopup(false);
      }
    };

    checkConsent();

    // Re-check every minute just in case they leave the tab open
    const interval = setInterval(checkConsent, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAgree = () => {
    localStorage.setItem("dpdp_consent_time", Date.now().toString());
    setHasConsent(true);
    setShowPopup(false);
  };

  return (
    <DpdpContext.Provider value={{ hasConsent }}>
      {children}
      {mounted && showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Background design */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Student Data Protection (DPDP Act)
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  You are about to access identifiable student data. Under the Digital Personal Data Protection (DPDP) Act, you must explicitly consent to the following:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>I will use this data <strong>strictly for educational intervention purposes</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>I will not share, download, or distribute this identifiable information to unauthorized parties.</span>
                  </li>
                </ul>

                <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 italic">
                  Note: This consent is required every 30 minutes to ensure continuous data security.
                </p>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={handleAgree}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                  >
                    I Agree & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DpdpContext.Provider>
  );
}
