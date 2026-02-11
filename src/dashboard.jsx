import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Layout, Hammer, Terminal, 
  Package, Map, ShoppingBag, Server,
  CheckCircle2, Circle, ArrowRight, NotebookPen, 
  AlertCircle, Clock, Archive, GripVertical, Eye, EyeOff,
  Maximize2, Minimize2, RotateCw, Undo2
} from 'lucide-react';
import { useGameStore } from './store/gamestore';
import TodoList from './components/todolist';
import { BackpackWidget, VaultWidget, BinderWidget } from './components/inventorywidgets';

// --- WIDGET REGISTRY ---
// UPDATED: Increased opacity from /50 to /90 and added backdrop-blur
const WIDGET_REGISTRY = {
    // DEV TOOLS (Kept as solid slate-900)
    'uibuilder': { label: 'UI Builder', defaultWidth: 1, component: ({ setActiveTab }) => (
        <div onClick={() => setActiveTab('uibuilder')} className="h-full bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-blue-900/20 rounded-md text-blue-400"><Layout size={20} /></div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">ACTIVE</span>
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-1">UI Builder</h3>
                <p className="text-slate-400 text-xs">Interface construction engine.</p>
            </div>
        </div>
    )},
    'basestation': { label: 'BaseStation', defaultWidth: 1, component: ({ setActiveTab }) => (
        <div onClick={() => setActiveTab('basegame')} className="h-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-900/10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-indigo-900/20 rounded-md text-indigo-400"><Activity size={20} /></div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">ACTIVE</span>
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-1">BaseStation</h3>
                <p className="text-slate-400 text-xs">Resource grid simulation.</p>
            </div>
        </div>
    )},
    // MODULES - UPDATED OPACITY HERE
    'mod_logistics': { label: 'Logistics', defaultWidth: 1, component: ({ setActiveTab }) => (
        <div onClick={() => setActiveTab('logistics')} className="h-full group flex flex-col justify-between bg-slate-900/90 backdrop-blur-sm border border-slate-800 hover:border-purple-500/50 rounded-lg p-4 cursor-pointer transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Map size={20} /></div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
                <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">Logistics Network</h4>
                <p className="text-xs text-slate-500">Nodes: <span className="text-slate-300">Offline</span></p>
            </div>
        </div>
    )},
    'mod_inventory': { label: 'Inventory', defaultWidth: 1, component: ({ setActiveTab, data }) => (
        <div onClick={() => setActiveTab('inventory')} className="h-full group flex flex-col justify-between bg-slate-900/90 backdrop-blur-sm border border-slate-800 hover:border-orange-500/50 rounded-lg p-4 cursor-pointer transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-colors"><Package size={20} /></div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
                <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">Inventory System</h4>
                <p className="text-xs text-slate-500">Items: <span className="text-orange-300">{data?.inventory?.filter(i=>i)?.length || 0}</span></p>
            </div>
        </div>
    )},
    'mod_estate': { label: 'Estate', defaultWidth: 1, component: ({ setActiveTab, data }) => (
        <div onClick={() => setActiveTab('estate')} className="h-full group flex flex-col justify-between bg-slate-900/90 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 rounded-lg p-4 cursor-pointer transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Layout size={20} /></div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Estate Blueprint</h4>
                <p className="text-xs text-slate-500">Grid: <span className="text-blue-300">{data?.estate?.gridDimension || 1}x{data?.estate?.gridDimension || 1}</span></p>
            </div>
        </div>
    )},
    'mod_market': { label: 'Market', defaultWidth: 1, component: ({ setActiveTab, data }) => (
        <div onClick={() => setActiveTab('shop')} className="h-full group flex flex-col justify-between bg-slate-900/90 backdrop-blur-sm border border-slate-800 hover:border-emerald-500/50 rounded-lg p-4 cursor-pointer transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-full text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><ShoppingBag size={20} /></div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Black Market</h4>
                <p className="text-xs text-slate-500">Credits: <span className="text-emerald-300">{(data?.discipline || 0).toLocaleString()}</span></p>
            </div>
        </div>
    )},
    // PROMO (Already has a background image/gradient, increased base opacity)
    'promo_probending': { label: 'Pro-Bending', defaultWidth: 3, component: ({ setActiveTab }) => (
        <div onClick={() => setActiveTab('probending')} className="h-full relative overflow-hidden p-6 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-yellow-700/30 cursor-pointer group hover:border-yellow-500/50 transition-all flex flex-col justify-center shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/40 to-slate-900 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-yellow-500 mb-1 group-hover:text-yellow-400">PRO-BENDING</h3>
                <p className="text-xs text-yellow-200/60 mb-4">League Manager Module</p>
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-500 group-hover:translate-x-1 transition-transform">
                    ACCESS ARENA <ArrowRight size={12}/>
                </div>
            </div>
        </div>
    )},
    // TRACKER - UPDATED OPACITY
    'tracker_integration': { label: 'Integration Status', defaultWidth: 1, component: ({ }) => {
        const [state, setState] = useState(() => JSON.parse(localStorage.getItem('dev_tracker_v1') || '{}'));
        const toggle = (k) => {
            const next = { ...state, [k]: ((state[k] || 0) + 1) % 4 };
            setState(next);
            localStorage.setItem('dev_tracker_v1', JSON.stringify(next));
        };
        const getConf = (s) => {
            if(s===1) return {c:'text-amber-500',i:Activity,t:'IN PROGRESS'};
            if(s===2) return {c:'text-emerald-500',i:CheckCircle2,t:'COMPLETE'};
            if(s===3) return {c:'text-blue-400',i:Archive,t:'BACK BURNER'};
            return {c:'text-slate-600',i:Circle,t:'INCOMPLETE'};
        }
        return (
            <div className="h-full bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-4 overflow-y-auto custom-scrollbar shadow-xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Integration Status</h4>
                <div className="space-y-2">
                    {['core_dash','batch_modules','utility_widgets','global_store','probending','save_system'].map(k => {
                        const conf = getConf(state[k]);
                        const Icon = conf.i;
                        return (
                            <div key={k} onClick={() => toggle(k)} className="flex items-center justify-between p-2 rounded border border-transparent hover:bg-slate-800 cursor-pointer group">
                                <div className="flex items-center gap-2 text-xs text-slate-300"><Icon size={12} className={conf.c}/> <span className="uppercase">{k.replace('_',' ')}</span></div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }},
    // INVENTORY WIDGETS
    'widget_vault': { label: 'Vault', defaultWidth: 1, component: () => <VaultWidget /> },
    'widget_backpack': { label: 'Backpack', defaultWidth: 1, component: ({ setActiveTab }) => <BackpackWidget setActiveTab={setActiveTab} /> },
    'widget_binder': { label: 'Binder', defaultWidth: 1, component: ({ setActiveTab }) => <BinderWidget setActiveTab={setActiveTab} /> },
};

// --- DEFAULT LAYOUT ---
const DEFAULT_LAYOUT = [
    { id: 'uibuilder', width: 1, visible: true },
    { id: 'basestation', width: 1, visible: true },
    { id: 'promo_probending', width: 1, visible: true },
    { id: 'mod_logistics', width: 1, visible: true },
    { id: 'mod_inventory', width: 1, visible: true },
    { id: 'tracker_integration', width: 1, visible: true },
    { id: 'mod_estate', width: 1, visible: true },
    { id: 'mod_market', width: 1, visible: true },
    { id: 'widget_vault', width: 1, visible: true },
    { id: 'widget_backpack', width: 1, visible: true },
    { id: 'widget_binder', width: 1, visible: true },
];

export default function Dashboard({ setActiveTab }) {
  const { data } = useGameStore();
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // --- Layout State ---
  const [layout, setLayout] = useState(() => {
      const saved = localStorage.getItem('dashboard_layout_v2');
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  useEffect(() => {
      localStorage.setItem('dashboard_layout_v2', JSON.stringify(layout));
  }, [layout]);

  // --- Layout Actions ---
  const toggleVisibility = (index) => {
      const newLayout = [...layout];
      newLayout[index].visible = !newLayout[index].visible;
      setLayout(newLayout);
  };

  const cycleWidth = (index) => {
      const newLayout = [...layout];
      const current = newLayout[index].width || 1;
      newLayout[index].width = current >= 3 ? 1 : current + 1;
      setLayout(newLayout);
  };

  const resetLayout = () => {
      if(confirm("Reset dashboard to default?")) setLayout(DEFAULT_LAYOUT);
  };

  // --- Drag & Drop Logic ---
  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, position) => {
      dragItem.current = position;
      e.target.classList.add('opacity-50');
  };

  const handleDragEnter = (e, position) => {
      dragOverItem.current = position;
  };

  const handleDragEnd = (e) => {
      e.target.classList.remove('opacity-50');
      const copyList = [...layout];
      const dragItemContent = copyList[dragItem.current];
      copyList.splice(dragItem.current, 1);
      copyList.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setLayout(copyList);
  };

  // --- Render Helpers ---
  const getColSpan = (w) => {
      if (w === 3) return 'col-span-1 lg:col-span-3';
      if (w === 2) return 'col-span-1 lg:col-span-2';
      return 'col-span-1';
  };

  return (
    <div className="h-full w-full flex overflow-hidden bg-slate-950 font-sans relative">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="shrink-0 p-8 pb-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 z-20">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Terminal className="text-emerald-500" size={32} />
                <span>PROJECT DASHBOARD</span>
                </h1>
                <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
                    <span>System Version 0.2.3</span>
                    <span className="text-slate-700">//</span>
                    <span className={`${editMode ? 'text-amber-500 animate-pulse' : 'text-emerald-500/80'}`}>{editMode ? 'EDIT MODE ACTIVE' : 'Command Center Active'}</span>
                </p>
            </div>
            
            <div className="flex gap-4 items-center">
                {editMode && (
                    <button onClick={resetLayout} className="text-xs text-red-400 hover:text-red-300 underline mr-2">Reset Layout</button>
                )}
                
                <button 
                    onClick={() => setEditMode(!editMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${editMode ? 'bg-amber-500/10 text-amber-500 border-amber-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                    {editMode ? <CheckCircle2 size={18} /> : <Hammer size={18} />}
                    <span className="font-bold text-sm">{editMode ? 'Finish Editing' : 'Customize'}</span>
                </button>

                <button 
                    onClick={() => setIsTodoOpen(!isTodoOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isTodoOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-blue-500/50'}`}
                >
                    <NotebookPen size={18} />
                    <span className="font-bold text-sm">Tasks</span>
                </button>
            </div>
          </div>

          {/* Edit Mode: Stash Bar (Shows hidden widgets) */}
          {editMode && (
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex gap-4 overflow-x-auto shrink-0 animate-in slide-in-from-top-2">
                  <div className="text-xs font-bold text-slate-500 uppercase shrink-0 py-2">Hidden Widgets:</div>
                  {layout.map((item, index) => !item.visible && (
                      <button key={item.id} onClick={() => toggleVisibility(index)} className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:bg-emerald-900/50 hover:text-emerald-400 hover:border-emerald-500/50 transition-all text-xs">
                          <Eye size={12}/> {WIDGET_REGISTRY[item.id]?.label || item.id}
                      </button>
                  ))}
                  {layout.every(i => i.visible) && <span className="text-xs text-slate-600 italic py-2">No hidden widgets.</span>}
              </div>
          )}

          {/* Dashboard Grid */}
          <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 ${editMode ? 'gap-8' : ''}`}>
                
                {layout.map((item, index) => {
                    const def = WIDGET_REGISTRY[item.id];
                    if (!def || (!item.visible && !editMode)) return null;
                    const Component = def.component;

                    return (
                        <div 
                            key={item.id}
                            className={`
                                relative transition-all duration-300 rounded-xl
                                ${getColSpan(item.width)}
                                ${editMode ? 'ring-2 ring-slate-700 hover:ring-amber-500/50 bg-black/40 backdrop-blur-sm p-2 min-h-[150px]' : ''}
                                ${!item.visible ? 'opacity-50 grayscale' : ''}
                            `}
                            draggable={editMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {/* Render Actual Widget */}
                            <div className={`h-full ${editMode ? 'pointer-events-none' : ''}`}>
                                <Component setActiveTab={setActiveTab} data={data} />
                            </div>

                            {/* Edit Overlays */}
                            {editMode && (
                                <div className="absolute inset-0 z-50 flex flex-col justify-between p-2 pointer-events-none">
                                    <div className="flex justify-between items-start pointer-events-auto">
                                        <div className="cursor-move p-2 bg-slate-800 text-slate-400 rounded hover:text-white hover:bg-slate-700 shadow-lg"><GripVertical size={16}/></div>
                                        <div className="flex gap-1">
                                            <button onClick={() => cycleWidth(index)} className="p-2 bg-slate-800 text-blue-400 rounded hover:bg-slate-700 shadow-lg" title="Resize">
                                                {item.width === 1 ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
                                            </button>
                                            <button onClick={() => toggleVisibility(index)} className={`p-2 bg-slate-800 rounded hover:bg-slate-700 shadow-lg ${item.visible ? 'text-slate-400' : 'text-red-400'}`} title={item.visible ? "Hide" : "Show"}>
                                                {item.visible ? <EyeOff size={16}/> : <Eye size={16}/>}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-center pointer-events-none">
                                        <span className="text-[10px] uppercase font-bold bg-black/80 text-amber-500 px-2 py-1 rounded-full border border-amber-900">{item.visible ? `${item.width}x Width` : 'HIDDEN'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

            </div>
          </div>
      </div>

      {/* Slide-out Todo List */}
      <div className={`fixed inset-y-0 right-0 w-96 transform transition-transform duration-300 ease-in-out z-50 ${isTodoOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <TodoList onClose={() => setIsTodoOpen(false)} />
      </div>

    </div>
  );
}