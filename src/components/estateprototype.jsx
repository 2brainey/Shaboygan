import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { 
    Zap, Droplet, DollarSign, AlertTriangle, RotateCcw,
    Layout, Plus, Maximize, PanelRightClose, X, Bed, Home, Lock, Map, ShoppingBag, Database, Sun, UtilityPole, TreePine, Warehouse, Wrench, Users, Package, Settings, Edit3, Save, CheckCircle
} from 'lucide-react';

// --- ESTATE CONSTANTS ---
const TICK_RATE_MS = 1000;
const PLOT_SQUARE_FOOTAGE = 21780; // 0.5 Acres
const PLOT_COST_CAPITAL = 75000; 
const LOCAL_STORAGE_KEY = 'shaboygan_estate_planner_v2'; // Bumped version for new dynamic catalog
const PEAK_CAPACITY_TARGET = 50;
const STORAGE_PER_PERSON_PER_DAY = 0.11; // cubic feet

// --- DEFAULT CATALOG (Loaded on first boot, editable thereafter) ---
const DEFAULT_CATALOG = [
    // Habitation
    { id: 'hub', name: 'Generational Hub', iconName: 'Home', category: 'Habitation', sqft: 8500, cost: 1200000, beds: 16, prod: { storage: 300, labor_cap: 5 }, cons: { power: 40, water: 800, waste: 800, labor: 25 }, color: 'text-amber-400', bgColor: 'bg-amber-900/40', desc: 'Central anchor structure.' },
    { id: 'cabin', name: 'Family Cabin', iconName: 'BedDouble', category: 'Habitation', sqft: 1200, cost: 150000, beds: 4, prod: { storage: 20 }, cons: { power: 6, water: 200, waste: 200, labor: 5 }, color: 'text-blue-400', bgColor: 'bg-blue-900/40', desc: 'Private 2-bedroom quarters.' },
    { id: 'bunkhouse', name: 'Bunkhouse', iconName: 'Bunkbed', category: 'Habitation', sqft: 3000, cost: 250000, beds: 12, cons: { power: 15, water: 400, labor: 12 }, color: 'text-blue-300', bgColor: 'bg-blue-900/40', desc: 'High density temporary housing.' },
    { id: 'library', name: 'Library', iconName: 'BookOpen', category: 'Habitation', sqft: 2500, cost: 300000, cons: { power: 12, water: 50, labor: 5 }, color: 'text-indigo-400', bgColor: 'bg-indigo-900/40', desc: 'Quiet study and learning.' },
    { id: 'chef_kit', name: "Chef's Kitchen", iconName: 'ChefHat', category: 'Habitation', sqft: 2000, cost: 350000, cons: { power: 80, water: 400, labor: 20 }, color: 'text-orange-400', bgColor: 'bg-orange-900/40', desc: 'High-output communal dining.' },
    { id: 'simp_kit', name: 'Simple Kitchen', iconName: 'Utensils', category: 'Habitation', sqft: 500, cost: 65000, cons: { power: 15, water: 100, labor: 4 }, color: 'text-orange-300', bgColor: 'bg-orange-900/40', desc: 'Auxiliary/Guest cooking.' },
    // Logistics
    { id: 'warehouse', name: 'Supply Warehouse', iconName: 'Warehouse', category: 'Logistics', sqft: 3000, cost: 120000, prod: { storage: 600 }, cons: { power: 2, labor: 2 }, color: 'text-slate-400', bgColor: 'bg-slate-800/40', desc: 'Dry storage supply chain.' },
    { id: 'cold_vault', name: 'Cold Storage Vault', iconName: 'Snowflake', category: 'Logistics', sqft: 800, cost: 180000, prod: { storage: 400 }, cons: { power: 25, labor: 4 }, color: 'text-cyan-200', bgColor: 'bg-cyan-900/40', desc: 'Walk-in freezer/fridge.' },
    { id: 'maint_shop', name: 'Maintenance Shop', iconName: 'Wrench', category: 'Logistics', sqft: 2000, cost: 95000, prod: { labor_cap: 30 }, cons: { power: 10, water: 50 }, color: 'text-zinc-400', bgColor: 'bg-zinc-800/40', desc: 'Tools and equipment for full estate maintenance.' },
    { id: 'laundry', name: 'Communal Laundry', iconName: 'Shirt', category: 'Logistics', sqft: 800, cost: 55000, cons: { power: 15, water: 300, labor: 10 }, color: 'text-blue-200', bgColor: 'bg-blue-900/40', desc: '50-Person hygiene capacity.' },
    { id: 'garage', name: 'Garage', iconName: 'Car', category: 'Logistics', sqft: 1500, cost: 85000, cons: { power: 5, labor: 2 }, color: 'text-slate-500', bgColor: 'bg-slate-800/40', desc: 'Vehicle storage.' },
    { id: 'fuel_depot', name: 'Fuel Depot', iconName: 'Fuel', category: 'Logistics', sqft: 400, cost: 40000, cons: { labor: 1 }, color: 'text-red-500', bgColor: 'bg-red-950/40', desc: '2000 gal energy backup.' },
    { id: 'shed', name: 'Shed', iconName: 'Box', category: 'Logistics', sqft: 250, cost: 8000, cons: { labor: 0.5 }, color: 'text-amber-700', bgColor: 'bg-amber-950/40', desc: 'Garden storage.' },
    { id: 'road', name: 'Paved Road (100ft)', iconName: 'Route', category: 'Logistics', sqft: 2000, cost: 15000, cons: { labor: 0.5 }, color: 'text-gray-400', bgColor: 'bg-gray-900/40', desc: 'Transit infrastructure.' },
    // Education & Productivity
    { id: 'learning_ctr', name: 'Learning Center', iconName: 'GraduationCap', category: 'Productivity', sqft: 3500, cost: 400000, cons: { power: 20, water: 100, labor: 8 }, color: 'text-purple-400', bgColor: 'bg-purple-900/40', desc: 'Schooling/Meeting space.' },
    { id: 'maker_space', name: 'Maker Space', iconName: 'Hammer', category: 'Productivity', sqft: 2000, cost: 220000, cons: { power: 35, water: 50, labor: 15 }, color: 'text-orange-500', bgColor: 'bg-orange-950/40', desc: 'Wood/Metal fabrication.' },
    { id: 'media_lab', name: 'Media/Tech Lab', iconName: 'Monitor', category: 'Productivity', sqft: 1200, cost: 180000, cons: { power: 45, labor: 6 }, color: 'text-blue-500', bgColor: 'bg-blue-950/40', desc: 'Servers and digital creation.' },
    // Agriculture
    { id: 'greenhouse', name: 'Greenhouse', iconName: 'Leaf', category: 'Agriculture', sqft: 3000, cost: 180000, cons: { power: 10, water: 500, labor: 12 }, color: 'text-emerald-400', bgColor: 'bg-emerald-900/40', desc: 'Year-round produce.' },
    { id: 'farm_animals', name: 'Farm Animals', iconName: 'Tractor', category: 'Agriculture', sqft: 18000, cost: 140000, cons: { power: 2, water: 1200, labor: 28 }, color: 'text-amber-600', bgColor: 'bg-amber-950/40', desc: 'Livestock and coops.' },
    { id: 'orchard', name: 'Orchard', iconName: 'Trees', category: 'Agriculture', sqft: 21780, cost: 60000, cons: { water: 800, labor: 10 }, color: 'text-green-500', bgColor: 'bg-green-950/40', desc: 'Fruit/Nut trees (0.5 Ac).' },
    { id: 'compost', name: 'Compost Center', iconName: 'Recycle', category: 'Agriculture', sqft: 600, cost: 12000, cons: { water: 10, labor: 5 }, color: 'text-lime-500', bgColor: 'bg-lime-950/40', desc: 'Waste to fertilizer.' },
    // Recreation & Wellness
    { id: 'clinic', name: 'Wellness Clinic', iconName: 'HeartPulse', category: 'Recreation', sqft: 1500, cost: 280000, cons: { power: 15, water: 150, labor: 10 }, color: 'text-red-400', bgColor: 'bg-red-900/40', desc: 'First Aid/Basic Medical.' },
    { id: 'gym', name: 'Gymnasium', iconName: 'Dumbbell', category: 'Recreation', sqft: 12000, cost: 1500000, cons: { power: 60, water: 200, labor: 15 }, color: 'text-cyan-400', bgColor: 'bg-cyan-900/40', desc: 'Indoor multi-sport.' },
    { id: 'fitness', name: 'Fitness Center', iconName: 'Activity', category: 'Recreation', sqft: 3500, cost: 450000, cons: { power: 25, water: 150, labor: 8 }, color: 'text-cyan-300', bgColor: 'bg-cyan-950/40', desc: 'Weight room/Yoga.' },
    { id: 'rec_area', name: 'Recreational Area', iconName: 'TreePine', category: 'Recreation', sqft: 10000, cost: 50000, cons: { water: 20, labor: 4 }, color: 'text-emerald-500', bgColor: 'bg-emerald-950/40', desc: 'Open park/Play.' },
    { id: 'bball', name: 'Basketball Court', iconName: 'CircleDot', category: 'Recreation', sqft: 5000, cost: 80000, cons: { power: 2, labor: 2 }, color: 'text-orange-500', bgColor: 'bg-orange-950/40', desc: 'Full hardtop court.' },
    { id: 'baseball', name: 'Baseball Diamond', iconName: 'Diamond', category: 'Recreation', sqft: 21500, cost: 220000, cons: { power: 15, water: 600, labor: 14 }, color: 'text-stone-400', bgColor: 'bg-stone-900/40', desc: 'Community field.' },
    { id: 'out_kit', name: 'Outdoor Kitchen', iconName: 'Flame', category: 'Recreation', sqft: 800, cost: 110000, cons: { power: 10, water: 100, labor: 5 }, color: 'text-orange-400', bgColor: 'bg-orange-950/40', desc: 'BBQ / Social Dining.' },
    { id: 'firepit', name: 'Outdoor Fire Pit', iconName: 'Tent', category: 'Recreation', sqft: 600, cost: 18000, cons: { labor: 2 }, color: 'text-red-500', bgColor: 'bg-red-950/40', desc: 'Social Gathering.' },
    { id: 'garden', name: 'Reflection Garden', iconName: 'Flower2', category: 'Recreation', sqft: 2000, cost: 35000, cons: { water: 100, labor: 3 }, color: 'text-pink-400', bgColor: 'bg-pink-950/40', desc: 'Quiet park/gazebo.' },
    // Security & Infrastructure
    { id: 'gatehouse', name: 'Gatehouse', iconName: 'Shield', category: 'Security', sqft: 400, cost: 45000, cons: { power: 2, water: 20, labor: 5 }, color: 'text-slate-300', bgColor: 'bg-slate-800/40', desc: 'Access control.' },
    { id: 'fence', name: 'Perimeter Fencing', iconName: 'Fence', category: 'Security', sqft: 0, cost: 120000, cons: { labor: 1 }, color: 'text-slate-500', bgColor: 'bg-slate-900/40', desc: 'Boundaries/Security.' },
    { id: 'solar', name: 'Utility Solar (40kW)', iconName: 'Sun', category: 'Utility', sqft: 4500, cost: 110000, prod: { power: 40 }, cons: { labor: 2 }, color: 'text-yellow-400', bgColor: 'bg-yellow-900/40', desc: 'Photovoltaic array.' },
    { id: 'battery', name: 'Battery Storage', iconName: 'BatteryCharging', category: 'Utility', sqft: 500, cost: 120000, cons: { power: 1, labor: 1 }, color: 'text-green-400', bgColor: 'bg-green-950/40', desc: 'Stores 500kWh.' },
    { id: 'well', name: 'High-Yield Well', iconName: 'Droplets', category: 'Utility', sqft: 200, cost: 45000, prod: { water: 3000 }, cons: { power: 5, labor: 3 }, color: 'text-cyan-400', bgColor: 'bg-cyan-900/40', desc: 'Heavy-duty tap.' },
    { id: 'rain', name: 'Rain Cistern', iconName: 'CloudRain', category: 'Utility', sqft: 600, cost: 35000, prod: { water: 500 }, cons: { power: 1, labor: 2 }, color: 'text-cyan-300', bgColor: 'bg-cyan-950/40', desc: 'Passive water catchment.' },
    { id: 'septic', name: 'Advanced Septic', iconName: 'Database', category: 'Utility', sqft: 8000, cost: 75000, prod: { waste_cap: 4000 }, cons: { labor: 2 }, color: 'text-emerald-400', bgColor: 'bg-emerald-900/40', desc: 'Handles 50+ surge loads.' },
    { id: 'wifi', name: 'Mesh Data Tower', iconName: 'Wifi', category: 'Utility', sqft: 100, cost: 12000, cons: { power: 1, labor: 0.5 }, color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', desc: 'Network connectivity.' }
];

const EXPANSION_TIERS = [
    { size: 3, cost: 0, desc: 'Initial Grant' },
    { size: 4, cost: 600000, desc: 'Subdivision Acquisition' },
    { size: 5, cost: 1200000, desc: 'Regional Land Buyout' },
    { size: 6, cost: 2500000, desc: 'Commercial Rezoning' }
];

const INITIAL_RESOURCES = {
    capital: 3500000, 
    power_used: 0, power_cap: 0,
    water_used: 0, water_cap: 0,
    waste_used: 0, waste_cap: 0,
    beds_total: 0, storage_total: 0,
    labor_used: 0, labor_cap: 0,
    active_pop: 5 
};

// --- HELPER: Render Dynamic Icon ---
const RenderIcon = ({ name, className, size = 20 }) => {
    const IconComponent = Icons[name] || Icons.Box;
    return <IconComponent size={size} className={className} />;
};

// --- COMPONENT: Developer Catalog Editor Modal ---
const CatalogEditorModal = ({ onClose, onSave, itemToEdit }) => {
    const [formData, setFormData] = useState(itemToEdit || {
        id: `custom_${Date.now()}`, name: 'New Structure', iconName: 'Box', category: 'Habitation', sqft: 1000, cost: 50000, beds: 0, desc: 'Custom developer structure.',
        prod: { storage: 0, labor_cap: 0, power: 0, water: 0, waste_cap: 0 },
        cons: { power: 0, water: 0, waste: 0, labor: 0 },
        color: 'text-white', bgColor: 'bg-slate-800'
    });

    const handleChange = (field, val, subfield = null) => {
        if(subfield) {
            setFormData(prev => ({ ...prev, [field]: { ...prev[field], [subfield]: Number(val) }}));
        } else {
            setFormData(prev => ({ ...prev, [field]: val }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
            <div className="bg-[#12161f] p-6 rounded-2xl border border-indigo-500/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} className="text-indigo-400"/> Developer Catalog Editor</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Name</label>
                        <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Category</label>
                        <select value={formData.category} onChange={e => handleChange('category', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm">
                            <option value="Habitation">Habitation</option><option value="Logistics">Logistics</option>
                            <option value="Productivity">Productivity</option><option value="Agriculture">Agriculture</option>
                            <option value="Recreation">Recreation</option><option value="Security">Security</option><option value="Utility">Utility</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Cost (Capital)</label>
                        <input type="number" value={formData.cost} onChange={e => handleChange('cost', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Footprint (SqFt)</label>
                        <input type="number" value={formData.sqft} onChange={e => handleChange('sqft', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Lucide Icon Name</label>
                        <div className="flex gap-2">
                            <div className="bg-slate-800 p-2 rounded flex items-center justify-center border border-slate-700 w-10"><RenderIcon name={formData.iconName} size={16} className="text-white"/></div>
                            <input type="text" value={formData.iconName} onChange={e => handleChange('iconName', e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" placeholder="e.g. Home, Sun, Box" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Beds Capacity</label>
                        <input type="number" value={formData.beds} onChange={e => handleChange('beds', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Description</label>
                        <input type="text" value={formData.desc} onChange={e => handleChange('desc', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/50">
                        <h4 className="text-xs font-bold text-emerald-500 uppercase mb-3">Production (Provides)</h4>
                        <div className="space-y-2">
                            {['power', 'water', 'waste_cap', 'storage', 'labor_cap'].map(key => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">{key.replace('_', ' ')}</span>
                                    <input type="number" value={formData.prod[key]} onChange={e => handleChange('prod', e.target.value, key)} className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-white text-xs text-right" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/50">
                        <h4 className="text-xs font-bold text-red-500 uppercase mb-3">Consumption (Requires)</h4>
                        <div className="space-y-2">
                            {['power', 'water', 'waste', 'labor'].map(key => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">{key}</span>
                                    <input type="number" value={formData.cons[key]} onChange={e => handleChange('cons', e.target.value, key)} className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-white text-xs text-right" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"><Save size={16}/> Save to Catalog</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: Lot Management Modal ---
const ItemEditModal = ({ plotIndex, plot, onClose, onRemoveItem, onRenamePlot }) => {
    const currentUsedSF = plot.sqft || 0;
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(plot.name || `Lot ${plotIndex + 1}`);

    const handleSaveName = () => {
        onRenamePlot(plotIndex, tempName);
        setIsEditingName(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-slate-600 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                    {isEditingName ? (
                        <div className="flex gap-2 items-center flex-1 mr-4">
                            <input autoFocus type="text" value={tempName} onChange={e=>setTempName(e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white flex-1" />
                            <button onClick={handleSaveName} className="text-emerald-400 hover:text-emerald-300 p-1"><CheckCircle size={18}/></button>
                        </div>
                    ) : (
                        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2 cursor-pointer hover:text-white group" onClick={() => setIsEditingName(true)}>
                            {plot.name || `Lot ${plotIndex + 1}`} <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-slate-500"/>
                        </h3>
                    )}
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18}/></button>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between text-xs font-mono bg-slate-800/50 p-2 rounded border border-slate-700">
                        <span className="text-slate-400">Land Used:</span>
                        <span className="text-white">{currentUsedSF.toLocaleString()} / {PLOT_SQUARE_FOOTAGE.toLocaleString()} sq ft</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        {plot.builtItems.map((item) => (
                            <div key={item.runtimeId} className={`flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border ${item.borderColor || 'border-slate-600'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${item.bgColor || 'bg-slate-800'} ${item.color || 'text-white'}`}><RenderIcon name={item.iconName} size={20} /></div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{item.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase">Beds: {item.beds || 0} | SqFt: {item.sqft}</div>
                                    </div>
                                </div>
                                <button onClick={() => onRemoveItem(plotIndex, item.runtimeId)} className="text-red-400 p-2 hover:bg-red-900/30 rounded-lg transition-colors border border-red-900/30" title="Demolish (50% Cost Recovery)"><RotateCcw size={16}/></button>
                            </div>
                        ))}
                        {plot.builtItems.length === 0 && <div className="text-center py-6 text-slate-500 text-sm font-mono border border-dashed border-slate-700 rounded-lg">No structures built.</div>}
                    </div>
                </div>
                <div className="flex justify-end mt-6"><button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors">Close</button></div>
            </div>
        </div>
    );
};

export default function EstatePrototype() {
    // --- STATE INITIALIZATION & PERSISTENCE ---
    const [resources, setResources] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? { ...INITIAL_RESOURCES, ...JSON.parse(saved).resources } : INITIAL_RESOURCES;
    });
    const [gridDimension, setGridDimension] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved).gridDimension : 3;
    });
    const [grid, setGrid] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved && JSON.parse(saved).grid) return JSON.parse(saved).grid;
        const initial = new Array(9).fill(null);
        initial[4] = { type: 'empty', sqft: 0, builtItems: [], name: 'Central Hub' }; 
        return initial;
    });
    const [catalog, setCatalog] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return (saved && JSON.parse(saved).catalog) ? JSON.parse(saved).catalog : DEFAULT_CATALOG;
    });

    const [starvedModules, setStarvedModules] = useState(new Set());
    const [pendingBuildItem, setPendingBuildItem] = useState(null);
    const [isShopOpen, setShopOpen] = useState(false);
    const [shopCategory, setShopCategory] = useState('All');
    const [isDevMode, setIsDevMode] = useState(false);
    const [editorItem, setEditorItem] = useState(null);
    
    // Canvas State
    const [zoomLevel, setZoomLevel] = useState(0.8);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [plotContentEditData, setPlotContentEditData] = useState(null);
    const [notification, setNotification] = useState(null);
    const [hoveredLotIndex, setHoveredLotIndex] = useState(null);

    const showNotification = useCallback((msg, duration = 3000) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), duration);
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ resources, gridDimension, grid, catalog }));
    }, [resources, gridDimension, grid, catalog]);

    // --- LOGISTICS ENGINE ---
    useEffect(() => {
        const tick = setInterval(() => {
            let p_cap = 0, p_used = 0, w_cap = 0, w_used = 0, s_cap = 0, s_used = 0;
            let beds = 0, storage = 0, labor_req = 0, labor_cap = 0;
            const newStarved = new Set();

            grid.forEach(plot => {
                if (plot?.type === 'built') {
                    plot.builtItems.forEach(item => {
                        p_cap += item.prod?.power || 0;
                        w_cap += item.prod?.water || 0;
                        s_cap += item.prod?.waste_cap || 0;
                        storage += item.prod?.storage || 0;
                        labor_cap += item.prod?.labor_cap || 0;
                        beds += item.beds || 0;
                    });
                }
            });

            grid.forEach(plot => {
                if (plot?.type === 'built') {
                    plot.builtItems.forEach(item => {
                        const needP = item.cons?.power || 0;
                        const needW = item.cons?.water || 0;
                        const needS = item.cons?.waste || 0;
                        const needL = item.cons?.labor || 0;

                        if ((needP > 0 && p_used + needP > p_cap) || 
                            (needW > 0 && w_used + needW > w_cap) || 
                            (needS > 0 && s_used + needS > s_cap)) {
                            newStarved.add(item.runtimeId);
                        } else {
                            p_used += needP; w_used += needW; s_used += needS; labor_req += needL;
                        }
                    });
                }
            });

            setStarvedModules(newStarved);
            setResources(prev => ({ 
                ...prev, power_cap: p_cap, power_used: p_used, water_cap: w_cap, water_used: w_used, waste_cap: s_cap, waste_used: s_used,
                beds_total: beds, storage_total: storage, labor_used: labor_req, labor_cap: labor_cap
            }));
        }, TICK_RATE_MS);
        return () => clearInterval(tick);
    }, [grid]);

    // --- INTERACTIONS ---
    const handleSlotClick = (index) => {
        const plot = grid[index];
        if (plot === null) {
            if (pendingBuildItem?.id === 'deed') {
                if (resources.capital < PLOT_COST_CAPITAL) return showNotification("Budget Exceeded");
                setResources(p => ({ ...p, capital: p.capital - PLOT_COST_CAPITAL }));
                const newGrid = [...grid];
                newGrid[index] = { type: 'empty', sqft: 0, builtItems: [], name: `Lot ${index + 1}` };
                setGrid(newGrid);
                // Continuous build mode: don't nullify pending item unless user cancels
            } else showNotification("Select Zoning Permit to expand boundaries");
            return;
        }
        if (pendingBuildItem && pendingBuildItem.id !== 'deed') {
            if (resources.capital < pendingBuildItem.cost) return showNotification("Insufficient Capital");
            const newTotalSF = (plot.sqft || 0) + pendingBuildItem.sqft;
            if (newTotalSF > PLOT_SQUARE_FOOTAGE) return showNotification("Lot Density Limit Reached");
            setResources(p => ({ ...p, capital: p.capital - pendingBuildItem.cost }));
            const newGrid = [...grid];
            newGrid[index] = { ...plot, type: 'built', sqft: newTotalSF, builtItems: [...plot.builtItems, { ...pendingBuildItem, runtimeId: Date.now() + Math.random() }] };
            setGrid(newGrid);
            // Continuous Build: Item stays pending.
            return;
        }
        if (plot && !pendingBuildItem) {
            setPlotContentEditData({ plotIndex: index, plot });
        }
    };

    const removeModule = (plotIndex, runtimeId) => {
        setGrid(prev => {
            const newGrid = [...prev];
            const plot = { ...newGrid[plotIndex] };
            const item = plot.builtItems.find(i => i.runtimeId === runtimeId);
            if (item) setResources(r => ({ ...r, capital: r.capital + Math.floor(item.cost * 0.5) }));
            plot.builtItems = plot.builtItems.filter(i => i.runtimeId !== runtimeId);
            plot.sqft = plot.builtItems.reduce((sum, i) => sum + i.sqft, 0);
            if (plot.builtItems.length === 0) plot.type = 'empty';
            newGrid[plotIndex] = plot;
            setPlotContentEditData(curr => curr ? { ...curr, plot: newGrid[plotIndex] } : null);
            return newGrid;
        });
    };

    const handleRenamePlot = (plotIndex, newName) => {
        setGrid(prev => {
            const newGrid = [...prev];
            newGrid[plotIndex] = { ...newGrid[plotIndex], name: newName };
            return newGrid;
        });
    };

    const handleSaveCatalogItem = (newItem) => {
        setCatalog(prev => {
            const exists = prev.findIndex(i => i.id === newItem.id);
            if (exists >= 0) {
                const next = [...prev];
                next[exists] = newItem;
                return next;
            }
            return [newItem, ...prev];
        });
        setEditorItem(null);
        showNotification("Catalog Updated.");
    };

    const handleDeleteCatalogItem = (id, e) => {
        e.stopPropagation();
        if(confirm("Remove this structure from the catalog? Existing ones on map will remain.")) {
            setCatalog(prev => prev.filter(i => i.id !== id));
        }
    };

    // --- RENDER HELPERS ---
    const currentPantryDays = resources.active_pop > 0 ? Math.floor(resources.storage_total / (resources.active_pop * STORAGE_PER_PERSON_PER_DAY)) : 999;
    const nextExpansion = EXPANSION_TIERS.find(t => t.size === gridDimension + 1);
    const uniqueCategories = ['All', ...new Set(catalog.map(c => c.category))];
    const filteredCatalog = shopCategory === 'All' ? catalog : catalog.filter(c => c.category === shopCategory);

    return (
        <div className="h-full w-full flex flex-col bg-[#0b0e14] text-slate-200 overflow-hidden font-sans">
            
            {/* TOP HUD */}
            <div className="bg-[#12161f] border-b border-slate-800 p-4 shrink-0 z-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-950 p-2 rounded-lg border border-amber-500/30"><Home className="text-amber-400" size={20}/></div>
                        <div>
                            <h1 className="text-white font-bold uppercase tracking-tight text-sm">Family Network Hub</h1>
                            <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Developer Prototype OS</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-1 w-48">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                                <span>Active Pop</span>
                                <span className="text-blue-400">{resources.active_pop} People</span>
                            </div>
                            <input type="range" min="1" max="100" step="1" value={resources.active_pop} onChange={(e) => setResources(prev => ({...prev, active_pop: parseInt(e.target.value)}))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800"></div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase text-slate-500 font-bold">Capital</span>
                                <span className="text-emerald-400 font-mono font-bold text-sm">${resources.capital.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase text-slate-500 font-bold">Maint. Loading</span>
                                <span className={`font-mono text-sm ${resources.labor_used > resources.labor_cap ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>{resources.labor_used}/{resources.labor_cap} hr</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-black/20 p-2 rounded border border-slate-800/50">
                        <div className="flex justify-between items-center mb-1"><span className="text-[8px] text-slate-500 uppercase font-bold">Network Capacity</span> <Users size={10} className="text-blue-400"/></div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (resources.beds_total/PEAK_CAPACITY_TARGET)*100)}%` }}></div></div>
                        <div className="text-[9px] mt-1 font-mono text-slate-400">{resources.beds_total}/{PEAK_CAPACITY_TARGET} Peak Beds</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-slate-800/50">
                        <div className="flex justify-between items-center mb-1"><span className="text-[8px] text-slate-500 uppercase font-bold">Supply Runway</span> <Package size={10} className="text-orange-400"/></div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${currentPantryDays >= 90 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, (currentPantryDays/90)*100)}%` }}></div></div>
                        <div className="text-[9px] mt-1 font-mono text-slate-400">{currentPantryDays} Days Capacity</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-slate-800/50">
                        <div className="flex justify-between items-center mb-1"><span className="text-[8px] text-slate-500 uppercase font-bold">Grid Power</span> <Zap size={10} className="text-yellow-400"/></div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${resources.power_used > resources.power_cap ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(100, (resources.power_used/resources.power_cap)*100)}%` }}></div></div>
                        <div className="text-[9px] mt-1 font-mono text-slate-400">{resources.power_used}/{resources.power_cap} kW Available</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-slate-800/50">
                        <div className="flex justify-between items-center mb-1"><span className="text-[8px] text-slate-500 uppercase font-bold">Septic Readiness</span> <Database size={10} className="text-emerald-400"/></div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (resources.waste_used/resources.waste_cap)*100)}%` }}></div></div>
                        <div className="text-[9px] mt-1 font-mono text-slate-400">{resources.waste_used}/{resources.waste_cap} GPD Cap</div>
                    </div>
                </div>
            </div>

            {/* CANVAS AREA */}
            <div className="flex-1 relative bg-[#171a21] overflow-hidden" 
                 id="canvas-container"
                 onMouseDown={(e) => e.target.id === 'canvas-container' && setIsPanning(true)}
                 onMouseMove={(e) => {
                     if (!isPanning) return;
                     setPanOffset(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
                 }}
                 onMouseUp={() => setIsPanning(false)}
                 onWheel={(e) => {
                     if (e.target.closest('.shop-sidebar') || e.target.closest('.modal-overlay')) return;
                     const direction = e.deltaY > 0 ? -0.1 : 0.1;
                     setZoomLevel(prev => Math.min(2.0, Math.max(0.4, parseFloat((prev + direction).toFixed(1)))));
                 }}>
                
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: `${40 * zoomLevel}px ${40 * zoomLevel}px`, backgroundPosition: `${panOffset.x}px ${panOffset.y}px` }}></div>

                {notification && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-800/90 border border-slate-500 text-slate-100 px-6 py-3 rounded-full text-xs font-bold shadow-xl animate-bounce">{notification}</div>}

                {/* Floating "Continuous Build" Cancel Button */}
                {pendingBuildItem && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-indigo-950/90 border border-indigo-500 p-3 rounded-full shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-10">
                        <div className="flex items-center gap-2 px-2 border-r border-indigo-500/50 pr-4">
                            <RenderIcon name={pendingBuildItem.iconName || pendingBuildItem.icon?.name} className="text-indigo-400" size={18}/>
                            <span className="text-white font-bold text-sm">Stamper Mode: {pendingBuildItem.name}</span>
                        </div>
                        <span className="text-xs text-indigo-300 font-mono">Click lots to build</span>
                        <button onClick={() => setPendingBuildItem(null)} className="bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors">Done Building (ESC)</button>
                    </div>
                )}
                
                {/* Global ESC listener for Stamper Mode */}
                {useEffect(() => {
                    const handleEsc = (e) => { if (e.key === 'Escape') setPendingBuildItem(null); };
                    window.addEventListener('keydown', handleEsc);
                    return () => window.removeEventListener('keydown', handleEsc);
                }, [])}

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto origin-center transition-transform duration-75 p-8 bg-[#1a1d24] border-4 border-slate-800 rounded-2xl shadow-2xl"
                         style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, width: `${Math.max(800, gridDimension * 250)}px`, aspectRatio: '1/1' }}>
                        <div className="w-full h-full grid gap-4" style={{ gridTemplateColumns: `repeat(${gridDimension}, 1fr)` }}>
                            {grid.map((plot, i) => {
                                const isHovered = hoveredLotIndex === i;
                                const willFit = pendingBuildItem && plot && plot.type !== 'empty' ? ((plot.sqft || 0) + pendingBuildItem.sqft <= PLOT_SQUARE_FOOTAGE) : true;

                                return (
                                    <button key={i} onClick={() => handleSlotClick(i)} onMouseEnter={() => setHoveredLotIndex(i)} onMouseLeave={() => setHoveredLotIndex(null)}
                                        className={`relative rounded-2xl border-2 transition-all group overflow-hidden ${plot === null ? 'bg-[#1e232b] border-dashed border-slate-700/50 hover:bg-slate-800' : 'bg-[#232936] border-slate-600 hover:border-slate-400 shadow-inner'} ${pendingBuildItem && plot !== null ? (willFit ? 'ring-2 ring-emerald-500/50' : 'ring-2 ring-red-500/50') : ''}`}>
                                        
                                        {/* Hover Indicator for Remaining SqFt */}
                                        {plot && isHovered && pendingBuildItem && pendingBuildItem.id !== 'deed' && (
                                            <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded text-[9px] font-mono font-bold backdrop-blur-md border ${willFit ? 'bg-emerald-900/80 text-emerald-400 border-emerald-500/50' : 'bg-red-900/80 text-red-400 border-red-500/50'}`}>
                                                {PLOT_SQUARE_FOOTAGE - ((plot.sqft || 0) + pendingBuildItem.sqft)} sf left
                                            </div>
                                        )}

                                        {plot && plot.type !== 'empty' && (
                                            <div className="flex flex-wrap content-start gap-2 p-4 w-full h-full">
                                                {plot.builtItems.map(item => (
                                                    <div key={item.runtimeId} className={`p-2 rounded-lg border ${item.borderColor || 'border-slate-600'} ${starvedModules.has(item.runtimeId) ? 'bg-red-900/50 grayscale' : (item.bgColor || 'bg-slate-800')} shadow-lg relative`}>
                                                        <RenderIcon name={item.iconName} size={24} className={starvedModules.has(item.runtimeId) ? 'text-red-400' : (item.color || 'text-white')} />
                                                        {starvedModules.has(item.runtimeId) && <div className="absolute -inset-1 bg-red-500/20 rounded-lg animate-pulse border border-red-500"></div>}
                                                    </div>
                                                ))}
                                                <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono bg-black/60 px-2 py-1 rounded backdrop-blur-sm z-10 truncate max-w-[80%]">{plot.name || `Lot ${i+1}`}</div>
                                            </div>
                                        )}
                                        {plot && plot.type === 'empty' && (
                                            <div className="flex flex-col items-center justify-center text-slate-500 opacity-60 w-full h-full">
                                                <Plus size={24} className="mb-2" />
                                                <span className="text-[10px] font-mono">{plot.name || `Lot ${i+1}`}</span>
                                            </div>
                                        )}
                                        {!plot && <Lock size={24} className="text-slate-600 mx-auto" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <button onClick={() => setShopOpen(true)} className="absolute bottom-8 right-8 bg-emerald-600 p-5 rounded-full text-white shadow-2xl hover:scale-110 transition-all z-40 border-2 border-emerald-400 group">
                    <ShoppingBag size={32} />
                    <span className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/80 px-3 py-1.5 rounded text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">Open Catalog</span>
                </button>
            </div>

            {/* SIDEBAR CATALOG */}
            <div className={`shop-sidebar absolute right-0 top-0 bottom-0 w-[450px] bg-[#1a1d24] border-l border-slate-700 shadow-2xl z-[100] transition-transform duration-300 flex flex-col ${isShopOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#13161c]">
                    <div className="flex flex-col">
                        <h2 className="font-bold flex items-center gap-2 text-lg"><ShoppingBag size={20} className="text-emerald-500" /> Structure Catalog</h2>
                        <button onClick={() => setIsDevMode(!isDevMode)} className={`text-[9px] font-mono text-left mt-1 ${isDevMode ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'} flex items-center gap-1`}><Settings size={10}/> Dev Mode: {isDevMode ? 'ON' : 'OFF'}</button>
                    </div>
                    <button onClick={() => setShopOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><X size={24}/></button>
                </div>

                {/* Filters */}
                <div className="px-4 pt-3 pb-2 border-b border-slate-800 flex overflow-x-auto custom-scrollbar gap-2 shrink-0">
                    {uniqueCategories.map(cat => (
                        <button key={cat} onClick={() => setShopCategory(cat)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${shopCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar pb-32">
                    
                    {isDevMode && (
                        <button onClick={() => setEditorItem(null)} className="w-full p-4 border border-dashed border-indigo-500/50 rounded-xl text-indigo-400 hover:bg-indigo-950/20 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                            <Plus size={18}/> Add Custom Structure
                        </button>
                    )}

                    {shopCategory === 'All' && (
                        <button onClick={() => {setPendingBuildItem({ id: 'deed', name: 'Zoning Permit', iconName: 'Map', sqft: 0 }); setShopOpen(false);}} className="w-full p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-left hover:border-emerald-400 transition-all relative">
                            <div className="flex justify-between items-center mb-1"><span className="font-bold text-white">Zone 0.5 Acre Lot</span><Icons.Map size={18} className="text-emerald-500"/></div>
                            <div className="text-xs text-emerald-500/70 font-mono tracking-tight">${PLOT_COST_CAPITAL.toLocaleString()}</div>
                        </button>
                    )}
                    
                    {shopCategory === 'All' && nextExpansion && (
                         <button onClick={() => expandGrid(nextExpansion)} className="w-full p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl text-left hover:border-indigo-400 transition-all relative">
                             <div className="flex justify-between items-center mb-1"><span className="font-bold text-white">Expand Estate Grid</span><Icons.Maximize size={18} className="text-indigo-500"/></div>
                             <div className="text-xs text-indigo-500/70 font-mono tracking-tight">${nextExpansion.cost.toLocaleString()} • {nextExpansion.desc}</div>
                         </button>
                    )}
                    
                    {filteredCatalog.map(b => (
                        <div key={b.id} className="relative group">
                            <button onClick={() => {setPendingBuildItem(b); setShopOpen(false);}} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-blue-500 transition-all shadow-sm">
                                <div className="flex justify-between items-center mb-2"><span className="font-bold text-white">{b.name}</span><div className={`p-1.5 rounded-lg ${b.bgColor || 'bg-slate-800'}`}><RenderIcon name={b.iconName} size={20} className={b.color || 'text-white'} /></div></div>
                                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{b.desc}</p>
                                <div className="flex flex-wrap gap-2">
                                    <div className="text-[10px] bg-black/40 px-2 py-1 rounded text-emerald-500 font-mono font-bold">${b.cost.toLocaleString()}</div>
                                    <div className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">{b.sqft} sqft</div>
                                    {b.beds > 0 && <div className="text-[10px] bg-blue-900/30 px-2 py-1 rounded text-blue-300 font-mono">{b.beds} Beds</div>}
                                </div>
                            </button>

                            {/* Dev Mode Overlay Actions */}
                            {isDevMode && (
                                <div className="absolute top-2 right-12 hidden group-hover:flex gap-1 z-10">
                                    <button onClick={(e) => { e.stopPropagation(); setEditorItem(b); }} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white shadow-lg"><Edit3 size={14}/></button>
                                    <button onClick={(e) => handleDeleteCatalogItem(b.id, e)} className="p-1.5 bg-red-600 hover:bg-red-500 rounded text-white shadow-lg"><RotateCcw size={14}/></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* MODALS */}
            {plotContentEditData && <ItemEditModal plotIndex={plotContentEditData.plotIndex} plot={plotContentEditData.plot} onClose={() => setPlotContentEditData(null)} onRemoveItem={removeModule} onRenamePlot={handleRenamePlot}/>}
            {editorItem !== null && <CatalogEditorModal itemToEdit={editorItem} onClose={() => setEditorItem(null)} onSave={handleSaveCatalogItem} />}
        </div>
    );
}