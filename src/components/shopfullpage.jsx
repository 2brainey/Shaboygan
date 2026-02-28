import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { 
    ShoppingBag, Gift, Clock, PackageOpen, Plus, 
    Settings, Edit3, Trash2, ArrowRight, Wallet,
    Sparkles, ShieldCheck, Zap, X, Save
} from 'lucide-react';

// --- MOCK CONSTANTS FOR SANDBOX ---
const LOCAL_STORAGE_KEY = 'shaboygan_market_v1';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const DEFAULT_CATALOG = [
    { id: 'pack_novice', name: 'Novice Bender Pack', iconName: 'Package', category: 'Packs', cost: 500, color: 'text-slate-300', bgColor: 'bg-slate-800', desc: 'Contains 3 Random Common/Uncommon Cards.' },
    { id: 'pack_pro', name: 'Pro-League Pack', iconName: 'PackageOpen', category: 'Packs', cost: 1500, color: 'text-blue-400', bgColor: 'bg-blue-900/40', desc: 'Contains 5 Cards. Guarantees 1 Rare.' },
    { id: 'pack_avatar', name: 'Avatar State Bundle', iconName: 'Sparkles', category: 'Packs', cost: 5000, color: 'text-amber-400', bgColor: 'bg-amber-900/40', desc: 'Contains 10 Cards. Guarantees 1 Epic/Legendary.' },
    { id: 'cons_energy', name: 'Chi Restorative', iconName: 'Zap', category: 'Consumables', cost: 200, color: 'text-emerald-400', bgColor: 'bg-emerald-900/40', desc: 'Instantly restores 50 Energy.' },
    { id: 'cons_shield', name: 'Aura Ward', iconName: 'ShieldCheck', category: 'Consumables', cost: 800, color: 'text-indigo-400', bgColor: 'bg-indigo-900/40', desc: 'Prevents rating loss for 3 matches.' }
];

// --- HELPER: Render Dynamic Icon ---
const RenderIcon = ({ name, className, size = 20 }) => {
    const IconComponent = Icons[name] || Icons.Box;
    return <IconComponent size={size} className={className} />;
};

// --- COMPONENT: Loot Reveal Modal ---
const LootRevealModal = ({ type, onClose, onCollect }) => {
    // Generate mock loot based on type
    const loot = type === 'daily' 
        ? [{ name: 'Daily Rations', qty: 5, icon: 'Utensils', color: 'text-orange-400' }, { name: 'Discipline', qty: 1500, icon: 'Wallet', color: 'text-amber-400' }, { name: 'Basic Pack', qty: 1, icon: 'Package', color: 'text-slate-300' }]
        : [{ name: 'Discipline', qty: 250, icon: 'Wallet', color: 'text-amber-400' }, { name: 'Scrap Metal', qty: 10, icon: 'Wrench', color: 'text-slate-400' }];

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div className="bg-[#12161f] border border-emerald-500/50 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
                
                <div className="mx-auto bg-emerald-900/40 w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500 relative z-10 animate-pulse">
                    <Gift size={40} className="text-emerald-400" />
                </div>
                
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2 relative z-10">Supply Drop Secured</h2>
                <p className="text-slate-400 text-sm mb-8 relative z-10">Crate deciphered. The following assets have been extracted:</p>

                <div className="space-y-3 mb-8 relative z-10">
                    {loot.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#1a1d24] p-3 rounded-xl border border-slate-700 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded bg-slate-800 ${item.color}`}><RenderIcon name={item.icon} size={16}/></div>
                                <span className="font-bold text-white text-sm">{item.name}</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-400 text-lg">+{item.qty.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => { onCollect(); onClose(); }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex justify-center items-center gap-2 relative z-10"
                >
                    Transfer to Inventory <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

// --- COMPONENT: Developer Market Editor ---
const MarketEditorModal = ({ onClose, onSave, itemToEdit }) => {
    const [formData, setFormData] = useState(itemToEdit || {
        id: `item_${Date.now()}`, name: 'New Market Item', iconName: 'Package', category: 'Packs', cost: 1000, desc: 'A new item for the market.', color: 'text-white', bgColor: 'bg-slate-800'
    });

    const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
            <div className="bg-[#12161f] p-6 rounded-2xl border border-indigo-500/50 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} className="text-indigo-400"/> Developer Market Editor</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Item Name</label>
                        <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Category</label>
                            <select value={formData.category} onChange={e => handleChange('category', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm">
                                <option value="Packs">Packs</option><option value="Consumables">Consumables</option><option value="Bundles">Bundles</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Cost (DSC)</label>
                            <input type="number" value={formData.cost} onChange={e => handleChange('cost', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Lucide Icon Name</label>
                        <div className="flex gap-2">
                            <div className={`p-2 rounded flex items-center justify-center border border-slate-700 w-10 ${formData.bgColor}`}><RenderIcon name={formData.iconName} size={16} className={formData.color}/></div>
                            <input type="text" value={formData.iconName} onChange={e => handleChange('iconName', e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" placeholder="e.g. Package, Shield" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Description</label>
                        <textarea value={formData.desc} onChange={e => handleChange('desc', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm h-20 resize-none"></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"><Save size={16}/> Save to Market</button>
                </div>
            </div>
        </div>
    );
};

export default function ShopFullPage({ discipline, inventory, lastDailyClaim, lastHourlyClaim, onClaimDaily, onClaimHourly, onPurchase }) {
    // Sandbox Fallbacks
    const [wallet, setWallet] = useState(discipline || 15000);
    const [dailyTimer, setDailyTimer] = useState(lastDailyClaim || 0);
    const [hourlyTimer, setHourlyTimer] = useState(lastHourlyClaim || 0);
    const [catalog, setCatalog] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_CATALOG;
    });

    const [isDevMode, setIsDevMode] = useState(false);
    const [editorItem, setEditorItem] = useState(null);
    const [revealModalType, setRevealModalType] = useState(null); // 'daily' or 'hourly'

    // Save catalog changes
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(catalog)); }, [catalog]);

    // Time calculations
    const now = Date.now();
    const canClaimDaily = now - dailyTimer > DAY_MS;
    const canClaimHourly = now - hourlyTimer > HOUR_MS;

    const timeUntilDaily = canClaimDaily ? 'READY' : new Date(DAY_MS - (now - dailyTimer)).toISOString().substr(11, 8);
    const timeUntilHourly = canClaimHourly ? 'READY' : new Date(HOUR_MS - (now - hourlyTimer)).toISOString().substr(14, 5);

    // Handlers
    const handlePurchaseAttempt = (item) => {
        if (wallet >= item.cost) {
            setWallet(w => w - item.cost);
            if(onPurchase) onPurchase(item, item.category);
            // Show brief floating text or native toast ideally
        } else {
            alert("Insufficient DSC.");
        }
    };

    const executeClaim = () => {
        if (revealModalType === 'daily') {
            setDailyTimer(Date.now());
            if(onClaimDaily) onClaimDaily();
            setWallet(w => w + 1500); // Mock reward
        } else if (revealModalType === 'hourly') {
            setHourlyTimer(Date.now());
            if(onClaimHourly) onClaimHourly();
            setWallet(w => w + 250); // Mock reward
        }
        setRevealModalType(null);
    };

    const handleSaveCatalogItem = (newItem) => {
        setCatalog(prev => {
            const exists = prev.findIndex(i => i.id === newItem.id);
            if (exists >= 0) { const next = [...prev]; next[exists] = newItem; return next; }
            return [newItem, ...prev];
        });
        setEditorItem(null);
    };

    const uniqueCategories = [...new Set(catalog.map(c => c.category))];

    return (
        <div className="h-full w-full flex flex-col bg-[#0b0e14] text-slate-200 overflow-y-auto custom-scrollbar relative">
            
            {/* Loot Reveal Overlay */}
            {revealModalType && <LootRevealModal type={revealModalType} onClose={() => setRevealModalType(null)} onCollect={executeClaim} />}
            {/* Dev Editor Overlay */}
            {editorItem !== null && <MarketEditorModal itemToEdit={editorItem} onClose={() => setEditorItem(null)} onSave={handleSaveCatalogItem} />}

            {/* TOP HEADER */}
            <div className="bg-[#12161f] border-b border-slate-800 p-6 sticky top-0 z-40 shrink-0">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-black text-white tracking-widest uppercase">
                            <ShoppingBag className="text-indigo-500" size={28} /> Network Marketplace
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-slate-500 font-mono">Acquire Assets & Supplies</span>
                            <button onClick={() => setIsDevMode(!isDevMode)} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDevMode ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>Dev Mode: {isDevMode ? 'ON' : 'OFF'}</button>
                        </div>
                    </div>

                    <div className="bg-[#1a1d24] px-6 py-3 rounded-xl border border-slate-700 flex flex-col items-end shadow-inner">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Available Funds</span>
                        <div className="flex items-center gap-2">
                            <Wallet size={16} className="text-amber-500"/>
                            <span className="font-mono text-xl font-bold text-amber-400">{wallet.toLocaleString()} <span className="text-sm text-slate-500">DSC</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto w-full space-y-8 pb-32">

                {/* --- SUPPLY DEPOT (Visual Enhancements) --- */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-emerald-500" size={20}/>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Supply Depot</h2>
                        {(canClaimDaily || canClaimHourly) && (
                            <span className="ml-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Drops Available</span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Daily Drop */}
                        <div className={`relative p-1 rounded-2xl overflow-hidden transition-all ${canClaimDaily ? 'bg-gradient-to-br from-emerald-500 via-emerald-700 to-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-slate-800 border border-slate-700'}`}>
                            {canClaimDaily && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>}
                            <div className="bg-[#12161f] rounded-xl p-6 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className={`font-black text-xl uppercase ${canClaimDaily ? 'text-emerald-400' : 'text-slate-400'}`}>Daily Payload</h3>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">High-value network drop. Refreshes every 24h.</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${canClaimDaily ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                                        <Gift size={28}/>
                                    </div>
                                </div>
                                <button 
                                    disabled={!canClaimDaily}
                                    onClick={() => setRevealModalType('daily')}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${canClaimDaily ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 hover:scale-[1.02]' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                                >
                                    {canClaimDaily ? 'Call in Drop' : `Refueling in ${timeUntilDaily}`}
                                </button>
                            </div>
                        </div>

                        {/* Hourly Drop */}
                        <div className={`relative p-1 rounded-2xl overflow-hidden transition-all ${canClaimHourly ? 'bg-gradient-to-br from-blue-500 via-blue-700 to-slate-900 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-slate-800 border border-slate-700'}`}>
                            <div className="bg-[#12161f] rounded-xl p-6 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className={`font-black text-xl uppercase ${canClaimHourly ? 'text-blue-400' : 'text-slate-400'}`}>Routine Sweep</h3>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">Minor resource extraction. Refreshes every 60m.</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${canClaimHourly ? 'bg-blue-900/40 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                                        <PackageOpen size={28}/>
                                    </div>
                                </div>
                                <button 
                                    disabled={!canClaimHourly}
                                    onClick={() => setRevealModalType('hourly')}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${canClaimHourly ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 hover:scale-[1.02]' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                                >
                                    {canClaimHourly ? 'Initiate Sweep' : `Scanning in ${timeUntilHourly}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- MARKETPLACE CATALOG --- */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="text-indigo-500" size={20}/>
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Asset Catalog</h2>
                        </div>
                        {isDevMode && (
                            <button onClick={() => setEditorItem({ id: `item_${Date.now()}`, name: 'New Item', iconName: 'Box', category: 'Packs', cost: 100, desc: '', color: 'text-white', bgColor: 'bg-slate-800' })} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/50 rounded-lg text-xs font-bold transition-all">
                                <Plus size={14}/> Add Custom Item
                            </button>
                        )}
                    </div>

                    {uniqueCategories.map(category => (
                        <div key={category} className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {catalog.filter(i => i.category === category).map(item => (
                                    <div key={item.id} className="bg-[#12161f] border border-slate-800 rounded-2xl p-5 flex flex-col relative group hover:border-slate-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                        
                                        {/* Dev Controls Overlay */}
                                        {isDevMode && (
                                            <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 z-20">
                                                <button onClick={() => setEditorItem(item)} className="p-1.5 bg-indigo-600 rounded text-white"><Edit3 size={14}/></button>
                                                <button onClick={() => setCatalog(c => c.filter(x => x.id !== item.id))} className="p-1.5 bg-red-600 rounded text-white"><Trash2 size={14}/></button>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`p-4 rounded-xl border border-white/5 shadow-inner ${item.bgColor}`}>
                                                <RenderIcon name={item.iconName} size={32} className={item.color}/>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-base leading-tight">{item.name}</h4>
                                                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.desc}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 bg-[#1a1d24] px-3 py-1.5 rounded-lg border border-slate-700">
                                                <Wallet size={12} className="text-amber-500"/>
                                                <span className="text-sm font-mono font-bold text-amber-400">{item.cost.toLocaleString()}</span>
                                            </div>
                                            <button 
                                                onClick={() => handlePurchaseAttempt(item)}
                                                className="bg-slate-800 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                                            >
                                                Acquire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

            </div>
        </div>
    );
}