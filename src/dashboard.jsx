import React from 'react';
import { 
  Activity, Layout, Hammer, Terminal, 
  Package, Map, ShoppingBag, Server,
  CheckCircle2, Circle, ArrowRight
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  return (
    <div className="h-full w-full bg-slate-950 text-slate-200 p-8 overflow-y-auto font-sans custom-scrollbar">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Terminal className="text-emerald-500" size={32} />
            <span>PROJECT DASHBOARD</span>
            </h1>
            <p className="text-slate-500 text-sm font-mono">
            System Version 0.2.0 // Modules Loaded: 6
            </p>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Current Session</div>
            <div className="text-emerald-400 font-mono">DEV_ENVIRONMENT_ACTIVE</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core Apps */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Development Tools */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Hammer size={14} /> Development Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* UI Builder */}
                <div onClick={() => setActiveTab('uibuilder')} className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/10">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-900/20 rounded-md text-blue-400 group-hover:text-white transition-colors"><Layout size={20} /></div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">ACTIVE</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">UI Builder</h3>
                    <p className="text-slate-400 text-xs">Interface construction engine.</p>
                </div>

                {/* Base Station */}
                <div onClick={() => setActiveTab('basegame')} className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-900/10">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-indigo-900/20 rounded-md text-indigo-400 group-hover:text-white transition-colors"><Activity size={20} /></div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">ACTIVE</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">BaseStation</h3>
                    <p className="text-slate-400 text-xs">Resource grid simulation.</p>
                </div>
            </div>
          </div>

          {/* Section: Game Modules (NEW) */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Server size={14} /> Game Modules (Batch 1)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Logistics */}
                <div onClick={() => setActiveTab('logistics')} className="group flex items-center gap-4 bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-lg p-4 cursor-pointer transition-all">
                    <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Map size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">Logistics Network</h4>
                        <p className="text-xs text-slate-500">Node telemetry & infrastructure map.</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Inventory */}
                <div onClick={() => setActiveTab('inventory')} className="group flex items-center gap-4 bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-lg p-4 cursor-pointer transition-all">
                    <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Package size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">Inventory System</h4>
                        <p className="text-xs text-slate-500">Backpack, Bank Vault & Card Binder.</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Estate */}
                <div onClick={() => setActiveTab('estate')} className="group flex items-center gap-4 bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-lg p-4 cursor-pointer transition-all">
                    <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Estate Blueprint</h4>
                        <p className="text-xs text-slate-500">Isometric room builder & expansion.</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Shop */}
                <div onClick={() => setActiveTab('shop')} className="group flex items-center gap-4 bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-lg p-4 cursor-pointer transition-all">
                    <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Black Market</h4>
                        <p className="text-xs text-slate-500">Item catalog & daily rewards.</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>

            </div>
          </div>

        </div>

        {/* Right Column: Status */}
        <div className="space-y-6">
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Integration Status</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 items-center">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                <span className="text-sm text-slate-300">Core Dashboard</span>
              </li>
              <li className="flex gap-3 items-center">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                <span className="text-sm text-slate-300">Batch 1 Modules</span>
              </li>
              <li className="flex gap-3 items-center">
                <Circle className="text-amber-500 shrink-0 animate-pulse" size={16} />
                <span className="text-sm text-slate-300">Utility Widgets</span>
              </li>
              <li className="flex gap-3 items-center">
                <Circle className="text-slate-600 shrink-0" size={16} />
                <span className="text-sm text-slate-500">Global Store (Zustand)</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}