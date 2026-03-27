import React, { useState } from 'react';
import { Beaker, TrendingUp, Target, Zap, MousePointer2, BarChart3 } from 'lucide-react';

const GrowthExperiments = ({ brandId }) => {
    const [metrics, setMetrics] = useState([
        { persona: 'Friendly', conversions: 45, sessions: 200, rate: 22.5 },
        { persona: 'Professional', conversions: 38, sessions: 190, rate: 20.0 },
        { persona: 'Direct', conversions: 52, sessions: 210, rate: 24.8 },
        { persona: 'Storyteller', conversions: 31, sessions: 180, rate: 17.2 }
    ]);
    const [loading, setLoading] = useState(false);

    const StatCard = ({ title, value, sub, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{value}</h3>
                </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">{sub}</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 flex items-center gap-3">
                        <Beaker className="text-prime-600" size={32} />
                        Growth Experiments
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">AI Split Testing and Funnel Optimization Sandbox.</p>
                </div>
                <div className="px-4 py-2 bg-prime-500/10 text-prime-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-prime-500/20">
                    Live A/B Testing: ACTIVE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard 
                    title="Active Persona" 
                    value="Direct" 
                    sub="Current high-performer with 24.8% CR" 
                    icon={Target} 
                    color="from-prime-500 to-purple-600"
                />
                <StatCard 
                    title="Funnel Velocity" 
                    value="+18.2%" 
                    sub="Improvement since Autopilot v2" 
                    icon={Zap} 
                    color="from-orange-500 to-red-600"
                />
                <StatCard 
                    title="Conversion Lift" 
                    value="+5.4x" 
                    sub="Compared to manual human replies" 
                    icon={TrendingUp} 
                    color="from-green-500 to-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* A/B Test Results */}
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm shadow-gray-200/50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Persona Performance</h2>
                            <p className="text-gray-500 text-sm">Real-time conversion metrics per AI style.</p>
                        </div>
                        <BarChart3 className="text-gray-300" size={24} />
                    </div>
                    
                    <div className="space-y-6">
                        {metrics.map((m, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span>{m.persona}</span>
                                    <span>{m.rate}% <span className="text-gray-300 font-medium">({m.conversions} Orders)</span></span>
                                </div>
                                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                    <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${idx === 2 ? 'from-prime-600 to-prime-400' : 'from-gray-300 to-gray-200'} transition-all duration-1000`} 
                                        style={{ width: `${m.rate * 3}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Funnel Stages */}
                <div className="bg-[#020617] p-8 rounded-[3rem] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-prime-500/10 blur-[100px] rounded-full" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Autopilot Funnel Health</h2>
                            <p className="text-gray-400 text-sm mb-8">Drop-off tracking from Inquiry to Order Confirmation.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { stage: 'Inquiry', count: 1200, drop: 0 },
                                { stage: 'Price Given', count: 850, drop: 29 },
                                { stage: 'Closing (Address)', count: 420, drop: 51 },
                                { stage: 'Order Confirmed', count: 156, drop: 63 }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${i === 3 ? 'bg-green-500' : 'bg-prime-500/20 text-prime-400'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-gray-300">{s.stage}</span>
                                            <span className="text-[10px] font-black text-prime-400">{s.count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-prime-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(s.count / 1200) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-12 text-right">
                                        <span className="text-[10px] font-black text-red-400">{s.drop > 0 ? `-${s.drop}%` : 'Stable'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-prime-500/10 border border-prime-500/20 rounded-2xl flex items-center gap-3">
                             <div className="p-2 bg-prime-500 rounded-xl">
                                <MousePointer2 size={16} className="text-white" />
                             </div>
                             <p className="text-xs font-medium text-gray-300">
                                AI has successfully automated <strong>156 orders</strong> this week.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthExperiments;
