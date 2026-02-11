import React, { useMemo, useState } from 'react';
import { Package, Landmark, BookOpen, ArrowRight, ArrowDownToLine, ArrowUpFromLine, Plus, Minus } from 'lucide-react';
import { useGameStore } from '../store/gamestore';
import { RenderIcon } from './dashboardutils';
import { CARD_DATABASE } from '../data/gamedata';

// --- SHARED: MINI HEADER ---
const WidgetHeader = ({ icon, title, value, color }) => (
    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <RenderIcon name={icon} size={16} className={color} />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</span>
        </div>
        {value && <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>}
    </div>
);

// --- 1. UPDATED BACKPACK WIDGET WITH GRAPHICS SUPPORT ---
export const BackpackWidget = ({ setActiveTab }) => {
    const { data } = useGameStore();
    const inventory = data.inventory || Array(20).fill(null);
    const capacity = inventory.length;
    const occupied = inventory.filter(i => i).length;
    
    // Preview the first 8 slots
    const previewSlots = inventory.slice(0, 8);

    return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 hover:border-orange-500/30 transition-all group shadow-2xl">
            <WidgetHeader 
                icon="Package" 
                title="Backpack" 
                value={`${occupied}/${capacity}`} 
                color="text-orange-500" 
            />
            
            <div className="grid grid-cols-4 gap-2 mb-4">
                {previewSlots.map((item, i) => (
                    <div 
                        key={i} 
                        className={`aspect-square rounded-lg border overflow-hidden flex items-center justify-center relative transition-transform hover:scale-105 ${
                            item ? 'bg-[#0a0a0a] border-slate-700 shadow-inner' : 'bg-transparent border-slate-800/50 border-dashed'
                        }`}
                    >
                        {item ? (
                            <>
                                {/* RENDER GRAPHIC IF EXISTS, ELSE FALLBACK TO ICON */}
                                {item.graphic ? (
                                    <img 
                                        src={item.graphic} 
                                        className="w-full h-full object-cover brightness-95 group-hover:brightness-110" 
                                        alt={item.name} 
                                    />
                                ) : (
                                    <RenderIcon name={item.iconName || 'Box'} size={18} className="text-slate-400"/>
                                )}

                                {/* Subtle Overlay for Count Visibility */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

                                {/* Stack Count Badge */}
                                {item.count > 1 && (
                                    <span className="absolute bottom-0 right-0 text-[9px] font-mono font-bold bg-black/80 text-white px-1.5 leading-tight rounded-tl-md border-t border-l border-white/10 z-10">
                                        {item.count}
                                    </span>
                                )}
                            </>
                        ) : (
                            <div className="opacity-20"><RenderIcon name="Plus" size={10} /></div>
                        )}
                    </div>
                ))}
            </div>
            
            <button 
                onClick={() => setActiveTab('inventory')} 
                className="w-full py-2 text-[10px] uppercase font-bold bg-slate-800/50 hover:bg-orange-900/40 hover:text-orange-300 rounded-lg text-slate-500 border border-slate-700/50 transition-all flex items-center justify-center gap-2 group/btn"
            >
                Management Interface <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

// --- 2. VAULT WIDGET ---
export const VaultWidget = () => {
    const { data, updateData } = useGameStore();
    const balance = data.bankBalance || 0;
    const cash = data.discipline || 0; 
    const [amount, setAmount] = useState(1000);

    const handleTransaction = (type) => {
        if (type === 'deposit') {
            const toDeposit = Math.min(amount, cash);
            if (toDeposit <= 0) return;
            updateData({ 
                discipline: cash - toDeposit, 
                bankBalance: balance + toDeposit 
            });
        } else {
            const toWithdraw = Math.min(amount, balance);
            if (toWithdraw <= 0) return;
            updateData({ 
                discipline: cash + toWithdraw, 
                bankBalance: balance - toWithdraw 
            });
        }
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-4 hover:border-emerald-500/30 transition-colors shadow-xl">
            <WidgetHeader icon="Landmark" title="Vault Assets" value={balance.toLocaleString()} color="text-emerald-500" />
            
            <div className="flex items-center justify-between mb-3 bg-black/20 p-2 rounded border border-slate-800">
                <button onClick={() => setAmount(Math.max(100, amount - 500))} className="p-1 hover:text-white text-slate-500"><Minus size={12}/></button>
                <span className="text-xs font-mono text-emerald-400 font-bold">{amount.toLocaleString()}</span>
                <button onClick={() => setAmount(amount + 500)} className="p-1 hover:text-white text-slate-500"><Plus size={12}/></button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => handleTransaction('deposit')}
                    disabled={cash < amount}
                    className={`flex items-center justify-center gap-1 py-2 rounded text-[10px] font-bold uppercase transition-all ${cash >= amount ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                >
                    <ArrowDownToLine size={12} /> Dep
                </button>
                <button 
                    onClick={() => handleTransaction('withdraw')}
                    disabled={balance < amount}
                    className={`flex items-center justify-center gap-1 py-2 rounded text-[10px] font-bold uppercase transition-all ${balance >= amount ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                >
                    <ArrowUpFromLine size={12} /> Wth
                </button>
            </div>
        </div>
    );
};

// --- 3. BINDER WIDGET ---
export const BinderWidget = ({ setActiveTab }) => {
    const { data } = useGameStore();
    const cards = data.cards || [];
    
    // Stats
    const totalCollected = cards.length;
    const uniqueCards = new Set(cards).size;
    const mostRecentId = cards[cards.length - 1];
    
    // Resolve Card Name safely
    const recentCardName = useMemo(() => {
        if (!mostRecentId) return "None";
        const bender = CARD_DATABASE?.BENDERS?.find(b => b.id === mostRecentId);
        const move = CARD_DATABASE?.MOVES?.find(m => m.id === mostRecentId);
        return bender ? bender.name : (move ? move.name : "Unknown");
    }, [mostRecentId]);

    return (
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-4 hover:border-blue-500/30 transition-colors relative overflow-hidden group shadow-xl">
            <div className="relative z-10">
                <WidgetHeader icon="BookOpen" title="Collection" value={`${uniqueCards} Unique`} color="text-blue-500" />
                
                <div className="flex justify-between items-end mb-1">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase">Recent Find</div>
                        <div className="text-sm font-bold text-white truncate max-w-[120px]">{recentCardName}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Total Cards</div>
                        <div className="text-sm font-mono text-blue-300">{totalCollected}</div>
                    </div>
                </div>
            </div>

            {/* Decorative Background Icon */}
            <div className="absolute -bottom-4 -right-4 text-blue-900/20 group-hover:text-blue-800/30 transition-colors transform rotate-12">
                <RenderIcon name="BookOpen" size={80} />
            </div>
        </div>
    );
};