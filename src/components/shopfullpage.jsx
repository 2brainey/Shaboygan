import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Zap, Shield, Package, 
  ChevronRight, Star, AlertCircle, Coins, Info, 
  Grid, List, CheckCircle, Gift, Sun, Trophy, Map, Home, Car, Ship, Aperture, Cpu, Database, Brain
} from 'lucide-react';
import { SHOP_ITEMS } from '../data/gamedata';
import { RenderIcon } from './dashboardutils';

// --- SUB-COMPONENT: SHOP ITEM CARD ---
const ShopItemCard = ({ item, onPurchase, canAfford, isWidget = false, ownedCount = 0, canClaimHourly, onClaimHourly, timeRemaining }) => {
    const [purchaseMode, setPurchaseMode] = useState(false);
    
    const getRarityColor = (r) => {
        switch(r) {
            case 'Mythic': return 'border-rose-500 text-rose-400 bg-rose-950/30';
            case 'Legendary': return 'border-amber-500 text-amber-500 bg-amber-950/30';
            case 'Epic': return 'border-purple-500 text-purple-400 bg-purple-950/30';
            case 'Rare': return 'border-blue-500 text-blue-400 bg-blue-950/30';
            case 'Uncommon': return 'border-emerald-500 text-emerald-400 bg-emerald-950/30';
            default: return 'border-slate-600 text-slate-400 bg-slate-800/50';
        }
    };

    const rarityStyle = getRarityColor(item.rarity);
    const cardPadding = isWidget ? 'p-3' : 'p-5';
    const iconSize = isWidget ? 18 : 24;

    const handleItemClick = (e) => {
        e.stopPropagation(); 
        if (item.isHourlyClaim) {
             if (canClaimHourly) onClaimHourly();
             return;
        }
        
        if (!canAfford) return;
        
        if (purchaseMode) {
            onPurchase(item);
            setPurchaseMode(false);
        } else {
            setPurchaseMode(true);
        }
    };

    const buttonLabel = item.isHourlyClaim 
        ? (canClaimHourly ? 'Claim' : timeRemaining) 
        : (canAfford ? 'Purchase' : 'Too Expensive');
    
    const buttonDisabled = item.isHourlyClaim ? !canClaimHourly : !canAfford;

    return (
        <div 
            className={`relative group bg-[#1e1e1e] border rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${buttonDisabled && !item.isHourlyClaim ? 'opacity-60 grayscale-[0.3]' : 'hover:-translate-y-1 hover:shadow-2xl'} ${item.rarity === 'Legendary' ? 'border-amber-500/50' : 'border-slate-700'}`}
            style={{ zIndex: purchaseMode ? 50 : 10 }} 
        >
            <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg backdrop-blur-md border-b border-l border-opacity-20" style={{ borderColor: 'inherit', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <span className={item.rarity === 'Legendary' ? 'text-amber-400' : item.rarity === 'Epic' ? 'text-purple-400' : 'text-slate-400'}>
                    {item.rarity}
                </span>
            </div>

            {ownedCount > 0 && (
                <div className="absolute top-0 left-0 px-2 py-1 bg-emerald-900/80 border-b border-r border-emerald-500/30 rounded-br-lg z-10 flex items-center gap-1">
                    <CheckCircle size={10} className="text-emerald-400"/>
                    <span className="text-[9px] font-bold text-emerald-300 uppercase">Owned: {ownedCount}</span>
                </div>
            )}

            <div className={`${cardPadding} flex flex-col h-full`}>
                <div className="mb-2 mt-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${rarityStyle}`}>
                        <RenderIcon name={item.iconName} size={iconSize} />
                    </div>
                </div>

                <div className="mb-auto">
                    <h3 className={`font-bold text-white mb-1 leading-tight ${isWidget ? 'text-sm' : 'text-lg'} group-hover:text-amber-500 transition-colors`}>{item.name}</h3>
                    <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{item.effect}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{item.isHourlyClaim ? 'Status' : 'Cost'}</span>
                        <div className={`flex items-center gap-1 font-mono font-bold text-xs ${(!buttonDisabled) ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.isHourlyClaim ? (canClaimHourly ? 'READY' : 'COOLDOWN') : item.cost.toLocaleString()} <span className="text-[8px]">{item.isHourlyClaim ? '' : 'BM'}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleItemClick}
                        disabled={buttonDisabled}
                        className={`w-full py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1
                            ${(!buttonDisabled)
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }
                        `}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>

            {purchaseMode && (
                <div 
                    className="absolute inset-0 bg-black/90 rounded-xl flex flex-col items-center justify-center gap-1 z-20 border border-white/10 animate-in fade-in zoom-in duration-200"
                    onClick={(e) => { e.stopPropagation(); setPurchaseMode(false); }}
                >
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider animate-pulse text-center">Confirm Purchase?</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400">{item.cost >= 1000 ? (item.cost/1000) + 'k' : item.cost} BM</span>
                    <button onClick={() => setPurchaseMode(false)} className="text-[8px] text-slate-400 hover:text-white mt-1">(Click to Cancel)</button>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function ShopFullPage({ onPurchase, discipline, inventory = [], lastDailyClaim, lastHourlyClaim, onClaimDaily, onClaimHourly }) {
  const [activeCategory, setActiveCategory] = useState('boosters');
  const [viewMode, setViewMode] = useState('card');
  const isFullPage = true; 
  
  // FIX: Added parentheses and initial value
  const [timeNow, setTimeNow] = useState(Date.now());

  useEffect(() => {
    // Updates every minute
    const t = setInterval(() => setTimeNow(Date.now()), 60000); 
    return () => clearInterval(t);
  }, []);

  const DAILY_COOLDOWN_MS = 86400000;
  const HOURLY_COOLDOWN_MS = 3600000;

  const canClaimDaily = timeNow - lastDailyClaim >= DAILY_COOLDOWN_MS;
  const canClaimHourly = timeNow - lastHourlyClaim >= HOURLY_COOLDOWN_MS;
  
  const getHourlyRemaining = () => {
      const ms = HOURLY_COOLDOWN_MS - (timeNow - lastHourlyClaim);
      if(ms <= 0) return "Ready";
      const minutes = Math.ceil(ms / 60000);
      return `${minutes}m`;
  };
  
  const categories = [
    { id: 'boosters', label: 'Boosters', icon: 'Zap', desc: 'Instant XP Gains' },
    { id: 'gear', label: 'Gear & Deeds', icon: 'Shield', desc: 'Permanent Bonuses & Titles' },
    { id: 'packs', label: 'Card Packs', icon: 'Layers', desc: 'Capital Card Loot' },
    { id: 'crates', label: 'Crates & Daily', icon: 'Package', desc: 'Loot Box Items' },
  ];
  
  const currentItems = useMemo(() => SHOP_ITEMS[activeCategory] || [], [activeCategory]);
  
  const handlePurchaseWrapper = (item) => {
    onPurchase(item, activeCategory); 
  };

  const getOwnedCount = (itemId) => {
      if (!inventory) return 0;
      const matches = inventory.filter(slot => slot && (slot.id === itemId || slot.name === itemId));
      return matches.reduce((acc, curr) => acc + (curr.count || 1), 0);
  };
  
  return (
    <div className="h-full flex flex-col bg-[#0f1219] overflow-hidden relative">
        <div className="shrink-0 px-6 py-4 bg-[#1a1a1a] border-b border-slate-800 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-amber-500" size={20} />
                <span className="hidden sm:inline">Black Market</span>
             </h2>
             <div className="bg-black/40 border border-emerald-500/30 rounded-lg px-4 py-2 flex items-center gap-3">
                <div className="p-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-xl shadow-pink-900/70">
                    <Brain size={18} className="text-white" />
                </div>
                <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Brain Matter</div>
                    <div className="text-xl font-mono font-bold text-white leading-none">{discipline.toLocaleString()}</div>
                </div>
             </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-16 md:w-56 bg-[#131313] border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all group relative ${activeCategory === cat.id ? 'bg-[#2a2a2a] text-white border border-amber-500/30 shadow-lg' : 'text-slate-400 hover:bg-[#1e1e1e] hover:text-white border border-transparent'}`}
                        >
                            <div className={`p-2 rounded-lg shrink-0 ${activeCategory === cat.id ? 'bg-amber-500 text-black' : 'bg-black/30 text-slate-500 group-hover:text-white'}`}>
                                <RenderIcon name={cat.icon} size={18} />
                            </div>
                            <div className="hidden md:block text-left overflow-hidden">
                                <div className="font-bold text-sm truncate">{cat.label}</div>
                                <div className="text-[10px] opacity-60 truncate">{cat.desc}</div>
                            </div>
                            {activeCategory === cat.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-[#0f1219] to-[#131313]">
                
                {/* Daily Reward Banner */}
                {activeCategory === 'crates' && (
                    <div className="mb-8">
                        <div className="rounded-xl bg-gradient-to-r from-blue-900/20 to-slate-900 border border-blue-500/30 p-4 flex items-center justify-between gap-4 shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-2 ${!canClaimDaily ? 'bg-slate-700 border-slate-500' : 'bg-blue-500 border-blue-300'}`}>
                                    <RenderIcon name={!canClaimDaily ? "CheckCircle" : "Gift"} size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Daily Supply Drop</h3>
                                    <p className="text-xs text-blue-200">{!canClaimDaily ? "You have claimed today's reward." : "A free crate of supplies is available."}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClaimDaily} 
                                disabled={!canClaimDaily}
                                className={`relative z-10 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${!canClaimDaily ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg'}`}
                            >
                                {!canClaimDaily ? 'Claimed' : 'Claim Free'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid/List Controls */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold text-white capitalize">{categories.find(c => c.id === activeCategory)?.label}</h2>
                    <div className="flex items-center gap-3">
                         <span className="text-xs text-slate-500 font-mono">{currentItems.length || 0} Items</span>
                         <div className="flex border border-slate-700 rounded-md p-1 bg-[#131313]">
                            <button onClick={() => setViewMode('card')} className={`p-1 rounded-sm transition-colors ${viewMode === 'card' ? 'bg-amber-500 text-black' : 'text-slate-500 hover:bg-slate-700'}`}><RenderIcon name="Grid" size={16} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-amber-500 text-black' : 'text-slate-500 hover:bg-slate-700'}`}><RenderIcon name="List" size={16} /></button>
                         </div>
                    </div>
                </div>

                {/* Items Grid */}
                {viewMode === 'card' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {currentItems.map(item => (
                            <ShopItemCard 
                                key={item.id} 
                                item={item} 
                                onPurchase={handlePurchaseWrapper} 
                                canAfford={discipline >= item.cost}
                                isWidget={!isFullPage}
                                ownedCount={getOwnedCount(item.id)}
                                isHourlyClaim={item.isHourlyClaim}
                                canClaimHourly={canClaimHourly}
                                onClaimHourly={onClaimHourly}
                                timeRemaining={getHourlyRemaining()}
                            />
                        ))}
                    </div>
                )}

                {/* NOTE: You haven't implemented 'list' view yet. 
                    If you click the list button, it will be blank. 
                    I added this fallback below for you. */}
                {viewMode === 'list' && (
                    <div className="flex flex-col gap-2">
                        {/* Placeholder for list view implementation */}
                         {currentItems.map(item => (
                            <div key={item.id} className="bg-[#1e1e1e] p-4 rounded border border-slate-800 text-white flex justify-between items-center">
                                <span className="font-bold">{item.name}</span>
                                <span className="text-emerald-400 font-mono">{item.cost} BM</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {(currentItems.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                        <RenderIcon name="AlertCircle" size={48} className="mb-4 opacity-50" />
                        <p>No stock available in this section.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}