import React, { useState, useEffect, useCallback } from 'react';
import { 
    Zap, Droplet, DollarSign, AlertTriangle, RotateCcw,
    Layout, Plus, Maximize, PanelRightClose, X, Bed, Home, Lock, Map, ShoppingBag, Database, Sun, UtilityPole, TreePine
} from 'lucide-react';

// --- ESTATE CONSTANTS & REAL-WORLD DATA ---
const TICK_RATE_MS = 1000;
const PLOT_SQUARE_FOOTAGE = 21780; // Exactly 0.5 Acres
const PLOT_COST_CAPITAL = 75000; // $75k per half-acre lot
const LOCAL_STORAGE_KEY = 'shaboygan_estate_planner_v1';

const EXPANSION_TIERS = [
    { size: 2, cost: 0, desc: 'Initial Grant' },
    { size: 3, cost: 250000, desc: 'Purchase Adjacent Acreage' },
    { size: 4, cost: 600000, desc: 'Subdivision Acquisition' },
    { size: 5, cost: 1200000, desc: 'Regional Land Buyout' }
];

// Realistic Compound Catalog
const BUILDINGS = [
    { 
        id: 'main_lodge', name: 'Main Lodge', icon: Home, category: 'Habitation', sqft: 6500,
        cost: { capital: 850000 }, production: {}, consumption: { power: 25, water: 600, waste: 600 },
        color: 'text-amber-400', bgColor: 'bg-amber-900/40', borderColor: 'border-amber-500/50', desc: 'Communal gathering space, industrial kitchen, and main dining.'
    },
    { 
        id: 'family_cabin', name: 'Family Cabin', icon: Bed, category: 'Habitation', sqft: 1200,
        cost: { capital: 150000 }, production: {}, consumption: { power: 6, water: 200, waste: 200 },
        color: 'text-blue-400', bgColor: 'bg-blue-900/40', borderColor: 'border-blue-500/50', desc: 'Private 2-bedroom quarters for individual family branches.'
    },
    { 
        id: 'solar_array', name: '20kW Solar Farm', icon: Sun, category: 'Utility', sqft: 2500,
        cost: { capital: 60000 }, production: { power: 20 }, consumption: {},
        color: 'text-yellow-400', bgColor: 'bg-yellow-900/40', borderColor: 'border-yellow-500/50', desc: 'Off-grid solar array with battery banks.'
    },
    { 
        id: 'deep_well', name: 'Deep Water Well', icon: Droplet, category: 'Utility', sqft: 200,
        cost: { capital: 35000 }, production: { water: 1500 }, consumption: { power: 3 },
        color: 'text-cyan-400', bgColor: 'bg-cyan-900/40', borderColor: 'border-cyan-500/50', desc: 'High-yield aquifer tap. Requires power to pump.'
    },
    { 
        id: 'septic_field', name: 'Commercial Septic', icon: Database, category: 'Utility', sqft: 6000,
        cost: { capital: 55000 }, production: { waste_cap: 2500 }, consumption: {},
        color: 'text-emerald-400', bgColor: 'bg-emerald-900/40', borderColor: 'border-emerald-500/50', desc: 'Large-scale leach field for processing wastewater.'
    },
    { 
        id: 'city_grid', name: 'City Grid Tie-In', icon: UtilityPole, category: 'Utility', sqft: 500,
        cost: { capital: 250000 }, production: { power: 100, water: 5000, waste_cap: 5000 }, consumption: {},
        color: 'text-purple-400', bgColor: 'bg-purple-900/40', borderColor: 'border-purple-500/50', desc: 'Trenching and connecting to municipal utilities.'
    }
];

const INITIAL_RESOURCES = {
    capital: 2500000, // $2.5M Starting Budget
    power_used: 0, power_cap: 0,
    water_used: 0, water_cap: 0,
    waste_used: 0, waste_cap: 0
};

// --- COMPONENTS ---
const ItemEditModal = ({ plotIndex, plot, onClose, onRemoveItem }) => {
    const currentUsedSF = plot.sqft || 0;
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-slate-600 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">Lot {plotIndex + 1} Operations</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18}/></button>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-mono bg-slate-800/50 p-2 rounded border border-slate-700">
                        <span className="text-slate-400">Land Used:</span>
                        <span className="text-white">{currentUsedSF.toLocaleString()} / {PLOT_SQUARE_FOOTAGE.toLocaleString()} sq ft</span>
                    </div>

                    <h4 className="text-sm font-bold text-white pt-2">Structures ({plot.builtItems.length})</h4>
                    
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                        {plot.builtItems.map((item) => (
                            <div key={item.runtimeId} className={`flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border ${item.borderColor}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${item.bgColor} ${item.color}`}><item.icon size={20} /></div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{item.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">Footprint: {item.sqft.toLocaleString()} sq ft</div>
                                    </div>
                                </div>
                                <button onClick={() => onRemoveItem(plotIndex, item.runtimeId)} className="text-red-400 hover:text-white hover:bg-red-900/50 p-2 rounded-lg transition-colors border border-red-900/30" title="Demolish (50% Cost Recovery)">
                                    <RotateCcw size={16}/>
                                </button>
                            </div>
                        ))}
                        {plot.builtItems.length === 0 && (
                            <div className="text-center py-6 text-slate-500 text-sm font-mono border border-dashed border-slate-700 rounded-lg">No structures built on this lot.</div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default function EstatePrototype() {
    // --- ISOLATED STATE INITIALIZATION ---
    const [resources, setResources] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved).resources : INITIAL_RESOURCES;
    });
    
    const [gridDimension, setGridDimension] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved).gridDimension : 2;
    });
    
    const [grid, setGrid] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved && JSON.parse(saved).grid) return JSON.parse(saved).grid;
        const initial = new Array(4).fill(null);
        initial[0] = { type: 'empty', sqft: 0, builtItems: [] };
        return initial;
    });

    const [starvedModules, setStarvedModules] = useState(new Set());
    
    // UI State
    const [pendingBuildItem, setPendingBuildItem] = useState(null);
    const [isShopOpen, setShopOpen] = useState(false);
    const [shopTab, setShopTab] = useState('structures');
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [plotContentEditData, setPlotContentEditData] = useState(null);
    const [notification, setNotification] = useState(null);

    // --- ISOLATED LOCAL STORAGE SAVE ---
    useEffect(() => {
        const dataToSave = { resources, gridDimension, grid };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }, [resources, gridDimension, grid]);

    const showNotification = useCallback((msg, duration = 3000) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), duration);
    }, []);

    // --- ESTATE ENGINE: UTILITY CALCULATOR ---
    useEffect(() => {
        const calculateUtilities = () => {
            let p_cap = 0, p_used = 0;
            let w_cap = 0, w_used = 0;
            let s_cap = 0, s_used = 0;
            const newStarved = new Set();

            // 1. Calculate Production Capabilities
            grid.forEach(plot => {
                if (plot && plot.type === 'built') {
                    plot.builtItems.forEach(item => {
                        p_cap += item.production?.power || 0;
                        w_cap += item.production?.water || 0;
                        s_cap += item.production?.waste_cap || 0;
                    });
                }
            });

            // 2. Calculate Consumption & Shortages
            grid.forEach(plot => {
                if (plot && plot.type === 'built') {
                    plot.builtItems.forEach(item => {
                        const needP = item.consumption?.power || 0;
                        const needW = item.consumption?.water || 0;
                        const needS = item.consumption?.waste || 0;

                        if ((needP > 0 && p_used + needP > p_cap) || 
                            (needW > 0 && w_used + needW > w_cap) || 
                            (needS > 0 && s_used + needS > s_cap)) {
                            newStarved.add(item.runtimeId);
                        } else {
                            p_used += needP;
                            w_used += needW;
                            s_used += needS;
                        }
                    });
                }
            });

            setStarvedModules(newStarved);
            setResources(prev => ({
                ...prev,
                power_cap: p_cap, power_used: p_used,
                water_cap: w_cap, water_used: w_used,
                waste_cap: s_cap, waste_used: s_used
            }));
        };

        const tick = setInterval(calculateUtilities, TICK_RATE_MS);
        return () => clearInterval(tick);
    }, [grid]);

    // --- CANVAS CONTROLS ---
    const handleWheel = (e) => {
        if (e.target.closest('.shop-sidebar') || e.target.closest('.modal-overlay')) return;
        const direction = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.min(2.0, Math.max(0.4, parseFloat((prev + direction).toFixed(1)))));
    };

    const handleMouseDown = (e) => {
        if(e.target.id === 'blueprint-canvas' || e.target.id === 'canvas-container') setIsPanning(true);
    };

    const handleMouseMove = (e) => {
        if (!isPanning) return;
        setPanOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    };

    // --- ACTIONS ---
    const expandGrid = (tierInfo) => {
        if (resources.capital < tierInfo.cost) {
            showNotification("Insufficient Capital for land acquisition.");
            return;
        }

        setResources(prev => ({ ...prev, capital: prev.capital - tierInfo.cost }));
        const newDim = tierInfo.size;
        const newGrid = new Array(newDim * newDim).fill(null);
        
        for(let i = 0; i < grid.length; i++) {
            const row = Math.floor(i / gridDimension); 
            const col = i % gridDimension; 
            const newIndex = (row * newDim) + col;
            if (newIndex < newGrid.length) newGrid[newIndex] = grid[i];
        }
        
        setGrid(newGrid);
        setGridDimension(newDim);
        setShopOpen(false);
        showNotification(`Estate acreage expanded! Now viewing ${newDim * newDim / 2} Acres.`);
    };

    const buyPlot = (index) => {
        if (resources.capital < PLOT_COST_CAPITAL) {
            showNotification(`Insufficient Capital. Need $${PLOT_COST_CAPITAL.toLocaleString()} to zone new lot.`);
            return;
        }
        setResources(prev => ({ ...prev, capital: prev.capital - PLOT_COST_CAPITAL }));
        const newGrid = [...grid];
        newGrid[index] = { type: 'empty', sqft: 0, builtItems: [] };
        setGrid(newGrid);
        showNotification("Half-Acre Lot Zoned for Construction.");
    };

    const buildItem = (index, itemDef) => {
        if (resources.capital < itemDef.cost.capital) {
            showNotification(`Insufficient Capital. Need $${itemDef.cost.capital.toLocaleString()}.`);
            return;
        }

        const plot = grid[index] || { type: 'empty', sqft: 0, builtItems: [] };
        const newTotalSF = (plot.sqft || 0) + itemDef.sqft;
        
        if (newTotalSF > PLOT_SQUARE_FOOTAGE) {
            showNotification(`Lot capacity exceeded! Max ${PLOT_SQUARE_FOOTAGE.toLocaleString()} sq ft per half-acre.`);
            return;
        }

        setResources(prev => ({ ...prev, capital: prev.capital - itemDef.cost.capital }));

        const newGrid = [...grid];
        newGrid[index] = {
            type: 'built',
            sqft: newTotalSF,
            builtItems: [...plot.builtItems, { ...itemDef, runtimeId: Date.now() + Math.random() }]
        };
        
        setGrid(newGrid);
        setPendingBuildItem(null); 
    };

    const handleSlotClick = (index) => {
        const plot = grid[index];
        
        if (plot === null) {
            if (pendingBuildItem?.id === 'deed') buyPlot(index);
            else showNotification("Zone this lot via the market before building.");
            return;
        }

        if (pendingBuildItem && pendingBuildItem.id !== 'deed') {
            buildItem(index, pendingBuildItem);
            return;
        }

        if (plot.type === 'built' && !pendingBuildItem) {
            setPlotContentEditData({ plotIndex: index, plot });
        }
    };

    const removeModule = (plotIndex, runtimeId) => {
        setGrid(prev => {
            const newGrid = [...prev];
            const plot = { ...newGrid[plotIndex] };
            
            const item = plot.builtItems.find(i => i.runtimeId === runtimeId);
            if (item) {
                // Recover 50% Capital on demolition
                setResources(r => ({ ...r, capital: r.capital + Math.floor(item.cost.capital * 0.5) }));
            }

            plot.builtItems = plot.builtItems.filter(i => i.runtimeId !== runtimeId);
            plot.sqft = plot.builtItems.reduce((sum, i) => sum + i.sqft, 0);
            
            if (plot.builtItems.length === 0) plot.type = 'empty';
            
            newGrid[plotIndex] = plot;
            setPlotContentEditData(curr => curr ? { ...curr, plot: newGrid[plotIndex] } : null);
            return newGrid;
        });
    };

    const handleReset = () => {
        if(confirm("Are you sure you want to completely reset your Estate Plan? All progress and layout will be lost.")) {
            setResources(INITIAL_RESOURCES);
            setGridDimension(2);
            const initial = new Array(4).fill(null);
            initial[0] = { type: 'empty', sqft: 0, builtItems: [] };
            setGrid(initial);
            setPlotContentEditData(null);
            setPendingBuildItem(null);
        }
    };

    const nextExpansion = EXPANSION_TIERS.find(t => t.size === gridDimension + 1);

    return (
        <div className="h-full w-full flex flex-col bg-[#0b0e14] text-slate-200 font-sans overflow-hidden">
            
            {/* --- TOP HUD (ESTATE METRICS) --- */}
            <div className="h-16 bg-[#12161f] border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded-lg border border-slate-600">
                        <TreePine className="text-emerald-500" size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-wider">ESTATE <span className="text-slate-400">PLANNER</span></h1>
                        <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Family Compound Projections</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Capital */}
                    <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 flex flex-col items-center min-w-[140px]">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Capital Budget</div>
                        <div className="font-mono text-emerald-400 font-bold text-lg">${resources.capital.toLocaleString()}</div>
                    </div>
                    
                    {/* Power Supply */}
                    <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 flex flex-col items-center min-w-[120px]">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase"><Zap size={12} className="text-yellow-400"/> Power Load</div>
                        <div className="flex items-end gap-1">
                            <span className={`font-mono font-bold ${resources.power_used > resources.power_cap ? 'text-red-400 animate-pulse' : 'text-yellow-100'}`}>
                                {resources.power_used}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mb-0.5">/ {resources.power_cap} kW</span>
                        </div>
                    </div>

                    {/* Water Supply */}
                    <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 flex flex-col items-center min-w-[120px]">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase"><Droplet size={12} className="text-cyan-400"/> Water Flow</div>
                        <div className="flex items-end gap-1">
                            <span className={`font-mono font-bold ${resources.water_used > resources.water_cap ? 'text-red-400 animate-pulse' : 'text-cyan-100'}`}>
                                {resources.water_used}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mb-0.5">/ {resources.water_cap} GPD</span>
                        </div>
                    </div>

                    {/* Septic/Waste */}
                    <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 flex flex-col items-center min-w-[120px]">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase"><Database size={12} className="text-emerald-500"/> Septic Cap</div>
                        <div className="flex items-end gap-1">
                            <span className={`font-mono font-bold ${resources.waste_used > resources.waste_cap ? 'text-red-400 animate-pulse' : 'text-emerald-100'}`}>
                                {resources.waste_used}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mb-0.5">/ {resources.waste_cap} GPD</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN WORKSPACE --- */}
            <div className="flex-1 flex relative overflow-hidden">
                
                {/* Canvas Area */}
                <div 
                    id="canvas-container"
                    className={`flex-1 relative bg-[#171a21] overflow-hidden outline-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setIsPanning(false)}
                    onMouseLeave={() => setIsPanning(false)}
                    onWheel={handleWheel}
                >
                    {/* Topographical Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ 
                            backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
                            backgroundSize: `${40 * zoomLevel}px ${40 * zoomLevel}px`,
                            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
                        }}>
                    </div>

                    {notification && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 border border-slate-500 text-slate-100 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
                            <AlertTriangle size={18} className="text-amber-500" /> <span className="text-sm font-bold tracking-wide">{notification}</span>
                        </div>
                    )}

                    {pendingBuildItem && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
                            <div className="bg-slate-900/95 border border-slate-600 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-4">
                                <div className="p-2 bg-slate-800 rounded-lg"><pendingBuildItem.icon size={24} className="text-slate-300"/></div>
                                <div>
                                    <div className="text-white font-bold text-lg">Surveying: {pendingBuildItem.name}</div>
                                    <div className="text-slate-400 text-xs">Select a zoned lot (0.5 Acres) to construct.</div>
                                </div>
                                <button onClick={() => setPendingBuildItem(null)} className="ml-4 p-2 bg-slate-800 hover:bg-red-900/80 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-2">
                        <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg text-xs font-mono text-slate-400 backdrop-blur-sm shadow-xl">
                            <div className="font-bold text-white mb-1">Scale Reference</div>
                            <div>1 Grid Square = 0.5 Acres (21,780 sqft)</div>
                        </div>
                        <button onClick={handleReset} className="bg-red-900/20 hover:bg-red-900/50 border border-red-900/50 text-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
                            <RotateCcw size={14} /> Factory Reset Planner
                        </button>
                    </div>

                    {!isShopOpen && (
                        <button 
                            onClick={() => setShopOpen(true)}
                            className="absolute top-6 right-6 z-30 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 border border-slate-600 transition-all hover:scale-105"
                        >
                            <Layout size={18} /> Open Planner
                        </button>
                    )}

                    {/* The Grid Transformation Layer */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div 
                            className="pointer-events-auto transition-transform duration-75 ease-out origin-center bg-[#1a1d24] border-4 border-slate-800 rounded-xl shadow-2xl p-4"
                            style={{ 
                                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                                width: `${Math.max(500, gridDimension * 200)}px`,
                                aspectRatio: '1/1'
                            }}
                        >
                            <div 
                                className="w-full h-full grid gap-3"
                                style={{ gridTemplateColumns: `repeat(${gridDimension}, minmax(0, 1fr))` }}
                            >
                                {grid.map((plot, i) => {
                                    const isLocked = plot === null;
                                    const isEmpty = plot?.type === 'empty';
                                    const isBuilt = plot?.type === 'built';
                                    const isValidTarget = pendingBuildItem && ((pendingBuildItem.id === 'deed' && isLocked) || (pendingBuildItem.id !== 'deed' && !isLocked));

                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => handleSlotClick(i)}
                                            className={`
                                                relative w-full h-full rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden border-2
                                                ${isLocked ? 'bg-[#1e232b] border-dashed border-slate-700/50 hover:bg-slate-800 hover:border-slate-500' : ''}
                                                ${isEmpty ? 'bg-[#232936] border-slate-600 hover:bg-[#2a3140] hover:border-slate-400 shadow-inner' : ''}
                                                ${isBuilt ? 'bg-[#232936] border-slate-500 hover:border-slate-300 shadow-md' : ''}
                                                ${isValidTarget ? 'ring-4 ring-emerald-500/50 ring-offset-2 ring-offset-[#1a1d24]' : ''}
                                            `}
                                        >
                                            {isLocked && (
                                                <div className="text-slate-600 flex flex-col items-center gap-2 opacity-50">
                                                    <Lock size={28} />
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">Unzoned Land</span>
                                                </div>
                                            )}

                                            {isEmpty && (
                                                <div className="text-slate-500 flex flex-col items-center gap-1 opacity-60">
                                                    <Plus size={24} />
                                                    <span className="text-[10px] font-mono">Lot {i+1} (0.5 Ac)</span>
                                                </div>
                                            )}

                                            {isBuilt && (
                                                <div className="absolute inset-0 p-3 flex flex-wrap content-start justify-center gap-2 overflow-hidden pointer-events-none">
                                                    {plot.builtItems.map((item, idx) => {
                                                        const isStarved = starvedModules.has(item.runtimeId);
                                                        return (
                                                            <div key={idx} className={`relative p-2 rounded-lg border ${item.bgColor} ${item.borderColor} ${isStarved ? 'opacity-40 grayscale border-red-500/50' : 'shadow-lg'}`}>
                                                                <item.icon size={24} className={isStarved ? 'text-red-400' : item.color} />
                                                                {isStarved && (
                                                                    <div className="absolute -inset-1 flex items-center justify-center bg-red-900/30 rounded-lg ring-2 ring-red-500 animate-pulse">
                                                                        <AlertTriangle size={16} className="text-red-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[9px] font-mono text-slate-300 backdrop-blur-sm">
                                                        Lot {i+1}: {(plot.sqft / 43560).toFixed(2)} Ac Used
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDEBAR: PLANNER --- */}
                <div className={`shop-sidebar absolute top-0 right-0 bottom-0 w-[420px] bg-[#1a1d24] border-l border-slate-700 shadow-2xl transition-transform duration-300 z-40 flex flex-col ${isShopOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#14171c]">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200"><Layout className="text-slate-400"/> Estate Planner</h2>
                        <button onClick={() => setShopOpen(false)} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"><PanelRightClose size={20}/></button>
                    </div>

                    <div className="flex px-4 pt-4 pb-2 border-b border-slate-800 gap-2">
                        <button onClick={() => setShopTab('structures')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border ${shopTab === 'structures' ? 'bg-slate-800 border-slate-600 text-white shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-800/50'}`}>Structures</button>
                        <button onClick={() => setShopTab('infrastructure')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border ${shopTab === 'infrastructure' ? 'bg-slate-800 border-slate-600 text-white shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-800/50'}`}>Land & Dev</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        
                        {/* STRUCTURES TAB */}
                        {shopTab === 'structures' && BUILDINGS.map(b => {
                            const canAfford = resources.capital >= b.cost.capital;
                            return (
                                <div key={b.id} className="bg-[#212631] border border-slate-700 p-4 rounded-xl hover:border-slate-500 transition-colors shadow-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${b.bgColor} ${b.color} border ${b.borderColor}`}><b.icon size={20}/></div>
                                            <div>
                                                <div className="font-bold text-sm text-white">{b.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{b.category} • {b.sqft.toLocaleString()} sq ft</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setPendingBuildItem(b)}
                                            disabled={!canAfford}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${canAfford ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                                        >
                                            Plan
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4 leading-relaxed mt-2">{b.desc}</p>
                                    
                                    <div className="bg-[#1a1d24] rounded-lg p-2 border border-slate-800/50 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Est. Cost:</span>
                                            <span className="text-emerald-400 font-bold font-mono">${b.cost.capital.toLocaleString()}</span>
                                        </div>
                                        
                                        {(b.consumption?.power || b.consumption?.water || b.consumption?.waste) && (
                                            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[10px] font-mono">
                                                <span className="text-slate-500 w-full mb-0.5">Requirements:</span>
                                                {b.consumption?.power > 0 && <span className="text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded">{b.consumption.power} kW</span>}
                                                {b.consumption?.water > 0 && <span className="text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded">{b.consumption.water} GPD</span>}
                                                {b.consumption?.waste > 0 && <span className="text-emerald-500 bg-emerald-900/20 px-2 py-0.5 rounded">{b.consumption.waste} GPD Waste</span>}
                                            </div>
                                        )}
                                        
                                        {(b.production?.power || b.production?.water || b.production?.waste_cap) && (
                                            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[10px] font-mono">
                                                <span className="text-slate-500 w-full mb-0.5">Provides:</span>
                                                {b.production?.power > 0 && <span className="text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded">+{b.production.power} kW</span>}
                                                {b.production?.water > 0 && <span className="text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded">+{b.production.water} GPD</span>}
                                                {b.production?.waste_cap > 0 && <span className="text-emerald-500 bg-emerald-900/20 px-2 py-0.5 rounded">+{b.production.waste_cap} GPD Capacity</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* INFRASTRUCTURE TAB */}
                        {shopTab === 'infrastructure' && (
                            <>
                                <div className="bg-[#212631] border border-slate-700 p-4 rounded-xl hover:border-slate-500 transition-colors shadow-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-600"><Map size={20}/></div>
                                            <div>
                                                <div className="font-bold text-sm text-white">Zone New Lot</div>
                                                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">0.5 Acres</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setPendingBuildItem({ id: 'deed', name: 'Zoning Plot', icon: Map })}
                                            disabled={resources.capital < PLOT_COST_CAPITAL}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${resources.capital >= PLOT_COST_CAPITAL ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                                        >
                                            Zone
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3 mt-2 leading-relaxed">Prepare a 0.5 Acre tract of land within your estate boundaries for structural development.</p>
                                    <div className="flex justify-between items-center text-xs bg-[#1a1d24] p-2 rounded-lg border border-slate-800/50">
                                        <span className="text-slate-500 font-medium">Zoning Cost:</span>
                                        <span className="text-emerald-400 font-bold font-mono">${PLOT_COST_CAPITAL.toLocaleString()}</span>
                                    </div>
                                </div>

                                {nextExpansion ? (
                                    <div className="bg-[#1e232b] border border-slate-700 p-4 rounded-xl mt-4 relative overflow-hidden shadow-inner">
                                        <div className="absolute -right-4 -top-4 opacity-5"><Maximize size={120}/></div>
                                        <div className="relative z-10">
                                            <h4 className="text-white font-bold text-sm mb-1">Expand Estate Boundaries</h4>
                                            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{nextExpansion.desc}. Secures more raw land, increasing total map grid to {nextExpansion.size}x{nextExpansion.size} ({(nextExpansion.size * nextExpansion.size) / 2} Acres).</p>
                                            <button 
                                                onClick={() => expandGrid(nextExpansion)}
                                                disabled={resources.capital < nextExpansion.cost}
                                                className={`w-full py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${resources.capital >= nextExpansion.cost ? 'bg-slate-200 hover:bg-white text-slate-900' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}
                                            >
                                                Acquire Land (${nextExpansion.cost.toLocaleString()})
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl mt-4 text-slate-500 text-sm font-mono uppercase tracking-widest">
                                        Maximum Acreage Acquired
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>

            {plotContentEditData && (
                <ItemEditModal 
                    plotIndex={plotContentEditData.plotIndex} 
                    plot={plotContentEditData.plot} 
                    onClose={() => setPlotContentEditData(null)} 
                    onRemoveItem={removeModule} 
                />
            )}
        </div>
    );
}