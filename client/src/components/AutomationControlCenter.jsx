import React, { useState, useEffect } from 'react';
import { Power, Zap, Target, Users, RefreshCw, Layers } from 'lucide-react';

const AutomationControlCenter = () => {
    const [settings, setSettings] = useState({
        enableRetargeting: true,
        enableChurnPrevention: true,
        enableInventorySync: true,
        enableSplitTesting: true,
        enableAutopilot: true
    });
    const [loading, setLoading] = useState(true);
    const [killSwitchLoading, setKillSwitchLoading] = useState(false);
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${apiBase}/api/settings/automation`);
                const data = await res.json();
                setSettings(data);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleFeature = async (key) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));
        try {
            await fetch(`${apiBase}/api/settings/automation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
                body: JSON.stringify({ key, value: newValue })
            });
        } catch (error) {
            console.error('Failed to update setting:', error);
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    const handleKillSwitch = async () => {
        if (!window.confirm('⚠️ সতর্কতা: সব অটোমেশন বন্ধ হয়ে যাবে। আপনি কি নিশ্চিত?')) return;
        setKillSwitchLoading(true);
        try {
            await fetch(`${apiBase}/api/settings/automation/disable-all`, {
                method: 'POST',
                headers: { 'x-user-role': 'admin' }
            });
            setSettings({ enableRetargeting: false, enableChurnPrevention: false, enableInventorySync: false, enableSplitTesting: false, enableAutopilot: false });
        } catch (error) {
            console.error('Kill switch failed:', error);
        } finally {
            setKillSwitchLoading(false);
        }
    };

    const ControlRow = ({ id, label, description, icon: Icon }) => (
        <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${settings[id] ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/20' : 'bg-gray-100 text-gray-400'} transition-all`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-prime-600 transition-colors uppercase tracking-tight">{label}</h3>
                    <p className="text-sm text-gray-500 font-medium">{description}</p>
                </div>
            </div>
            <button 
                onClick={() => toggleFeature(id)}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${settings[id] ? 'bg-prime-600' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings[id] ? 'translate-x-8' : ''}`} />
            </button>
        </div>
    );

    if (loading) return <div className="p-20 text-center animate-pulse text-prime-500 font-black tracking-widest uppercase italic">Initializing Control Deck...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 flex items-center gap-3">
                        <Power className="text-prime-600" size={32} />
                        Automation Control Center
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage the pulse of your Growth Engine automations.</p>
                </div>
                <div className="px-4 py-2 bg-green-500/10 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                    System Health: OPTIMAL
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-4xl">
                <ControlRow 
                    id="enableRetargeting" 
                    label="AI Lead Re-targeting" 
                    description="Automatically follow-up with interested leads who haven't purchased."
                    icon={Target}
                />
                <ControlRow 
                    id="enableChurnPrevention" 
                    label="Churn Prevention Engine" 
                    description="Identify and re-engage inactive customers with automated offers."
                    icon={RefreshCw}
                />
                <ControlRow 
                    id="enableInventorySync" 
                    label="Smart Inventory-Ad Sync" 
                    description="Automatically pause ads for products that go out of stock."
                    icon={Layers}
                />
                <ControlRow 
                    id="enableSplitTesting" 
                    label="AI Split Testing (A/B)" 
                    description="Run experiments on AI personas to optimize conversion rates."
                    icon={Zap}
                />
                <ControlRow 
                    id="enableAutopilot" 
                    label="Autopilot Sales Funnel" 
                    description="End-to-end automated sales guidance from inquiry to order."
                    icon={Users}
                />
            </div>

            <div className="p-8 bg-[#020617] rounded-[3rem] text-white overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-prime-600/30 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter">Emergency Master Kill Switch</h2>
                        <p className="text-gray-400 text-sm">Immediately pause all outgoing automated communications across all channels.</p>
                    </div>
                    <button 
                        onClick={handleKillSwitch}
                        disabled={killSwitchLoading}
                        className={`px-12 py-4 ${killSwitchLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'} text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 active:scale-95`}
                    >
                        {killSwitchLoading ? 'DEACTIVATING...' : 'DEACTIVATE ALL'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutomationControlCenter;
