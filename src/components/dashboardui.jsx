import React, { useState } from 'react';
import { 
  X, Check, Lock, ChevronRight, Star, 
  Trophy, AlertTriangle, Package, DollarSign,
  Zap, Droplet, Brain, Wrench
} from 'lucide-react';
// FIXED IMPORT: Using 'getRarityColor' (CamelCase)
import { RenderIcon, getRarityColor, getRarityGradient } from './dashboardutils';
import { CARD_DATABASE, SKILL_DETAILS } from '../data/gamedata';

// --- RESOURCE CARD ---
export const ResourceCard = ({ cash, discipline, salvage }) => (
    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-slate-700 shadow-lg mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Liquid Assets</span>
            <span className="text-emerald-400 font-mono font-bold text-lg flex items-center gap-1">
                <span className="text-xs text-emerald-600">$</span> {(cash || 0).toLocaleString()}
            </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 p-2 rounded border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-pink-900/10 group-hover:bg-pink-900/20 transition-colors"></div>
                <Brain size={16} className="text-pink-500 mb-1 z-10" />
                <span className="text-white font-bold font-mono z-10">{(discipline || 0).toLocaleString()}</span>
                <span className="text-[9px] text-pink-400 uppercase font-bold z-10">Brain Matter</span>
            </div>
            <div className="bg-black/30 p-2 rounded border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition-colors"></div>
                <Wrench size={16} className="text-blue-500 mb-1 z-10" />
                <span className="text-white font-bold font-mono z-10">{(salvage || 0).toLocaleString()}</span>
                <span className="text-[9px] text-blue-400 uppercase font-bold z-10">Salvage</span>
            </div>
        </div>
    </div>
);

// --- INVENTORY GRID ---
export const InventoryGrid = ({ slots, onUseItem, onDrop, onDragStart, onContextMenu, onEquip }) => {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
            {slots.map((item, index) => (
                <div 
                    key={index}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, index)}
                    className="aspect-square bg-[#131313] rounded border border-slate-800 flex items-center justify-center relative group hover:border-slate-600 transition-colors"
                    onContextMenu={(e) => onContextMenu(e, item, index)}
                >
                    {item ? (
                        <div 
                            draggable 
                            onDragStart={(e) => onDragStart(e, item, index)}
                            className="w-full h-full p-1 cursor-grab active:cursor-grabbing relative"
                        >
                            <div className={`w-full h-full rounded flex flex-col items-center justify-center bg-slate-900/50 ${getRarityColor(item.rarity)} border`}>
                                <RenderIcon name={item.iconName} size={20} />
                                {item.count > 1 && (
                                    <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-black/90 border border-slate-700 rounded p-2 pointer-events-none z-50">
                                <div className={`text-xs font-bold mb-0.5 ${item.rarity === 'Legendary' ? 'text-amber-400' : 'text-white'}`}>{item.name}</div>
                                <div className="text-[9px] text-slate-400 mb-1">{item.rarity} {item.type}</div>
                                <div className="text-[10px] text-slate-300 leading-tight">{item.effect}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-[9px] text-slate-700 font-mono select-none">{index + 1}</div>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- COLLECTION BINDER ---
export const CollectionBinder = ({ cards = [], onSell, onSellAll }) => {
    const totalCards = Object.keys(CARD_DATABASE).length;
    const collectedCount = cards.length;
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 p-2 bg-black/20 rounded border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-900/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                        <Package className="text-purple-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Collection Progress</div>
                        <div className="text-white font-mono font-bold">{collectedCount} / {totalCards}</div>
                    </div>
                </div>
                <button 
                    onClick={() => onSellAll(true)}
                    className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                >
                    <DollarSign size={14} /> Sell Duplicates
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-1">
                {cards.map((card) => (
                    <div key={card.id} className={`aspect-[2/3] bg-slate-900 rounded-lg border flex flex-col items-center justify-center relative p-2 ${getRarityColor(card.rarity)}`}>
                        <div className="text-xs font-bold text-center mb-1">{card.name}</div>
                        <RenderIcon name={card.icon} size={32} className="mb-2 opacity-80" />
                        <div className="text-[9px] text-center opacity-70 line-clamp-2">{card.desc}</div>
                        <button 
                            onClick={() => onSell(card.id, card.value)}
                            className="absolute bottom-2 right-2 bg-black/60 hover:bg-emerald-600 text-white p-1 rounded transition-colors"
                            title={`Sell for ${card.value}`}
                        >
                            <DollarSign size={10} />
                        </button>
                    </div>
                ))}
                {Array(Math.max(0, 8 - cards.length)).fill(0).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-[2/3] bg-black/20 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center opacity-30">
                        <Lock size={24} className="mb-2" />
                        <div className="text-[10px]">Undiscovered</div>
                    </div>
                ))}
            </div>
        </div>
    );
};