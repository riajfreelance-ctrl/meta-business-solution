import React, { useState } from 'react';
import { Users, Shield, UserPlus, Mail, Lock } from 'lucide-react';

const TeamManagement = () => {
    const [team, setTeam] = useState([
        { id: 1, name: 'Admin User', email: 'admin@metabiz.com', role: 'admin' },
        { id: 2, name: 'Sales Agent', email: 'sales@metabiz.com', role: 'sales' },
        { id: 3, name: 'Ads Manager', email: 'ads@metabiz.com', role: 'ads' }
    ]);

    const RoleBadge = ({ role }) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-700 border-purple-200',
            sales: 'bg-blue-100 text-blue-700 border-blue-200',
            ads: 'bg-orange-100 text-orange-700 border-orange-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[role]}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 flex items-center gap-3">
                        <Users className="text-prime-600" size={32} />
                        Team Governance
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage roles and permissions for your growth engine operators.</p>
                </div>
                <button className="bg-prime-600 hover:bg-prime-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-prime-500/20">
                    <UserPlus size={16} /> Invite Member
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Team List */}
                <div className="lg:col-span-2 space-y-4">
                    {team.map(member => (
                        <div key={member.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-lg transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black group-hover:bg-prime-500 group-hover:text-white transition-colors">
                                    {member.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{member.name}</p>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <RoleBadge role={member.role} />
                                <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                                    <Shield size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Permissions Guide */}
                <div className="bg-[#020617] p-8 rounded-[3rem] text-white space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                         <Lock className="text-prime-400" size={20} />
                         Role Permissions
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase text-purple-400 mb-1">Admin</p>
                            <p className="text-xs text-gray-400">Full engine control including settings, team, and billing.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Sales</p>
                            <p className="text-xs text-gray-400">Access to Inbox, CRM Intel, and Order Drafting.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase text-orange-400 mb-1">Ads Manager</p>
                            <p className="text-xs text-gray-400">Access to Campaigns, Audience Sync, and BI Analytics.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamManagement;
