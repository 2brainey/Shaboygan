import React, { useState, useMemo } from 'react';
import { 
  Activity, Box, Truck, Server, Database, 
  AlertTriangle, CheckCircle, RefreshCw,
  TrendingUp, DollarSign, Zap, ChevronRight,
  Plus, Search, Filter, Map, Crosshair
} from 'lucide-react';
// FIX: Ensure relative path points to sibling file with explicit extension
import { RenderIcon } from './dashboardutils.jsx'; 
// FIX: Ensure relative path points up two levels to store with explicit extension
import { useGameStore } from '../store/gamestore.js'; 

// --- ENTERPRISE CONFIGURATION ---
const NODE_TYPES = {
    'realEstate': { label: 'Distribution Hubs',    icon: 'Building', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-900/20' },
    'digitalIP':  { label: 'Data Centers',         icon: 'Server',   color: 'text-blue-400',    border: 'border-blue-500/50',    bg: 'bg-blue-900/20' },
    'crypto':     { label: 'Blockchain Nodes',     icon: 'Database', color: 'text-purple-400',  border: 'border-purple-500/50',  bg: 'bg-purple-900/20' },
    'metals':     { label: 'Material Reserves',    icon: 'Box',      color: 'text-amber-400',   border: 'border-amber-500/50',   bg: 'bg-amber-900/20' },
    'stocks':     { label: 'Market Indices',       icon: 'TrendingUp', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-900/20' }
};

export default function LogisticsDashboard() {
    const { data } = useGameStore(); 
    const [selectedNode, setSelectedNode] = useState(null);
    const [filterType, setFilterType] = useState('ALL');

    // 1. TELEMETRY SIMULATION (The "Health Check")
    const telemetry = useMemo(() => {
        // Defensive checks in case data hasn't loaded yet
        const energy = data?.wellness?.energy || 0;
        const focus = data?.wellness?.focus || 0;
        const income = data?.monthlyIncome || 0;
        
        return {
            status: energy > 40 ? 'OPERATIONAL' : 'DEGRADED',
            statusColor: energy > 40 ? 'text-emerald-500' : 'text-red-500',
            uptime: (99 + (focus / 1000)).toFixed(2) + '%',
            latency: Math.max(12, 100 - energy) + 'ms',
            throughput: (income / 30).toFixed(0) + ' TPS', 
            activeAlerts: energy < 30 ? 3 : 0
        };
    }, [data]);

    // 2. ASSET MAPPING (The "Grid")
    const gridNodes = useMemo(() => {
        let nodes = [];
        let idCounter = 0;

        if (!data || !data.assets) return [];

        Object.entries(data.assets).forEach(([key, value]) => {
            if (NODE_TYPES[key]) {
                // Visual scaling: 1 Node icon = $2,500 of value
                const count = Math.max(1, Math.floor(Number(value) / 2500)); 
                
                for(let i=0; i < Math.min(count, 12); i++) {
                    const isHealthy = Math.random() > 0.15; 
                    nodes.push({ 
                        id: `NODE-${key.substring(0,3).toUpperCase()}-${1000 + idCounter}`, 
                        type: key, 
                        value: value, 
                        status: isHealthy ? 'Active' : 'Warning',
                        load: Math.floor(Math.random() * 100) + '%',
                        temp: Math.floor(Math.random() * 40 + 40) + '°C'
                    });
                    idCounter++;
                }
            }
        });
        return nodes;
    }, [data]);

    const filteredNodes = filterType === 'ALL' ? gridNodes : gridNodes.filter(n => n.type === filterType);

    // LOADING STATE
    if (!data) return <div className="p-8 text-slate-500">Initializing Telemetry...</div>;

    return (
        <div className="h-full flex flex-col animate-in fade-in gap-4 p-4 bg-[#0f1219]">
            
            {/* HEADER: COMMAND CENTER STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div className="bg-[#1a1a1a] border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">System Status</div>
                            <div className={`text-xl font-mono font-bold ${telemetry.statusColor} flex items-center gap-2`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${telemetry.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                {telemetry.status}
                            </div>
                        </div>
                        <Activity className="text-slate-700 group-hover:text-slate-600 transition-colors" size={24}/>
                    </div>
                    <div className="mt-4 flex gap-4 text-[10px] font-mono text-slate-400">
                        <span>LAT: <span className="text-white">{telemetry.latency}</span></span>
                        <span>UP: <span className="text-white">{telemetry.uptime}</span></span>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-slate-800 p-4 rounded-xl hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Daily Throughput</div>
                            <div className="text-xl font-mono font-bold text-white">${((data.monthlyIncome || 0)/30).toFixed(2)}</div>
                        </div>
                        <TrendingUp className="text-emerald-500/50" size={24}/>
                    </div>
                    <div className="mt-4 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Zap size={10}/> Efficiency: 94.2%
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-slate-800 p-4 rounded-xl hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pending Contracts</div>
                            <div className="text-xl font-mono font-bold text-white">{(data.achievements || []).filter(a => !a.completed).length}</div>
                        </div>
                        <Box className="text-amber-500/50" size={24}/>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{width: '45%'}}></div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-slate-800 p-4 rounded-xl flex flex-col justify-center gap-2">
                    <button className="bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-500/30 rounded-lg py-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2">
                        <RefreshCw size={12}/> System Diagnostics
                    </button>
                    <button className="bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 rounded-lg py-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2">
                        <Map size={12}/> Network Topology
                    </button>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                
                {/* LEFT: INFRASTRUCTURE MAP */}
                <div className="flex-1 bg-[#151515] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 opacity-5 pointer-events-none" 
                         style={{ backgroundImage: 'linear-gradient(#404e6d 1px, transparent 1px), linear-gradient(90deg, #404e6d 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1a1a1a] relative z-10">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                            <Crosshair className="text-amber-500" size={16}/> Infrastructure Grid
                        </div>
                        <div className="flex gap-1 bg-black/30 p-1 rounded-lg border border-slate-700">
                            {['ALL', 'realEstate', 'digitalIP', 'crypto'].map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFilterType(f)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${filterType === f ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {f === 'ALL' ? 'GLOBAL' : NODE_TYPES[f]?.label.split(' ')[0].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {filteredNodes.map((node, i) => {
                                const config = NODE_TYPES[node.type];
                                const isSelected = selectedNode?.id === node.id;
                                
                                return (
                                    <button 
                                        key={i}
                                        onClick={() => setSelectedNode(node)}
                                        className={`
                                            aspect-square rounded-lg border flex flex-col items-center justify-center relative transition-all group
                                            ${isSelected 
                                                ? `bg-slate-800 ${config.border} shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-105 z-20` 
                                                : `bg-[#1e1e1e]/80 border-slate-800 hover:border-slate-600 hover:bg-[#252525]`
                                            }
                                        `}
                                    >
                                        <div className={`p-2.5 rounded-full mb-2 transition-transform group-hover:scale-110 ${config.bg} ${config.color}`}>
                                            <RenderIcon name={config.icon} size={20}/>
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{node.id.split('-')[1]}</div>
                                        <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${node.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-500 animate-pulse'}`}></div>
                                        <div className={`absolute bottom-2 px-1.5 py-0.5 rounded text-[8px] font-mono bg-black/50 text-slate-400 border border-slate-800 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            {node.temp}
                                        </div>
                                    </button>
                                )
                            })}
                            {[...Array(Math.max(0, 24 - filteredNodes.length))].map((_, i) => (
                                <div key={`ghost-${i}`} className="aspect-square rounded-lg border border-slate-800/30 border-dashed bg-transparent flex items-center justify-center opacity-20 pointer-events-none">
                                    <Plus size={14} className="text-slate-600"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: INSPECTOR PANEL */}
                <div className="lg:w-80 bg-[#1a1a1a] border border-slate-800 rounded-xl flex flex-col shadow-2xl shrink-0">
                    <div className="p-4 border-b border-slate-800 bg-[#1a1a1a]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Search size={12}/> Node Telemetry
                        </h3>
                    </div>
                    
                    {selectedNode ? (
                        <div className="p-6 flex-1 animate-in slide-in-from-right-4 flex flex-col">
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 mb-4 ${NODE_TYPES[selectedNode.type].border} ${NODE_TYPES[selectedNode.type].bg} shadow-xl`}>
                                    <RenderIcon name={NODE_TYPES[selectedNode.type].icon} size={40} className={NODE_TYPES[selectedNode.type].color}/>
                                </div>
                                <h2 className="text-lg font-bold text-white mb-1">{NODE_TYPES[selectedNode.type].label}</h2>
                                <div className="px-2 py-1 bg-black/40 rounded border border-slate-700 text-[10px] font-mono text-slate-400">
                                    ID: {selectedNode.id}
                                </div>
                            </div>

                            <div className="space-y-3 flex-1">
                                <div className="flex justify-between items-center p-3 bg-[#151515] rounded border border-slate-800">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Asset Value</span>
                                    <span className="text-sm text-white font-mono font-bold">${Number(selectedNode.value).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#151515] rounded border border-slate-800">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Current Load</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{width: selectedNode.load}}></div>
                                        </div>
                                        <span className="text-xs text-blue-400 font-mono">{selectedNode.load}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#151515] rounded border border-slate-800">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Op Status</span>
                                    <span className={`text-xs font-bold flex items-center gap-1.5 ${selectedNode.status === 'Active' ? 'text-emerald-400' : 'text-amber-500'}`}>
                                        {selectedNode.status === 'Active' ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                                        {selectedNode.status === 'Active' ? 'OPTIMAL' : 'WARNING'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#151515] rounded border border-slate-800">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Core Temp</span>
                                    <span className="text-xs text-slate-300 font-mono">{selectedNode.temp}</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 group">
                                View Full Logs <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 animate-pulse">
                                <Search size={24} className="opacity-50"/>
                            </div>
                            <p className="text-xs font-bold text-slate-500">NO NODE SELECTED</p>
                            <p className="text-[10px] text-slate-600 mt-2 max-w-[150px]">Select a node from the infrastructure grid to inspect real-time telemetry.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}