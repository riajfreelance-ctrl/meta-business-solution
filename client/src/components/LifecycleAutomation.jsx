import React, { useState, useEffect } from 'react';
import { RefreshCcw, Send, UserCheck, ShieldAlert, TrendingUp } from 'lucide-react';

const LifecycleAutomation = ({ t }) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [stats, setStats] = useState({
        pendingFollowups: 0,
        churnRisk: 0,
        recovered: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${apiBase}/api/retention/stats`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const triggerAutomation = async (type) => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/retention/trigger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
            const data = await res.json();
            alert(`✅ ${type} triggered! Sent ${data.count} messages.`);
            fetchStats();
        } catch (error) {
            alert('❌ Automation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <TrendingUp className="text-blue-600" /> Lifecycle Marketing & Retention
                </h1>
                <button 
                    onClick={fetchStats}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <RefreshCcw size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <Send className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pending Follow-ups</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingFollowups}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-xl">
                        <ShieldAlert className="text-red-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Churn Risk Leads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.churnRisk}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl">
                        <UserCheck className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Recovered Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.recovered}</p>
                    </div>
                </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Automation Controls</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-semibold text-gray-900">Lead Re-targeting</p>
                            <p className="text-sm text-gray-500">Sends a gentle follow-up to leads interested in products but haven't bought yet.</p>
                        </div>
                        <button 
                            disabled={loading}
                            onClick={() => triggerAutomation('lead_retargeting')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-100 disabled:opacity-50"
                        >
                            Trigger Now
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-semibold text-gray-900">Churn Prevention</p>
                            <p className="text-sm text-gray-500">Sends a "Miss You" message to previous customers inactive for 30+ days.</p>
                        </div>
                        <button 
                            disabled={loading}
                            onClick={() => triggerAutomation('churn_prevention')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-purple-100 disabled:opacity-50"
                        >
                            Trigger Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Educational Info */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-blue-800 font-semibold mb-2">💡 Pro Tip for Growth</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                    Personalized follow-ups within 3 days can increase conversion rates by up to 25%. Ensure your AI tags are accurate in the CRM Intelligence tab for best results.
                </p>
            </div>
        </div>
    );
};

export default LifecycleAutomation;
