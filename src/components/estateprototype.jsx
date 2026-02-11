import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gamestore'; 
import { 
    PLOT_SQUARE_FOOTAGE, PLOT_COST, PLOT_DIMENSION_M, 
    EXPANSION_TIERS, DEFAULT_ESTATE_ITEMS, MAX_GRID_DIMENSION 
} from '../data/gamedata'; 

// --- 1. ASSETS & ICONS (Internal Definition to ensure stability) ---
const Icon = ({ d, size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d={d} />
    </svg>
);

// Minimal Icon Set for Estate
const ICONS = {
    Layout: (props) => <Icon {...props} d="M3 3h18v18H3zM3 9h18M9 21V9" />,
    Home: (props) => <Icon {...props} d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    Hammer: (props) => <Icon {...props} d="m15 12-8.5 8.5c-1.1 1.1-2.5 1.5-3.5.5s-.6-2.4.5-3.5L11 9h7v7z" />,
    Plus: (props) => <Icon {...props} d="M12 5v14M5 12h14" />,
    Maximize: (props) => <Icon {...props} d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />,
    PanelRightClose: (props) => <Icon {...props} d="M18 3v18M12 9l3 3-3 3M3 3h18v18H3z" />,
    X: (props) => <Icon {...props} d="M18 6 6 18M6 6l12 12" />,
    Bed: (props) => <Icon {...props} d="M2 19v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M12 13V7M2 9h20" />,
    Utensils: (props) => <Icon {...props} d="M3 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V2M12 22v-7" />,
    Bath: (props) => <Icon {...props} d="M9 6 6.5 3.5M3 7v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7" />,
    Wrench: (props) => <Icon {...props} d="M14 14.5V17m-3-3.5L8 10 5.5 7.5a2.12 2.12 0 0 1 3 3L11 14l3 3m7.5-6.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z" />,
    Lock: (props) => <Icon {...props} d="M15 16h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3V7a4 4 0 0 0-8 0v3H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10z" />,
    HelpCircle: (props) => <Icon {...props} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />,
    Map: (props) => <Icon {...props} d="M14.1 6.3a2 2 0 0 0-1.1-1.1c-.8-.2-1.7.3-2 .8L7.8 8.8c-.8 1.4-.4 3.1 1 4L11 15h6v4l4-4 4-4-4-4z" />,
    Trophy: (props) => <Icon {...props} d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M2 22h20M8 22l1-9h6l1 9" />,
    Zap: (props) => <Icon {...props} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    ZoomIn: (props) => <Icon {...props} d="M11 5h2M12 12v.01M12 17h.01M17 12h.01M19 12a7 7 0 1 0-7 7 7 7 0 0 0 7-7zM8 8l2 2m4 4 l2 2" />,
    ZoomOut: (props) => <Icon {...props} d="M5 12h14M12 12v.01M12 17h.01M17 12h.01M19 12a7 7 0 1 0-7 7 7 7 0 0 0 7-7z" />,
    Shop: (props) => <Icon {...props} d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />,
    Brain: (props) => <Icon {...props} d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 2.96-3.08 3 3 0 0 1-.34-5.55 2.5 2.5 0 0 1 .34-4.94 2.5 2.5 0 0 1 2.5-2.5zm5 0a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1 .34 4.94 3 3 0 0 1-.34 5.55 2.5 2.5 0 0 1 2.96 3.08 2.5 2.5 0 0 1-4.96-.44v-15A2.5 2.5 0 0 1 14.5 2z" />,
    Trash2: (props) => <Icon {...props} d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />,
    Edit3: (props) => <Icon {...props} d="M12 20h9M16.5 3.5l4 4L7.5 19.5 3 21l1.5-4.5L16.5 3.5z" />,
    Link: (props) => <Icon {...props} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeWidth="2.5"/>, 
};

const RenderIcon = ({ name, size = 16, className = "" }) => {
    const IconComponent = ICONS[name] || ICONS.HelpCircle;
    return <IconComponent size={size} className={className} />;
};

const getItemColor = (category) => {
    const CATEGORY_COLORS = {
        'Special': { text: 'text-amber-400', border: 'border-amber-700', bg: 'bg-amber-900/50' },
        'Build': { text: 'text-blue-400', border: 'border-blue-700', bg: 'bg-blue-900/50' },
        'Deeds': { text: 'text-orange-400', border: 'border-orange-700', bg: 'bg-orange-900/50' },
        'Assets': { text: 'text-purple-400', border: 'border-purple-700', bg: 'bg-purple-900/50' },
    };
    return CATEGORY_COLORS[category] || { text: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-900/50' };
};

// --- 2. MODALS ---

const ItemEditModal = ({ plotIndex, plot, onClose, onRemoveItem }) => {
    const currentUsedSF = plot.sqft || 0;
    const remainingSF = PLOT_SQUARE_FOOTAGE - currentUsedSF;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[110] p-4">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-slate-600 w-full max-w-lg">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2"><RenderIcon name="Edit3" size={20}/> Edit Plot {plotIndex + 1} Contents</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><RenderIcon name="X" size={18}/></button>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-mono bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-400">Capacity Used:</span>
                        <span className="text-white">{currentUsedSF.toLocaleString()} SF</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-400">Capacity Remaining:</span>
                        <span className="text-emerald-400">{remainingSF.toLocaleString()} SF</span>
                    </div>

                    <h4 className="text-sm font-bold text-white pt-2">Modules Placed ({plot.builtItems.length})</h4>
                    
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                        {plot.builtItems.map((item) => (
                            <div key={item.runtimeId} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 rounded-full bg-blue-900/50"><RenderIcon name={item.icon} size={16} className="text-blue-300"/></div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{item.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">SF: {item.sqft.toLocaleString()} ({item.length}x{item.width} m)</div>
                                    </div>
                                </div>
                                <button onClick={() => onRemoveItem(plotIndex, item.runtimeId)} className="text-red-400 hover:text-white bg-red-900/30 p-2 rounded-lg transition-colors" title="Remove Module">
                                    <RenderIcon name="Trash2" size={16}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 rounded text-white font-bold">Done Editing</button>
                </div>
            </div>
        </div>
    );
};

const CustomModal = ({ modal, closeModal }) => {
    if (!modal.isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 animate-in">
            <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-amber-400">{modal.title}</h3>
                    <button onClick={closeModal} className="text-slate-500 hover:text-white"><RenderIcon name="X" size={18}/></button>
                </div>
                <p className="text-sm text-slate-300 mb-6">{modal.message}</p>
                <div className={`flex ${modal.isConfirm ? 'justify-between' : 'justify-end'} gap-3`}>
                    {modal.isConfirm && <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white">Cancel</button>}
                    <button onClick={modal.onConfirm || closeModal} className={`px-4 py-2 text-sm font-semibold rounded-lg text-white ${modal.isConfirm ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{modal.isConfirm ? 'Confirm' : 'OK'}</button>
                </div>
            </div>
        </div>
    );
};

// --- 3. SUB-COMPONENTS ---

const GridSlot = ({ index, state, isSelected, pendingItem, onInteract, onDemolish, gridDim, onMaintain, links, onLink, onDragStart, onDrop }) => {
    const isBuilt = state && typeof state === 'object' && state.type !== 'empty';
    const isOwned = state !== null;
    const isLocked = state === null;
    const itemColors = isBuilt && state.builtItems && state.builtItems.length > 0 
        ? getItemColor(state.builtItems[0].category) 
        : { text: 'text-slate-400', border: 'border-slate-700' };
        
    const hasRightLink = links && links.includes('right');
    const hasBottomLink = links && links.includes('bottom');
    const borderClass = isLocked 
        ? "border-2 border-dashed border-slate-700/50 rounded-md"
        : `border-t-2 border-l-2 ${hasRightLink ? 'border-r-0' : 'border-r-2'} ${hasBottomLink ? 'border-b-0' : 'border-b-2'}`;
    
    let statusStyle = isLocked ? `bg-emerald-900/30` : `bg-emerald-900/30 border-emerald-500/30 rounded-sm`;
    if (isBuilt) statusStyle = `bg-emerald-900/30 ${itemColors.border} shadow-lg z-10 rounded-sm`;
    
    const canDrop = isOwned && !isBuilt && !pendingItem;
    const idxRight = (index % gridDim < gridDim - 1) ? index + 1 : -1;
    const idxDown = (Math.floor(index / gridDim) < gridDim - 1) ? index + gridDim : -1;
    
    return (
        <div 
            onClick={(e) => { e.stopPropagation(); onInteract(index); }} 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, index)}
            onDragStart={(e) => onDragStart(e, index)}
            draggable={isBuilt}
            className={`relative flex flex-col items-center justify-center transition-all cursor-pointer group overflow-visible aspect-square select-none ${statusStyle} ${borderClass} ${isSelected ? "ring-2 ring-amber-500 z-30" : ""} ${isBuilt ? 'cursor-move' : ''} ${canDrop ? 'hover:bg-yellow-900/30' : ''}`}
        >
            {isOwned && <div className="absolute inset-0 z-10" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, index)}></div>}
            
            {isSelected && isOwned && (
                <>
                    {idxRight !== -1 && (
                        <button onClick={(e) => { e.stopPropagation(); onLink(index, 'right'); }} className={`absolute -right-3 top-1/2 -translate-y-1/2 z-50 p-1 rounded-full shadow-lg border border-slate-600 transition-all hover:scale-110 ${hasRightLink ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            <RenderIcon name="Link" size={10} />
                        </button>
                    )}
                    {idxDown !== -1 && (
                        <button onClick={(e) => { e.stopPropagation(); onLink(index, 'bottom'); }} className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-50 p-1 rounded-full shadow-lg border border-slate-600 transition-all hover:scale-110 ${hasBottomLink ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            <RenderIcon name="Link" size={10} className="rotate-90" />
                        </button>
                    )}
                </>
            )}

            {isBuilt ? (
                <>
                    {state.builtItems.map((module, moduleIndex) => (
                        <div 
                            key={module.runtimeId} 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden rounded-[2px] pointer-events-none bg-white/5 border border-dashed border-white/20"
                            style={{
                                width: `${(module.width / PLOT_DIMENSION_M) * 100}%`,
                                height: `${(module.length / PLOT_DIMENSION_M) * 100}%`,
                                transform: `translate(-50%, -50%) translate(${moduleIndex * 2}px, ${moduleIndex * 2}px)`,
                                zIndex: 30 + moduleIndex
                            }}
                        >
                            <div className="flex flex-col items-center justify-center text-center p-1">
                                <div className={`p-0.5 rounded-full bg-black/50 ${itemColors.text}`}><RenderIcon name={module.icon} size={10} /></div>
                            </div>
                        </div>
                    ))}
                    <button onClick={(e) => { e.stopPropagation(); onMaintain(index); }} className="absolute bottom-0.5 left-0.5 text-slate-400 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-full p-0.5 z-50 pointer-events-auto"><RenderIcon name="Wrench" size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDemolish(index); }} className="absolute top-0.5 right-0.5 text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-full p-0.5 z-50 pointer-events-auto"><RenderIcon name="Edit3" size={10} /></button>
                </>
            ) : isOwned ? (
                <div className={`flex flex-col items-center ${pendingItem && !pendingItem.isDeed ? 'text-emerald-400' : 'text-emerald-500/50 group-hover:text-emerald-400'}`}>
                    <RenderIcon name={pendingItem && !pendingItem.isDeed ? "Hammer" : "Plus"} size={14} />
                    <span className="text-[8px] mt-1 font-mono text-emerald-600/70">{PLOT_SQUARE_FOOTAGE} SF</span>
                </div>
            ) : (
                <div className="flex flex-col items-center text-slate-500 transition-colors opacity-60">
                    <RenderIcon name="Lock" size={16} className="mb-1 text-slate-600"/>
                    <span className="text-[8px] font-mono uppercase font-bold text-slate-400">Locked</span>
                </div>
            )}
        </div>
    );
};

// --- 4. MAIN ESTATE COMPONENT ---
const EstatePrototype = () => {
    // NOTE: Removed props. Using Store directly for currency to avoid sync errors.
    const { data, updateData } = useGameStore();
    
    // Derived state from Store
    const discipline = data.discipline || 0;
    const salvage = data.salvage || 0;

    const [gridDimension, setGridDimension] = useState(data.estate?.gridDimension || 1);
    
    // Initialize Grid with Safe Default
    const [grid, setGrid] = useState(() => {
        const savedGrid = data.estate?.grid;
        if (savedGrid && Array.isArray(savedGrid)) return savedGrid;
        
        // Default 1x1 grid if empty
        const initial = new Array(1).fill(null);
        initial[0] = { type: 'empty', links: [] };
        return initial;
    });

    const shopItems = data.estate?.shopItems || DEFAULT_ESTATE_ITEMS;

    // UI State
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [pendingBuildItem, setPendingBuildItem] = useState(null);
    const [isShopOpen, setShopOpen] = useState(true);
    const [shopTab, setShopTab] = useState('build');
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, message: '', isConfirm: false, onConfirm: null, title: '' });
    const [plotContentEditData, setPlotContentEditData] = useState(null); 

    // --- Data Persistence ---
    // Sync local grid changes to Global Store automatically
    useEffect(() => {
        updateData(prev => ({
            estate: {
                ...(prev.estate || {}),
                grid: grid,
                gridDimension: gridDimension,
            }
        }));
    }, [grid, gridDimension, updateData]);

    // Input Handlers
    const handleWheel = (e) => {
        if (e.target.closest('.shop-sidebar') || e.target.closest('.header-bar')) return;
        const ZOOM_STEP = 0.1;
        const direction = e.deltaY > 0 ? -1 : 1;
        setZoomLevel(prev => Math.min(2.0, Math.max(0.5, parseFloat((prev + direction * ZOOM_STEP).toFixed(1)))));
    };

    const handleMouseDown = (e) => {
        const isCanvasBackground = e.target.closest('.grid-container') || e.target.id === 'canvas-wrapper';
        if(isCanvasBackground) setIsPanning(true);
    };

    const handleMouseMove = (e) => {
        if (!isPanning) return;
        setPanOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    };

    const closeModal = () => setModal({ isOpen: false, message: '', title: '' });
    const showMessage = (message, title = "Notification") => setModal({ isOpen: true, message, isConfirm: false, onConfirm: closeModal, title });

    // --- GAMEPLAY ACTIONS ---

    const handleMaintain = (index) => {
        const salvageGain = Math.floor(Math.random() * 3) + 1;
        // DIRECT STORE UPDATE
        updateData(prev => ({ salvage: (prev.salvage || 0) + salvageGain }));
        showMessage(`Maintained plot ${index + 1}! Gained ${salvageGain} Salvage.`, "Maintenance Complete");
    };

    const expandGrid = (item) => {
        const nextExpansionTier = EXPANSION_TIERS.find(t => t.size === gridDimension + 1);
        if (!nextExpansionTier) return;
        
        // DIRECT STORE UPDATE
        updateData(prev => ({ discipline: prev.discipline - nextExpansionTier.cost }));

        const newDim = nextExpansionTier.size;
        const newGrid = new Array(newDim * newDim).fill(null);
        
        // Copy old grid to new grid (top-left alignment)
        for(let oldIndex = 0; oldIndex < grid.length; oldIndex++) {
            const row = Math.floor(oldIndex / gridDimension); 
            const col = oldIndex % gridDimension; 
            const newIndex = (row * newDim) + col;
            if (newIndex < newGrid.length) newGrid[newIndex] = grid[oldIndex];
        }
        setGrid(newGrid);
        setGridDimension(newDim);
        showMessage(`Estate expanded to ${newDim}x${newDim} successfully.`, "Expansion Complete");
    };

    const handleSelectShopItem = (item) => {
        if (discipline < item.cost) { showMessage("Insufficient Brain Matter!", "Transaction Failed"); return; }
        
        if (item.isExpansion) {
            expandGrid(item);
        } else if (item.category === 'Build' || item.category === 'Deeds') {
            setPendingBuildItem(item);
            setShopOpen(false); // Auto close shop to place item
        }
    };

    const buyPlot = (index) => {
        if (discipline < PLOT_COST) { showMessage("Insufficient Brain Matter!", "Failed"); return; }
        
        // DIRECT STORE UPDATE
        updateData(prev => ({ discipline: prev.discipline - PLOT_COST }));

        const newGrid = [...grid];
        newGrid[index] = { type: 'empty', links: [] }; 
        setGrid(newGrid);
        setPendingBuildItem(null);
        showMessage("Plot claimed successfully!", "Land Acquired");
    };

    const finalizeBuild = (index, item) => {
        let currentItem = grid[index] || { type: 'empty', sqft: 0, links: [], builtItems: [] };
        let currentUsedSF = currentItem.sqft || 0; 
        const newTotalSF = currentUsedSF + (item.sqft || 0);
        
        if (newTotalSF > PLOT_SQUARE_FOOTAGE) { 
            showMessage(`Item footprint (${item.sqft} SF) exceeds remaining plot capacity.`, "Construction Failed"); 
            return; 
        }

        // DIRECT STORE UPDATE
        updateData(prev => ({ discipline: prev.discipline - item.cost }));

        const newGrid = [...grid];
        const newItemInstance = { ...item, runtimeId: Date.now() + Math.random() };
        newGrid[index] = { 
            type: 'built', 
            sqft: newTotalSF, 
            links: currentItem.links || [], 
            builtAt: currentItem.builtAt || Date.now(), 
            builtItems: [...(currentItem.builtItems || []), newItemInstance], 
        };
        setGrid(newGrid);
        setPendingBuildItem(null);
        setSelectedSlot(null);
        showMessage(`${item.name} placed!`, "Construction Complete");
    };

    const handleSlotInteraction = (index) => {
        const plot = grid[index];
        
        // 1. BUYING A PLOT
        if (plot === null) { 
            if (pendingBuildItem?.isDeed) buyPlot(index);
            else showMessage("You need a Land Deed to claim this plot.", "Locked Sector");
        } 
        // 2. BUILDING ON EMPTY PLOT
        else if (plot.type === 'empty') { 
            if (pendingBuildItem && !pendingBuildItem.isDeed) finalizeBuild(index, pendingBuildItem);
        } 
        // 3. ADDING TO EXISTING BUILDING OR EDITING
        else if (plot.type === 'built') {
            if (pendingBuildItem && !pendingBuildItem.isDeed) finalizeBuild(index, pendingBuildItem);
            else setPlotContentEditData({ plotIndex: index, plot });
        }
    };

    const removeModuleFromPlot = (plotIndex, itemRuntimeId) => {
        setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            const plot = { ...newGrid[plotIndex] };
            if (!plot || !plot.builtItems) return prevGrid;
            
            const itemToRemove = plot.builtItems.find(item => item.runtimeId === itemRuntimeId);
            if (!itemToRemove) return prevGrid;
            
            plot.builtItems = plot.builtItems.filter(item => item.runtimeId !== itemRuntimeId);
            plot.sqft = plot.builtItems.reduce((sum, item) => sum + (item.sqft || 0), 0);
            
            if (plot.sqft === 0) newGrid[plotIndex] = { type: 'empty', links: plot.links };
            else newGrid[plotIndex] = plot;
            
            setPlotContentEditData({ plotIndex, plot: newGrid[plotIndex] });
            return newGrid;
        });
    };

    // --- RENDER HELPERS ---
    const unifiedShopItems = useMemo(() => {
        let items = shopItems;
        const nextExpansionTier = EXPANSION_TIERS.find(t => t.size === gridDimension + 1);

        if (shopTab === 'build') items = items.filter(i => i.category === 'Build');
        else if (shopTab === 'deeds') items = items.filter(i => i.category === 'Deeds');
        else if (shopTab === 'expansion') items = nextExpansionTier ? [{ id: 'blueprint_expansion', name: `Expand to ${nextExpansionTier.size}x${nextExpansionTier.size}`, cost: nextExpansionTier.cost, icon: 'Maximize', desc: nextExpansionTier.desc, type: 'Special', isExpansion: true, priority: 0, category: 'Expansion' }] : [];
        else items = [];
        
        return items.sort((a, b) => (a.cost || 0) - (b.cost || 0));
    }, [gridDimension, shopTab, shopItems]);

    return (
        <div className="h-full flex flex-col bg-[#0f1219] text-white font-sans overflow-hidden">
            {/* Header */}
            <header className="header-bar shrink-0 p-4 flex justify-between items-center bg-[#1a1a1a] border-b border-slate-700 z-50">
                <div className="flex items-center gap-2">
                    <RenderIcon name="Home" className="text-blue-500" size={24}/>
                    <h1 className="text-xl font-bold">Estate <span className='text-slate-400 text-sm'>Management</span></h1>
                </div>
                <div className="flex items-center gap-4 bg-black/30 px-4 py-2 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2"><RenderIcon name="Brain" size={16} className="text-pink-400"/><span className="font-mono text-emerald-400 font-bold">{discipline.toLocaleString()} BM</span></div>
                    <div className="flex items-center gap-2"><RenderIcon name="Wrench" size={16} className="text-slate-400"/><span className="font-mono text-slate-300">{salvage} Salvage</span></div>
                </div>
            </header>

            <div id="canvas-wrapper" className="flex-1 flex overflow-hidden relative" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsPanning(false)} onMouseLeave={() => setIsPanning(false)} onWheel={handleWheel}>
                {/* Main Canvas */}
                <div className={`w-full h-full bg-[#1a202c] relative overflow-hidden flex flex-col transition-colors duration-300 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} id="blueprint-canvas">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#404e6d 1px, transparent 1px), linear-gradient(90deg, #404e6d 1px, transparent 1px)', backgroundSize: '10px 10px', transform: `translate(${panOffset.x % 10}px, ${panOffset.y % 10}px)` }}></div>
                    
                    {/* Controls Overlay */}
                    <div className="absolute top-6 left-6 z-20 pointer-events-none">
                        <div className="pointer-events-auto">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-md"><RenderIcon name="Layout" className="text-blue-400"/> Blueprint</h2>
                            {pendingBuildItem && <span className="text-amber-400 text-sm font-bold bg-black/60 px-2 py-1 rounded flex items-center gap-2 mt-1 animate-pulse border border-amber-500/50"><RenderIcon name="Hammer" size={12}/> Place {pendingBuildItem.name}</span>}
                        </div>
                    </div>
                    
                    <div className="absolute top-6 right-6 z-20 pointer-events-auto flex gap-2">
                        <button onClick={() => setZoomLevel(1.0)} className="p-2 bg-black/60 border border-slate-600 rounded hover:bg-slate-700 font-mono text-xs text-white">{(zoomLevel*100).toFixed(0)}%</button>
                    </div>

                    {/* Grid Container */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none grid-container">
                        <div className="pointer-events-auto transition-transform duration-75 ease-out origin-center" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})` }}>
                            <div className="grid gap-0 bg-black/20 rounded-md border-4 border-slate-700 shadow-2xl p-4" style={{ gridTemplateColumns: `repeat(${gridDimension}, minmax(0, 1fr))`, width: '500px', aspectRatio: '1/1', }}>
                                {grid.map((plot, i) => (
                                    <GridSlot key={i} index={i} state={plot} isSelected={selectedSlot === i} pendingItem={pendingBuildItem} onInteract={handleSlotInteraction} onDemolish={(idx) => setPlotContentEditData({ plotIndex: idx, plot: grid[idx] })} gridDim={gridDimension} onMaintain={handleMaintain} links={plot ? plot.links : []} onLink={() => {}} onDragStart={() => {}} onDrop={() => {}} />
                                ))}
                            </div>
                            
                            {/* Market Toggle Button (Floating) */}
                            <div onClick={() => setShopOpen(!isShopOpen)} className={`absolute -right-40 top-0 w-32 h-32 bg-slate-800 border-4 ${isShopOpen ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'border-slate-600 shadow-xl'} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all group pointer-events-auto`}>
                                <RenderIcon name="Shop" size={40} className={`${isShopOpen ? 'text-amber-400' : 'text-slate-400'} mb-2`} />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Market</span>
                                <div className="mt-2 text-[8px] bg-black/50 px-2 py-0.5 rounded text-emerald-400">OPEN</div>
                            </div>
                        </div>
                    </div>

                    {pendingBuildItem && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                            <button onClick={() => setPendingBuildItem(null)} className="px-6 py-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full border border-slate-600 shadow-2xl font-bold flex items-center gap-2 backdrop-blur-md">
                                <RenderIcon name="X" size={16} /> Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className={`shop-sidebar absolute top-0 right-0 bottom-0 z-30 flex flex-col bg-[#1e1e1e] border-l border-slate-700 shadow-2xl transition-all duration-300 w-[400px] ${isShopOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-4 border-b border-slate-700 bg-[#131313] flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2"><RenderIcon name="Shop" className="text-amber-500"/> Agency Market</h3>
                            <button onClick={() => setShopOpen(false)} className="text-slate-400 hover:text-white"><RenderIcon name="PanelRightClose"/></button>
                        </div>
                        <div className="flex bg-black/30 p-1 rounded-lg">
                            <button className={`flex-1 py-1.5 text-xs font-bold rounded-md bg-slate-700 text-white`}>Catalog</button>
                        </div>
                        
                        <div className="flex gap-1 overflow-x-auto pb-1">
                            <button onClick={() => setShopTab('build')} className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${shopTab === 'build' ? 'bg-blue-900/50 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>Build (Rooms)</button>
                            <button onClick={() => setShopTab('deeds')} className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${shopTab === 'deeds' ? 'bg-orange-900/50 border-orange-500 text-orange-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>Deeds (Land)</button>
                            <button onClick={() => setShopTab('expansion')} className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${shopTab === 'expansion' ? 'bg-amber-900/50 border-amber-500 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>Expansion</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {unifiedShopItems.map(item => {
                            const itemColors = getItemColor(item.category === 'Deeds' ? 'Deed' : 'Build'); 
                            const actionDisabled = discipline < item.cost || (item.isExpansion && gridDimension >= MAX_GRID_DIMENSION);
                            
                            return (
                                <div key={item.id} className={`flex items-center p-3 rounded-xl border transition-all shadow-md bg-slate-900/50 ${itemColors.border} group select-none`}>
                                    <div className={`p-2 rounded-lg ${itemColors.text} ${itemColors.bg} mr-3 border ${itemColors.border}`}><RenderIcon name={item.icon} size={18}/></div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="text-sm font-bold text-white truncate">{item.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{item.desc}</div>
                                        {item.sqft && <div className="text-[10px] text-emerald-500 font-mono mt-0.5">{item.sqft.toLocaleString()} sq ft</div>}
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-[11px] font-mono font-bold ${actionDisabled ? 'text-slate-500' : itemColors.text}`}>{item.cost.toLocaleString()} BM</span>
                                        <button onClick={() => handleSelectShopItem(item)} disabled={actionDisabled} className={`mt-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${actionDisabled ? 'bg-slate-700 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                                            {item.isExpansion ? 'Expand' : item.isDeed ? 'Buy' : 'Select'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <CustomModal modal={modal} closeModal={closeModal} />
            {plotContentEditData && <ItemEditModal plotIndex={plotContentEditData.plotIndex} plot={plotContentEditData.plot} onClose={() => setPlotContentEditData(null)} onRemoveItem={removeModuleFromPlot} />}
        </div>
    );
};

export default EstatePrototype;