import React from 'react';
import { RenderIcon } from './dashboardutils';
import { CARD_DATABASE } from '../data/gamedata';

// --- UPDATED SUB-COMPONENT: INVENTORY SLOT ---
export const InventorySlot = ({ item, index, onDragStart, onDrop, onContextMenu, onUse }) => {
    const isOccupied = item !== null && item !== undefined;
    
    const getRarityColor = (r) => {
        switch(r) {
            case 'Legendary': return 'border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
            case 'Epic': return 'border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
            case 'Rare': return 'border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
            default: return 'border-slate-700 text-slate-400';
        }
    };

    return (
        <div 
            className={`relative aspect-square bg-[#0a0a0a] rounded-lg border-2 transition-all group overflow-hidden ${isOccupied ? getRarityColor(item.rarity) + ' hover:border-white cursor-grab active:cursor-grabbing scale-100 hover:scale-105' : 'border-slate-800/50 hover:border-slate-600'}`}
            onDragOver={(e) => e.preventDefault()}
            onDragStart={(e) => isOccupied && onDragStart(index)}
            onDrop={(e) => onDrop(index)}
            draggable={isOccupied}
            onContextMenu={(e) => { e.preventDefault(); onContextMenu(index); }}
            onDoubleClick={() => isOccupied && onUse && onUse(item, index)}
        >
            {isOccupied && (
                <div className="w-full h-full flex items-center justify-center relative">
                    {/* HIGH-RES GRAPHIC RENDERER */}
                    {item.graphic ? (
                        <img 
                            src={item.graphic} 
                            alt={item.name} 
                            className="w-full h-full object-cover brightness-90 group-hover:brightness-110 transition-all"
                        />
                    ) : (
                        <RenderIcon name={item.iconName || 'Box'} size={28} />
                    )}

                    {/* Gradient Overlay for better text/count visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                    {/* Stack Count */}
                    {item.count > 1 && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-mono font-bold bg-black/70 px-1.5 rounded border border-white/10 text-white z-20">
                            {item.count}
                        </span>
                    )}
                    
                    {/* Hover Info */}
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-2 text-center z-30 pointer-events-none">
                        <span className="text-[9px] font-bold uppercase text-white mb-1 leading-tight">{item.name}</span>
                        <span className="text-[7px] text-slate-400 uppercase tracking-widest">{item.rarity}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: INVENTORY GRID ---
export const InventoryGrid = ({ slots, containerId, onDragStart, onDrop, onContextMenu, mp, cash, salvage, onUseItem }) => {
    return (
        <div className="flex flex-col h-full">
            {/* Currency Header (Only shows if values provided) */}
            {(mp !== undefined || cash !== undefined || salvage !== undefined) && (
                <div className="flex gap-4 mb-4 text-xs font-mono bg-black/20 p-2 rounded border border-slate-800 shrink-0">
                    {mp !== undefined && <div className="flex items-center gap-1"><RenderIcon name="Brain" size={12} className="text-pink-500"/> <span className="text-white">{mp.toLocaleString()}</span></div>}
                    {cash !== undefined && <div className="flex items-center gap-1"><RenderIcon name="DollarSign" size={12} className="text-emerald-500"/> <span className="text-white">{cash.toLocaleString()}</span></div>}
                    {salvage !== undefined && <div className="flex items-center gap-1"><RenderIcon name="Wrench" size={12} className="text-slate-400"/> <span className="text-white">{salvage}</span></div>}
                </div>
            )}
            
            {/* The Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 content-start">
                {slots.map((slot, i) => (
                    <InventorySlot 
                        key={i} 
                        index={i} 
                        item={slot} 
                        onDragStart={(idx) => onDragStart(containerId, idx)}
                        onDrop={(idx) => onDrop(containerId, idx)}
                        onContextMenu={(idx) => onContextMenu(containerId, idx)}
                        onUse={onUseItem}
                    />
                ))}
            </div>
        </div>
    );
};

// --- COMPONENT: CARD BINDER ---
export const CollectionBinder = ({ cards, onSell, onSellAll }) => {
    // Group cards by ID to show counts
    const grouped = cards.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    const uniqueIds = Object.keys(grouped);
    
    // Calculate duplicate value
    const duplicates = uniqueIds.filter(id => grouped[id] > 1);
    const dupValue = duplicates.reduce((total, id) => {
        // Mock value: 100 for now, ideally fetch from DB
        return total + ((grouped[id] - 1) * 100); 
    }, 0);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2 shrink-0">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Collection Progress</h3>
                {dupValue > 0 && (
                    <button 
                        onClick={() => onSellAll({ value: dupValue })}
                        className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 text-xs px-3 py-1 rounded border border-amber-600/50 transition-colors"
                    >
                        Sell Duplicates (+{dupValue})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto custom-scrollbar p-2">
                {uniqueIds.map(id => {
                    // Try to find card definition, fallback to generic
                    let def = { name: 'Unknown Card', rarity: 'Common', element: 'neutral' };
                    
                    // Search in BENDERS and MOVES
                    const bender = CARD_DATABASE?.BENDERS?.find(b => b.id === id);
                    const move = CARD_DATABASE?.MOVES?.find(m => m.id === id);
                    if (bender) def = bender;
                    else if (move) def = move;

                    const count = grouped[id];
                    const isDuplicate = count > 1;

                    return (
                        <div key={id} className="relative aspect-[3/4] bg-slate-900 rounded-lg border border-slate-700 overflow-hidden group hover:-translate-y-1 transition-transform">
                            {/* Card Art Placeholder */}
                            <div className={`absolute inset-0 opacity-30 ${def.element === 'water' ? 'bg-blue-900' : def.element === 'fire' ? 'bg-red-900' : def.element === 'earth' ? 'bg-green-900' : 'bg-slate-800'}`}></div>
                            
                            <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                                <div className="text-xs font-bold text-white leading-tight">{def.name}</div>
                                <div className="text-[10px] text-slate-400">{def.rarity}</div>
                            </div>

                            {/* Count Badge */}
                            <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                                x{count}
                            </div>

                            {/* Sell Button (Only for single item sell flow, mostly duplicates usually sold via Sell All) */}
                            {isDuplicate && (
                                <button 
                                    onClick={() => onSell(id, 100)}
                                    className="absolute bottom-0 left-0 w-full bg-red-900/80 hover:bg-red-700 text-white text-[10px] py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Sell 1 (+100)
                                </button>
                            )}
                        </div>
                    );
                })}
                {uniqueIds.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-500 italic">
                        No cards collected yet. Visit the Market to buy packs!
                    </div>
                )}
            </div>
        </div>
    );
};