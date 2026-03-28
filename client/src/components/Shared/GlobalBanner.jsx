import React, { useState, useEffect } from 'react';
import { Megaphone, X, ArrowRight, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { db } from '../../firebase-client';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const GlobalBanner = ({ isDarkMode }) => {
  const [announcement, setAnnouncement] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const q = collection(db, "global_announcements");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Global Announcements Snapshot received. Count:", snapshot.size);
      if (!snapshot.empty) {
        // Filter and Sort client-side to be 100% resilient
        const docs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(d => d.isActive === true);
          
        docs.sort((a, b) => {
          const getMillis = (v) => {
            if (!v) return 0;
            if (v.toMillis) return v.toMillis();
            if (v.seconds) return v.seconds * 1000;
            if (v instanceof Date) return v.getTime();
            return new Date(v).getTime() || 0;
          };
          return getMillis(b.createdAt) - getMillis(a.createdAt);
        });
        
        if (docs.length > 0) {
          const latest = docs[0];
          console.log("Latest Announcement identified:", latest.title);
          setAnnouncement(latest);
          
          // Reset dismissal if it's a new announcement ID
          const lastDismissedId = localStorage.getItem('metasolution_last_dismissed_announcement');
          if (lastDismissedId === latest.id) {
            setIsDismissed(true);
          } else {
            setIsDismissed(false);
          }
        } else {
          setAnnouncement(null);
        }
      } else {
        setAnnouncement(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (announcement) {
      localStorage.setItem('metasolution_last_dismissed_announcement', announcement.id);
    }
  };

  if (!announcement || isDismissed) return null;

  const typeConfig = {
    info: { icon: Info, color: 'prime', bg: 'bg-prime-600', border: 'border-prime-400/30' },
    warning: { icon: AlertTriangle, color: 'amber', bg: 'bg-amber-600', border: 'border-amber-400/30' },
    feature: { icon: Sparkles, color: 'purple', bg: 'bg-purple-600', border: 'border-purple-400/30' }
  };

  const config = typeConfig[announcement.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className={`w-full overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-700 relative z-[40]`}>
      <div className={`relative px-8 py-4 rounded-[1.5rem] border ${config.bg} shadow-2xl overflow-hidden group`}>
        {/* Animated Background Polish */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <div className="absolute top-0 right-0 w-64 h-full bg-white opacity-5 blur-3xl -mr-10 -rotate-12" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">System Broadcast</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <h4 className="text-sm font-black text-white leading-tight">
                {announcement.title}
                <span className="ml-3 font-medium text-white/70 ">{announcement.message}</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {announcement.link && (
               <a 
                href={announcement.link} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
               >
                 View Update <ArrowRight size={14} />
               </a>
            )}
            <button 
              onClick={handleDismiss}
              className="p-2.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all border border-white/10"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBanner;
