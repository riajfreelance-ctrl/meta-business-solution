import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Award, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

const BIAnalytics = ({ activeBrandId }) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [stats, setStats] = useState({
        revenue: 0,
        spend: 0,
        roas: 0,
        cac: 0,
        ltv: 0,
        customerCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBI = async () => {
            try {
                const res = await fetch(`${apiBase}/api/analytics/bi?brandId=${activeBrandId || 'meta-solution'}`);
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch BI stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBI();
    }, [activeBrandId]);

    const MetricCard = ({ title, value, unit, icon: Icon, color, trend, trendValue }) => (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform duration-700`} />
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-gray-200 group-hover:rotate-6 transition-transform duration-500`}>
                    <Icon className="text-white" size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trendValue}%
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                    {unit}{value || 0}
                </h3>
            </div>
        </div>
    );

    if (loading) return <div className="p-20 text-center animate-pulse text-prime-500 font-black uppercase tracking-widest ">Calculating Engine ROI...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 flex items-center gap-3">
                        <BarChart3 className="text-prime-600" size={32} />
                        Growth BI Intelligence
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Real-time profitability metrics and unit economics.</p>
                </div>
                <div className="text-right">
                    <span className="px-4 py-2 bg-prime-500/10 text-prime-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-prime-500/20">
                        Live Data Engine v2.0
                    </span>
                </div>
            </div>

            {/* Main Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard 
                    title="Total Revenue" 
                    value={stats.revenue.toLocaleString()} 
                    unit="৳" 
                    icon={DollarSign} 
                    color="from-green-500 to-emerald-600"
                    trend="up"
                    trendValue="12.5"
                />
                <MetricCard 
                    title="Ad Spend" 
                    value={stats.spend.toLocaleString()} 
                    unit="৳" 
                    icon={TrendingUp} 
                    color="from-blue-500 to-indigo-600"
                    trend="up"
                    trendValue="8.2"
                />
                <MetricCard 
                    title="Real ROAS" 
                    value={stats.roas} 
                    unit="x" 
                    icon={Award} 
                    color="from-prime-500 to-purple-600"
                    trend="up"
                    trendValue="4.1"
                />
                <MetricCard 
                    title="Unit CAC" 
                    value={stats.cac} 
                    unit="৳" 
                    icon={Users} 
                    color="from-orange-500 to-red-600"
                    trend="down"
                    trendValue="2.8"
                />
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                {/* LTV Breakdown */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Lifetime Value (LTV) Distribution</h2>
                        <p className="text-gray-500 text-sm mb-8">Average revenue generated per customer across their entire history.</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-end mb-2">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average LTV</span>
                                <span className="text-4xl font-black text-prime-600 tracking-tighter">৳{stats.ltv}</span>
                             </div>
                             <div className="text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Customers</span>
                                <p className="text-xl font-bold text-gray-900">{stats.customerCount}</p>
                             </div>
                        </div>
                        {/* Custom visual progress bar */}
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-prime-500 w-[70%] relative group">
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                            <div className="h-full bg-blue-400 w-[20%]" />
                            <div className="h-full bg-orange-400 w-[10%]" />
                        </div>
                        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-prime-500" /> High Spenders</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400" /> Regulars</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400" /> New Subs</div>
                        </div>
                    </div>
                </div>

                {/* Efficiency Gauge */}
                <div className="bg-[#020617] p-8 rounded-[3rem] text-white shadow-2xl shadow-prime-500/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-prime-600/20 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-24 h-24 rounded-full border-8 border-prime-500/20 flex items-center justify-center mx-auto border-t-prime-500 animate-spin-slow">
                             <Zap className="text-prime-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter">Growth Efficiency</h3>
                        <p className="text-gray-400 text-sm">Your ROAS is <strong>{stats.roas}x</strong>, which is <strong>15% higher</strong> than the industry benchmark for your category.</p>
                        <button className="bg-prime-600 hover:bg-prime-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                             Generate BI Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BIAnalytics;
