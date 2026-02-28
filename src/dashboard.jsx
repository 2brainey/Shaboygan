import React from 'react';
import { 
    Terminal, Hammer, Package, Map, ShoppingBag, 
    Trophy, Layout, Brain, DollarSign, Wrench, Activity, ChevronRight
} from 'lucide-react';
import { useGameStore } from './store/gamestore';

// Helper component for the module navigation cards
const ModuleCard = ({ title, description, icon: Icon, status, statusColor, onClick, stats }) => (
    <div 
        onClick={onClick}
        className="relative bg-gray-900/50 border border-gray-800 rounded-lg p-5 hover:bg-gray-800/50 hover:border-gray-600 transition-all cursor-pointer group overflow-hidden"
    >
        {/* Background Accent Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 blur-lg transition-all"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-950 rounded-md border border-gray-800 text-gray-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="text-white font-bold tracking-wide text-sm">{title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{description}</p>
                </div>
            </div>
            {status && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${statusColor}`}>
                    {status}
                </span>
            )}
        </div>

        {/* Optional quick stats section */}
        {stats && (
            <div className="mt-4 pt-4 border-t border-gray-800/50 flex gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase">{stat.label}</span>
                        <span className="text-sm font-mono text-gray-300">{stat.value}</span>
                    </div>
                ))}
            </div>
        )}

        {/* Hover Arrow */}
        <div className="absolute bottom-4 right-4 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
            <ChevronRight size={18} />
        </div>
    </div>
);

export default function Dashboard({ setActiveTab }) {
    const { data } = useGameStore();

    // Calculate some quick stats for the dashboard summaries
    const inventoryUsed = data.inventory.filter(item => item !== null).length;
    const inventoryTotal = data.inventory.length;
    const cardsOwned = data.cards?.length || 0;
    const estateSize = `${data.estate?.gridDimension || 4}x${data.estate?.gridDimension || 4}`;

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-6">
            
            {/* --- HEADER --- */}
            <div className="mb-8">
                <h1 className="flex items-center gap-3 text-2xl font-black text-white tracking-widest uppercase">
                    <Terminal className="text-emerald-500" />
                    Project Dashboard
                </h1>
                <p className="text-gray-500 text-xs font-mono mt-2">
                    System Version 0.2.3 // <span className="text-emerald-500">Command Center Active</span>
                </p>
            </div>

            {/* --- TOP ROW: VAULT ASSETS (Currencies) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="text-pink-500" size={24} />
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Brain Matter (BM)</p>
                            <p className="text-xl font-mono text-white">{data.discipline.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DollarSign className="text-emerald-500" size={24} />
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Liquid Cash</p>
                            <p className="text-xl font-mono text-white">${(data.cash || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wrench className="text-slate-400" size={24} />
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Salvage</p>
                            <p className="text-xl font-mono text-white">{data.salvage?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN GRID: MODULE NAVIGATION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <ModuleCard 
                    title="Inventory System" 
                    description="Manage items, gear, and resources." 
                    icon={Package} 
                    onClick={() => setActiveTab('inventory')}
                    status={`${inventoryUsed}/${inventoryTotal} Slots`}
                    statusColor={inventoryUsed >= inventoryTotal ? "text-red-400 bg-red-900/20" : "text-emerald-400 bg-emerald-900/20"}
                    stats={[
                        { label: "Items", value: inventoryUsed },
                        { label: "Bank", value: data.bank?.filter(i => i !== null).length || 0 }
                    ]}
                />

                <ModuleCard 
                    title="Black Market" 
                    description="Trade currencies for boosters and gear." 
                    icon={ShoppingBag} 
                    onClick={() => setActiveTab('shop')}
                    status="Online"
                    statusColor="text-emerald-400 bg-emerald-900/20"
                    stats={[
                        { label: "Purchases", value: data.statistics?.itemsBought || 0 }
                    ]}
                />

                <ModuleCard 
                    title="Estate Blueprint" 
                    description="Grid-based habitat management." 
                    icon={Layout} 
                    onClick={() => setActiveTab('estate')}
                    status={`Grid: ${estateSize}`}
                    statusColor="text-blue-400 bg-blue-900/20"
                />

                <ModuleCard 
                    title="Pro-Bending League" 
                    description="League Manager Module." 
                    icon={Trophy} 
                    onClick={() => setActiveTab('probending')}
                    status="Access Arena"
                    statusColor="text-amber-400 bg-amber-900/20"
                    stats={[
                        { label: "Cards Owned", value: cardsOwned }
                    ]}
                />

                

                <ModuleCard 
                    title="Logistics Network" 
                    description="Route and manage automated tasks." 
                    icon={Map} 
                    onClick={() => setActiveTab('logistics')}
                    status="Offline"
                    statusColor="text-gray-500 bg-gray-900"
                />

                <ModuleCard 
                    title="UI Builder" 
                    description="Interface construction engine." 
                    icon={Terminal} 
                    onClick={() => setActiveTab('uibuilder')}
                    status="Dev Mode"
                    statusColor="text-purple-400 bg-purple-900/20"
                />

            </div>
        </div>
    );
}