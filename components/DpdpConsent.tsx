"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

// The lifespan of the consent in milliseconds (30 minutes)
const CONSENT_LIFESPAN = 30 * 60 * 1000;

interface DpdpContextType {
  hasConsent: boolean;
  requestConsent: () => void;
}

const DpdpContext = createContext<DpdpContextType>({ hasConsent: false, requestConsent: () => {} });

export const useDpdpConsent = () => useContext(DpdpContext);

export function DpdpProvider({ children }: { children: ReactNode }) {
  const [hasConsent, setHasConsent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [organization, setOrganization] = useState("");
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkConsent = () => {
      const consentTimestamp = localStorage.getItem("dpdp_consent_time");
      if (!consentTimestamp) {
        setHasConsent(false);
        return;
      }

      const timePassed = Date.now() - parseInt(consentTimestamp, 10);
      if (timePassed > CONSENT_LIFESPAN) {
        localStorage.removeItem("dpdp_consent_time");
        setHasConsent(false);
      } else {
        setHasConsent(true);
      }
    };

    checkConsent();

    const interval = setInterval(checkConsent, 60000);
    return () => clearInterval(interval);
  }, []);

  const requestConsent = () => {
    setShowPopup(true);
  };

  const handleAgree = async () => {
    if (!name || !designation || !organization || !check1 || !check2) return;
    
    setIsSubmitting(true);
    try {
      // We need to import logDataAccess
      const { logDataAccess } = await import('@/app/actions/consent');
      await logDataAccess({ name, designation, organization });
      
      localStorage.setItem("dpdp_consent_time", Date.now().toString());
      setHasConsent(true);
      setShowPopup(false);
    } catch (error) {
      console.error("Failed to log consent", error);
      alert("Something went wrong while recording your consent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DpdpContext.Provider value={{ hasConsent, requestConsent }}>
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
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Student Data Protection (DPDP Act)
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  You are about to access identifiable student data. Under the Digital Personal Data Protection (DPDP) Act, you must explicitly consent to the following:
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Designation</label>
                      <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none" placeholder="Teacher, PO, etc." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Organization</label>
                      <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 outline-none" placeholder="Pratham, Government, etc." />
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={check1} onChange={e => setCheck1(e.target.checked)} className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      I will use this data <strong>strictly for educational intervention purposes</strong>.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={check2} onChange={e => setCheck2(e.target.checked)} className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      I will not share, download, or distribute this identifiable information to unauthorized parties.
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <button 
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAgree}
                    disabled={isSubmitting || !name || !designation || !organization || !check1 || !check2}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? "Verifying..." : "I Agree & Continue"}
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
