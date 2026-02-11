import React from 'react';
import { 
  X, Check, Lock, ChevronRight, Star, 
  Trophy, AlertTriangle, Package, DollarSign,
  Zap, Droplet, Brain, Wrench
} from 'lucide-react';
import { RenderIcon, getRarityColor } from './dashboardutils';
import { CARD_DATABASE, SKILL_DETAILS } from '../data/gamedata';

// --- NEW COMPONENTS: RESOURCES & VITALS ---

export const ResourceCard = ({ cash, discipline, salvage }) => (
    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-slate-700 shadow-lg mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Liquid Assets</span>
            <span className="text-emerald-400 font-mono font-bold text-lg flex items-center gap-1">
                <span className="text-xs text-emerald-600">$</span> {cash.toLocaleString()}
            </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 p-2 rounded border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-pink-900/10 group-hover:bg-pink-900/20 transition-colors"></div>
                <Brain size={16} className="text-pink-400 mb-1 z-10"/>
                <span className="text-white font-mono font-bold text-sm z-10">{discipline.toLocaleString()}</span>
                <span className="text-[8px] text-pink-400 uppercase font-bold z-10">Brain Matter</span>
            </div>
            <div className="bg-black/30 p-2 rounded border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-slate-700/10 group-hover:bg-slate-700/20 transition-colors"></div>
                <Wrench size={16} className="text-slate-400 mb-1 z-10"/>
                <span className="text-white font-mono font-bold text-sm z-10">{salvage}</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold z-10">Salvage</span>
            </div>
        </div>
    </div>
);

export const VitalsHUD = ({ wellness, onMaintain }) => {
    const getColor = (val, type) => {
        if (val < 30) return 'bg-red-500';
        if (type === 'energy') return 'bg-yellow-400';
        if (type === 'hydration') return 'bg-blue-400';
        return 'bg-purple-400';
    };

    return (
        <div className="bg-[#1e1e1e] p-3 rounded-xl border border-slate-700 shadow-lg mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Biological Status</span>
                <span className="text-[9px] text-slate-600 font-mono">V.33.1</span>
            </div>
            <div className="space-y-3">
                {[
                    { label: 'Energy', key: 'energy', icon: 'Zap', color: 'text-yellow-400' },
                    { label: 'Hydration', key: 'hydration', icon: 'Droplet', color: 'text-blue-400' },
                    { label: 'Focus', key: 'focus', icon: 'Brain', color: 'text-purple-400' }
                ].map(vital => (
                    <div key={vital.key} className="group cursor-pointer" onClick={() => onMaintain && onMaintain(vital.key)}>
                        <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-300">
                            <span className="flex items-center gap-1"><RenderIcon name={vital.icon} size={10} className={vital.color}/> {vital.label}</span>
                            <span className="group-hover:text-emerald-400 transition-colors">{Math.floor(wellness[vital.key])}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-slate-800 relative">
                             <div 
                                className={`h-full ${getColor(wellness[vital.key], vital.key)} transition-all duration-500`} 
                                style={{ width: `${wellness[vital.key]}%` }}
                             ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- GENERIC INPUT COMPONENTS ---

export const InputGroup = ({ title, children }) => (
    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-slate-700">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

export const InputField = ({ label, value, onChange, type = "text" }) => (
    <div>
        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-full bg-black/30 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 outline-none transition-colors font-mono"
        />
    </div>
);

// --- INVENTORY GRID COMPONENT ---

export const InventoryGrid = ({ slots, containerId, onUseItem, onDragStart, onDrop, onContextMenu }) => {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 relative z-0">
            {slots.map((item, index) => {
                const isEmpty = !item;
                const rarityColor = !isEmpty ? getRarityColor(item.rarity) : '';
                
                return (
                    <div 
                        key={index}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop && onDrop(containerId, index)}
                        onContextMenu={(e) => { e.preventDefault(); if(onContextMenu) onContextMenu(containerId, index); }}
                        className={`
                            aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative group select-none transition-all
                            ${isEmpty ? 'border-slate-800 bg-[#151515] border-dashed' : `bg-[#1a1a1a] ${rarityColor} cursor-pointer hover:brightness-110 hover:scale-105`}
                        `}
                        draggable={!isEmpty}
                        onDragStart={() => onDragStart && onDragStart(containerId, index)}
                        onClick={() => !isEmpty && onUseItem && onUseItem(item, index, containerId)}
                    >
                        {isEmpty ? (
                            <span className="text-[9px] text-slate-700 font-mono">{index + 1}</span>
                        ) : (
                            <>
                                <RenderIcon name={item.iconName || 'Package'} size={20} className="mb-1" />
                                <span className="text-[8px] font-bold uppercase truncate w-full text-center px-1 leading-none">{item.name}</span>
                                {item.count > 1 && (
                                    <div className="absolute top-0.5 right-0.5 bg-black/80 text-white text-[8px] px-1 rounded-sm font-mono border border-slate-700">
                                        x{item.count}
                                    </div>
                                )}
                                {/* Tooltip - FIXED Z-INDEX to ensure it floats above headers */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black/95 text-white text-[10px] p-2 rounded border border-slate-600 hidden group-hover:block z-[100] pointer-events-none shadow-2xl">
                                    <div className="font-bold text-amber-400">{item.name}</div>
                                    <div className="text-[9px] text-slate-400">{item.type} • {item.rarity}</div>
                                    <div className="text-[9px] italic mt-1 text-slate-300 leading-tight">{item.desc || item.effect}</div>
                                    <div className="mt-1 text-[8px] text-slate-500 uppercase">Right-click to move • Click to use</div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// --- COLLECTION BINDER COMPONENT ---

export const CollectionBinder = ({ cards, onSell, onSellAll }) => {
    // Process Card Database against owned cards
    const collectionData = CARD_DATABASE.map(card => {
        const ownedCount = cards.filter(c => c === card.id).length;
        return { ...card, ownedCount, isOwned: ownedCount > 0 };
    });

    const totalValue = collectionData.reduce((acc, c) => acc + (c.ownedCount > 1 ? (c.ownedCount - 1) * c.value : 0), 0);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 px-2 bg-[#1a1a1a] p-2 rounded border border-slate-800 sticky top-0 z-10">
                <div>
                    <h3 className="text-sm font-bold text-white">Card Collection</h3>
                    <p className="text-[10px] text-slate-400">{cards.length} Cards Collected</p>
                </div>
                {totalValue > 0 && (
                    <button 
                        onClick={() => onSellAll && onSellAll({ value: totalValue })}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black text-[10px] font-bold rounded flex items-center gap-2"
                    >
                        <DollarSign size={10}/> Sell Duplicates (+{totalValue})
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {collectionData.map((card) => (
                        <div 
                            key={card.id} 
                            className={`relative aspect-[3/4] rounded-lg border-2 flex flex-col p-2 transition-all ${card.isOwned ? `bg-[#1a1a1a] ${getRarityColor(card.rarity)}` : 'bg-[#111] border-slate-800 opacity-50 grayscale'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[8px] font-bold uppercase opacity-70">{card.rarity}</span>
                                {card.isOwned && <span className="text-[9px] font-mono bg-black/50 px-1 rounded text-white">x{card.ownedCount}</span>}
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="p-2 rounded-full bg-black/20 mb-2">
                                    <RenderIcon name={card.iconName} size={24} />
                                </div>
                                <div className="text-[10px] font-bold leading-tight">{card.name}</div>
                            </div>

                            {card.ownedCount > 1 && (
                                <button 
                                    onClick={() => onSell(card.id, card.value)}
                                    className="mt-2 w-full py-1 bg-slate-800 hover:bg-slate-700 text-[8px] text-emerald-400 rounded border border-slate-600 uppercase font-bold"
                                >
                                    Sell 1 ({card.value})
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- CONTRACT WIDGET ---

export const ContractWidget = ({ contracts, onToggle }) => {
    return (
        <div className="bg-[#1e1e1e] h-full flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#151515]">
                <h3 className="font-bold text-white flex items-center gap-2"><Trophy size={16} className="text-amber-500"/> Active Contracts</h3>
                <span className="text-xs text-slate-500 font-mono">{contracts.filter(c => c.completed).length}/{contracts.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {contracts.sort((a,b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1).map(contract => (
                    <div key={contract.id} className={`p-3 border-b border-slate-800 flex gap-3 group hover:bg-white/5 transition-colors ${contract.completed ? 'opacity-50 grayscale' : ''}`}>
                        <button 
                            onClick={() => onToggle(contract.id)}
                            className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${contract.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 hover:border-slate-400'}`}
                        >
                            {contract.completed && <Check size={12} strokeWidth={4} />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold truncate ${contract.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{contract.title}</span>
                                <span className="text-[10px] font-mono text-amber-500 shrink-0">+{contract.xp} XP</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{contract.desc}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[8px] uppercase tracking-wider bg-slate-800 px-1.5 rounded text-slate-400 border border-slate-700">{contract.category}</span>
                                <span className="text-[8px] uppercase tracking-wider bg-slate-800 px-1.5 rounded text-slate-400 border border-slate-700">{contract.difficulty}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MASTERY MODAL ---

export const MasteryModal = ({ skill, onClose, onClaimReward, claimedLevels = [] }) => {
    if (!skill) return null;

    const levels = Array.from({ length: 99 }, (_, i) => i + 1);
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className={`p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-900 to-[#1a1a1a]`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${skill.color}`}>
                            <RenderIcon name={skill.iconName} size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{skill.name} Mastery</h2>
                            <div className="flex items-center gap-3 text-sm font-mono text-slate-400">
                                <span>Lvl {skill.level}</span>
                                <div className="h-4 w-px bg-slate-700"></div>
                                <span>{skill.currentXP ? skill.currentXP.toLocaleString() : 0} XP</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><X size={24}/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#111]">
                    <div className="space-y-2">
                        {levels.map(lvl => {
                            const isUnlocked = skill.level >= lvl;
                            const isClaimed = claimedLevels.includes(lvl);
                            const isMilestone = lvl % 10 === 0;
                            const reward = isMilestone ? { name: `${skill.name} Crate`, type: 'Item' } : null;

                            return (
                                <div key={lvl} className={`flex items-center gap-4 p-3 rounded-lg border ${isUnlocked ? 'bg-slate-900/50 border-slate-700' : 'bg-black/40 border-slate-800 opacity-50'} ${isMilestone ? 'border-amber-500/30' : ''}`}>
                                    <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-xs ${isUnlocked ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                        {lvl}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-300">
                                            {isMilestone ? 'Milestone Unlocked' : `Level ${lvl}`}
                                        </div>
                                        {reward && <div className="text-xs text-amber-500">Reward: {reward.name}</div>}
                                    </div>
                                    
                                    {reward && (
                                        <button 
                                            disabled={!isUnlocked || isClaimed}
                                            onClick={() => onClaimReward(skill.id, lvl, reward)}
                                            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all
                                                ${isClaimed ? 'bg-emerald-900/30 text-emerald-500 border border-emerald-900 cursor-default' : 
                                                  isUnlocked ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-900/20' : 
                                                  'bg-slate-800 text-slate-600 cursor-not-allowed'}
                                            `}
                                        >
                                            {isClaimed ? 'Claimed' : isUnlocked ? 'Claim' : 'Locked'}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};