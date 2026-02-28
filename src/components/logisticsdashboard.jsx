import React, { useState, useEffect } from 'react';
import { 
    Users, Package, Wrench, AlertTriangle, CheckCircle, 
    ClipboardList, Map, ShieldAlert, Droplet, Zap, Utensils
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'shaboygan_estate_planner_v1';
const PEAK_CAPACITY_TARGET = 50;
const STORAGE_PER_PERSON_PER_DAY = 0.11; // cubic feet

export default function LogisticsDashboard() {
    // 1. Pull data from the Estate Planner to ensure they are linked
    const [estateData, setEstateData] = useState({
        active_pop: 5,
        beds_total: 0,
        storage_total: 0,
        labor_used: 0,
        labor_cap: 0,
        water_cap: 0,
        power_cap: 0
    });

    useEffect(() => {
        const fetchEstateData = () => {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.resources) setEstateData(parsed.resources);
            }
        };
        fetchEstateData();
        // Set up an interval to keep logistics synced if opened in a split view
        const sync = setInterval(fetchEstateData, 2000);
        return () => clearInterval(sync);
    }, []);

    // 2. Logistics Math
    const activePop = estateData.active_pop || 1;
    const storageNeeded90Days = activePop * STORAGE_PER_PERSON_PER_DAY * 90;
    const currentPantryDays = Math.floor(estateData.storage_total / (activePop * STORAGE_PER_PERSON_PER_DAY));
    
    // Mock data for the "Chore OS" based on estate size
    const generatedTasks = [
        { id: 1, title: 'Deep Well Filter Flush', category: 'Water', hrs: 2, status: estateData.water_cap > 0 ? 'Pending' : 'N/A' },
        { id: 2, title: 'Solar Array Dusting', category: 'Power', hrs: 4, status: estateData.power_cap > 0 ? 'In Progress' : 'N/A' },
        { id: 3, title: 'Dry Goods Inventory Audit', category: 'Supply', hrs: 3, status: 'Pending' },
        { id: 4, title: 'Septic Leach Field Insp.', category: 'Waste', hrs: 5, status: 'Pending' }
    ].filter(t => t.status !== 'N/A');

    return (
        <div className="h-full w-full flex flex-col bg-[#0b0e14] text-slate-200 overflow-y-auto custom-scrollbar p-6">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="flex items-center gap-3 text-2xl font-black text-white tracking-widest uppercase">
                    <ClipboardList className="text-blue-500" size={28} />
                    Communal Logistics OS
                </h1>
                <p className="text-slate-500 text-xs font-mono mt-2">
                    Network Governance & Supply Chain Management // <span className="text-blue-500">Live</span>
                </p>
            </div>

            {/* Top Level Warnings/Status */}
            {estateData.beds_total < estateData.active_pop && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-6 flex items-center gap-4 text-red-400">
                    <ShieldAlert size={24} />
                    <div>
                        <h3 className="font-bold text-sm">Housing Deficit Detected</h3>
                        <p className="text-xs text-red-400/80">Active population ({estateData.active_pop}) exceeds built bed capacity ({estateData.beds_total}). Expand habitation infrastructure.</p>
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: Population & Housing */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#12161f] border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2"><Users size={16} className="text-blue-400"/> Occupancy Matrix</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-mono mb-1 text-slate-400">
                                    <span>Current On-Site</span>
                                    <span className="text-blue-400">{estateData.active_pop} Pax</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (estateData.active_pop / PEAK_CAPACITY_TARGET) * 100)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-mono mb-1 text-slate-400">
                                    <span>Peak Bed Readiness</span>
                                    <span className={estateData.beds_total >= PEAK_CAPACITY_TARGET ? "text-emerald-400" : "text-amber-400"}>{estateData.beds_total} / {PEAK_CAPACITY_TARGET} Beds</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${estateData.beds_total >= PEAK_CAPACITY_TARGET ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (estateData.beds_total / PEAK_CAPACITY_TARGET) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-3 bg-slate-900 rounded-xl border border-slate-800">
                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Network Branch Status</div>
                            <div className="space-y-2 text-xs font-mono">
                                <div className="flex justify-between items-center"><span className="text-slate-400">Core Family</span> <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">Resident</span></div>
                                <div className="flex justify-between items-center"><span className="text-slate-400">Extended Network</span> <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded">Standby</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Bulk Supply Chain */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#12161f] border border-slate-800 rounded-2xl p-5 shadow-lg h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2"><Package size={16} className="text-orange-400"/> Supply Chain (90-Day Focal)</h2>
                        </div>

                        <div className="flex flex-col items-center justify-center mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Estimated Runway</span>
                            <span className={`text-4xl font-black font-mono ${currentPantryDays >= 90 ? 'text-emerald-400' : currentPantryDays >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                                {currentPantryDays}
                            </span>
                            <span className="text-xs text-slate-500">Days of bulk supplies for {activePop} people</span>
                        </div>

                        <div className="space-y-5">
                            {/* Caloric/Dry Goods */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1"><Utensils size={12}/> Dry Goods & Rations</span>
                                    <span className="text-[10px] font-mono text-slate-500">{estateData.storage_total} ft³</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-orange-500 h-1.5" style={{ width: `${Math.min(100, (estateData.storage_total / storageNeeded90Days) * 100)}%` }}></div>
                                </div>
                            </div>
                            
                            {/* Water Potability */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1"><Droplet size={12}/> Potable Water Flow</span>
                                    <span className="text-[10px] font-mono text-slate-500">{estateData.water_cap} GPD</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-1.5 ${estateData.water_cap >= (activePop * 50) ? 'bg-cyan-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (estateData.water_cap / (activePop * 50)) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Chore OS & Maintenance */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#12161f] border border-slate-800 rounded-2xl p-5 shadow-lg h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2"><Wrench size={16} className="text-slate-400"/> Chore & Maintenance OS</h2>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 mb-4">
                            <div className={`p-2 rounded-lg ${estateData.labor_used > estateData.labor_cap ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                {estateData.labor_used > estateData.labor_cap ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Crew Loading</div>
                                <div className="text-sm font-mono font-bold text-white">{estateData.labor_used} / {estateData.labor_cap} <span className="text-[10px] font-sans text-slate-500">hrs/week</span></div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {generatedTasks.length > 0 ? generatedTasks.map(task => (
                                <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center group hover:border-slate-600 transition-colors">
                                    <div>
                                        <div className="text-xs font-bold text-slate-200 mb-0.5">{task.title}</div>
                                        <div className="text-[9px] font-mono text-slate-500 uppercase">{task.category} • {task.hrs} hrs</div>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${task.status === 'Pending' ? 'bg-amber-900/30 text-amber-500' : 'bg-blue-900/30 text-blue-400'}`}>
                                        {task.status}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-600 text-xs font-mono border border-dashed border-slate-800 rounded-xl">
                                    No infrastructure built yet.<br/>Zero maintenance required.
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}