import React, { useState } from 'react';
import { 
    User, X, Shield, Trophy, Activity, 
    Wallet, Package, BookOpen, Clock, 
    TrendingUp, Map, Server
} from 'lucide-react';
import { useGameStore } from '../store/gamestore';
import { BackpackWidget, VaultWidget, BinderWidget } from './inventorywidgets';

// --- SUB-COMPONENT: STAT ROW ---
const StatRow = ({ icon: Icon, label, value, color = "text-slate-400" }) => (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3">
            <div className={`p-2 bg-slate-950 rounded-md ${color}`}>
                <Icon size={16} />
            </div>
            <span className="text-sm text-slate-400">{label}</span>
        </div>
        <span className="font-mono font-bold text-slate-200">{value}</span>
    </div>
);

export default function PlayerProfile({ isOpen, onClose, setActiveTab }) {
    const { data } = useGameStore();
    const [activeView, setActiveView] = useState('overview'); // 'overview' | 'assets'

    // --- Derived Global Stats ---
    const totalInventory = data.inventory?.filter(i => i).length || 0;
    const totalDiscipline = data.discipline || 0;
    const estateSize = data.estate?.gridDimension || 1;
    const pbWins = data.record?.w || 0; // Assuming pro-bending record is stored here based on previous context
    const pbLosses = data.record?.l || 0;
    
    // Calculate "Account Level" based on arbitrary metrics (just for flavor)
    const accountLevel = Math.floor(totalDiscipline / 10000) + 1;

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header Profile Card */}
                <div className="relative p-6 pb-8 bg-gradient-to-b from-emerald-900/20 to-slate-950 border-b border-slate-800 shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-5 mt-2">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-1 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                <User size={40} className="text-emerald-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-white tracking-tight">System Admin</h2>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                            </div>
                            <div className="text-slate-400 text-xs font-mono mb-2">ID: DEV-8821-X</div>
                            <div className="flex gap-2">
                                <div className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1">
                                    <Shield size={10} className="text-purple-400"/> Level {accountLevel}
                                </div>
                                <div className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1">
                                    <Clock size={10} className="text-blue-400"/> Session: 02:14:22
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 shrink-0">
                    <button 
                        onClick={() => setActiveView('overview')} 
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'overview' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                    >
                        Career Statistics
                    </button>
                    <button 
                        onClick={() => setActiveView('assets')} 
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'assets' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                    >
                        Assets & Inventory
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                    
                    {/* VIEW: OVERVIEW */}
                    {activeView === 'overview' && (
                        <div className="space-y-6">
                            {/* Economy Stats */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <TrendingUp size={14}/> Economy Metrics
                                </h3>
                                <StatRow icon={Activity} label="Total Discipline Generated" value={totalDiscipline.toLocaleString()} color="text-pink-500" />
                                <StatRow icon={Wallet} label="Liquid Vault Assets" value={(data.bankBalance || 0).toLocaleString()} color="text-emerald-500" />
                                <StatRow icon={Package} label="Inventory Utilization" value={`${totalInventory} / 20 Slots`} color="text-orange-500" />
                            </div>

                            {/* Module Stats */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 flex items-center gap-2">
                                    <Server size={14}/> System Modules
                                </h3>
                                <StatRow icon={Map} label="Estate Grid Expansion" value={`${estateSize}x${estateSize} Sectors`} color="text-blue-500" />
                                <StatRow icon={Trophy} label="Pro-Bending Record" value={`${pbWins}W - ${pbLosses}L`} color="text-yellow-500" />
                            </div>
                        </div>
                    )}

                    {/* VIEW: ASSETS */}
                    {activeView === 'assets' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            {/* We re-use the Widgets here for consistent UI */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Liquid Assets</h3>
                                <VaultWidget />
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Physical Storage</h3>
                                <BackpackWidget setActiveTab={setActiveTab} />
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Card Collection</h3>
                                <BinderWidget setActiveTab={setActiveTab} />
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer / Quick Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
                    <button 
                        onClick={() => { setActiveTab('inventory'); onClose(); }}
                        className="w-full py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Package size={16} /> Open Full Management Console
                    </button>
                </div>

            </div>
        </>
    );
}