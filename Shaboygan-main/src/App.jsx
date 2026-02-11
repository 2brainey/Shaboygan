import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Move, 
  Plus, 
  Type, 
  Box, 
  Trash2, 
  Settings, 
  Play, 
  MousePointer2, 
  Terminal,
  Palette,
  Layout,
  Circle,
  Save,
  Zap,
  Pickaxe,
  Battery,
  Warehouse,
  AlertTriangle,
  Hammer,
  RotateCcw
} from 'lucide-react';

// ==========================================
// COMPONENT 1: UI BUILDER
// ==========================================

const UI_INITIAL_ELEMENTS = [
  {
    id: 'header-1',
    type: 'text',
    content: 'SYSTEM ONLINE',
    style: {
      x: 300,
      y: 50,
      width: 300,
      height: 60,
      backgroundColor: 'transparent',
      color: '#00ff9d',
      fontSize: '32px',
      fontWeight: 'bold',
      textAlign: 'center',
      borderWidth: 0,
      borderRadius: 0,
      zIndex: 1,
    }
  },
  {
    id: 'btn-start',
    type: 'button',
    content: 'INITIALIZE',
    style: {
      x: 350,
      y: 250,
      width: 200,
      height: 50,
      backgroundColor: '#00ff9d',
      color: '#000000',
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      borderWidth: 0,
      borderRadius: 4,
      zIndex: 2,
    }
  },
  {
    id: 'panel-bg',
    type: 'box',
    content: '',
    style: {
      x: 250,
      y: 150,
      width: 400,
      height: 300,
      backgroundColor: 'rgba(0, 20, 10, 0.8)',
      borderColor: '#00ff9d',
      borderWidth: 2,
      borderRadius: 8,
      zIndex: 0,
    }
  }
];

function UIBuilder() {
  const [mode, setMode] = useState('play'); 
  
  const [elements, setElements] = useState(() => {
    // Safety check for SSR or environments without localStorage
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('shaboygan-layout');
        return saved ? JSON.parse(saved) : UI_INITIAL_ELEMENTS;
    }
    return UI_INITIAL_ELEMENTS;
  });

  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState(['System ready...', 'Waiting for user input...']);
   
  const canvasRef = useRef(null);

  // --- Game Logic ---
  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 8));
  };

  const saveLayout = () => {
    localStorage.setItem('shaboygan-layout', JSON.stringify(elements));
    addLog('> Layout saved to memory.');
  };

  const handleElementClick = (e, element) => {
    if (mode === 'edit') {
      e.stopPropagation();
      setSelectedId(element.id);
    } else {
      if (element.type === 'button') {
        addLog(`> Executed: ${element.content}`);
        const el = document.getElementById(element.id);
        if (el) {
          el.style.transform = 'scale(0.95)';
          setTimeout(() => el.style.transform = 'scale(1)', 100);
        }
      }
    }
  };

  // --- Editor Logic (Wrapped in useCallback) ---
  const updateElement = useCallback((id, newProps) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...newProps } : el
    ));
  }, []);

  const updateStyle = useCallback((id, newStyle) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, style: { ...el.style, ...newStyle } } : el
    ));
  }, []);

  const addElement = (type) => {
    const newId = `el-${Date.now()}`;
    const baseStyle = {
      x: 100,
      y: 100,
      zIndex: elements.length + 1,
    };

    let newElement = { id: newId, type, style: baseStyle };

    // Element definitions...
    if (type === 'button') {
      newElement = { ...newElement, content: 'NEW BUTTON', style: { ...baseStyle, width: 140, height: 40, backgroundColor: '#3b82f6', color: 'white', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } };
    } else if (type === 'text') {
      newElement = { ...newElement, content: 'New Text Label', style: { ...baseStyle, width: 200, height: 30, color: '#ffffff', backgroundColor: 'transparent', fontSize: '16px' } };
    } else if (type === 'box') {
      newElement = { ...newElement, content: '', style: { ...baseStyle, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#ffffff', borderWidth: 1, borderRadius: 8 } };
    } else if (type === 'circle') {
       newElement = { ...newElement, type: 'box', content: '', style: { ...baseStyle, width: 80, height: 80, backgroundColor: '#ef4444', borderRadius: 9999 } };
    }

    setElements(prev => [...prev, newElement]);
    setSelectedId(newId);
    addLog(`> Spawned new ${type} node.`);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(prev => prev.filter(el => el.id !== selectedId));
      setSelectedId(null);
      addLog('> Node deleted.');
    }
  };

  // --- Drag & Drop (Wrapped in useCallback) ---
  const handleMouseDown = (e, id) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    const element = elements.find(el => el.id === id);
    if (!element) return;

    setDraggingId(id);
    setSelectedId(id);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    
    setDragOffset({
      x: relX - element.style.x,
      y: relY - element.style.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggingId || mode !== 'edit') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const newX = relX - dragOffset.x;
    const newY = relY - dragOffset.y;

    updateStyle(draggingId, { x: newX, y: newY });
  }, [draggingId, mode, dragOffset, updateStyle]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);

  // --- Render Helpers ---
  const renderPropertiesPanel = () => {
    if (!selectedId) return <div className="text-gray-500 text-sm italic p-4">Select an element to edit properties.</div>;

    const el = elements.find(e => e.id === selectedId);
    if (!el) return null;

    return (
      <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <h3 className="font-bold text-white">Properties</h3>
          <span className="text-xs text-gray-400 font-mono">{el.id}</span>
        </div>

        {el.type !== 'box' && el.type !== 'circle' && (
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Content / Label</label>
            <input type="text" value={el.content || ''} onChange={(e) => updateElement(selectedId, { content: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Width</label>
            <input type="number" value={parseInt(el.style.width) || 0} onChange={(e) => updateStyle(selectedId, { width: parseInt(e.target.value) || 0 })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Height</label>
            <input type="number" value={parseInt(el.style.height) || 0} onChange={(e) => updateStyle(selectedId, { height: parseInt(e.target.value) || 0 })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={(el.style.backgroundColor === 'transparent' || !el.style.backgroundColor) ? '#000000' : el.style.backgroundColor} onChange={(e) => updateStyle(selectedId, { backgroundColor: e.target.value })} className="h-8 w-8 bg-transparent border-0 cursor-pointer" />
            <input type="text" value={el.style.backgroundColor || ''} onChange={(e) => updateStyle(selectedId, { backgroundColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Text/Border Color</label>
          <div className="flex gap-2">
            <input type="color" value={el.style.color || el.style.borderColor || '#ffffff'} onChange={(e) => updateStyle(selectedId, { color: e.target.value, borderColor: e.target.value })} className="h-8 w-8 bg-transparent border-0 cursor-pointer" />
            <input type="text" value={el.style.color || el.style.borderColor || ''} onChange={(e) => updateStyle(selectedId, { color: e.target.value, borderColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Font Size (px)</label>
          <input type="number" value={parseInt(el.style.fontSize) || 16} onChange={(e) => updateStyle(selectedId, { fontSize: `${e.target.value}px` })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
        </div>

         <div className="space-y-1">
          <label className="text-xs text-gray-400">Corner Radius (px)</label>
          <input type="number" value={parseInt(el.style.borderRadius) || 0} onChange={(e) => updateStyle(selectedId, { borderRadius: parseInt(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
        </div>

         <div className="space-y-1">
          <label className="text-xs text-gray-400">Layer (Z-Index)</label>
          <input type="number" value={parseInt(el.style.zIndex) || 0} onChange={(e) => updateStyle(selectedId, { zIndex: parseInt(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
        </div>

        <button onClick={deleteSelected} className="w-full mt-4 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 p-2 rounded flex items-center justify-center gap-2 transition-colors">
          <Trash2 size={16} /> Delete Element
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-gray-950 text-gray-100 overflow-hidden font-sans select-none">
      <div 
        ref={canvasRef}
        className={`relative flex-1 bg-gray-900 overflow-hidden transition-colors duration-500 ${mode === 'edit' ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1f2937 1px, transparent 0)', backgroundSize: '40px 40px' }}
        onClick={() => setSelectedId(null)}
      >
        {elements.map(el => (
          <div
            id={el.id}
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
            onClick={(e) => handleElementClick(e, el)}
            className={`absolute flex items-center justify-center transition-shadow border-box ${mode === 'edit' && selectedId === el.id ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-900/20' : ''} ${mode === 'play' && el.type === 'button' ? 'hover:brightness-110 active:brightness-90' : ''}`}
            style={{
              left: el.style.x,
              top: el.style.y,
              width: el.style.width,
              height: el.style.height,
              backgroundColor: el.style.backgroundColor,
              color: el.style.color,
              borderColor: el.style.borderColor,
              borderWidth: el.style.borderWidth,
              borderStyle: el.style.borderWidth ? 'solid' : 'none',
              borderRadius: el.style.borderRadius,
              fontSize: el.style.fontSize,
              fontWeight: el.style.fontWeight,
              zIndex: el.style.zIndex,
              cursor: mode === 'edit' ? 'move' : (el.type === 'button' ? 'pointer' : 'default'),
              userSelect: 'none',
              boxSizing: 'border-box'
            }}
          >
            {el.content}
          </div>
        ))}
        <div className="absolute top-4 left-4 pointer-events-none z-50">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${mode === 'edit' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-green-500/20 border-green-500 text-green-500'}`}>
                {mode === 'edit' ? 'EDIT MODE ENABLED' : 'PLAY MODE ACTIVE'}
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none z-50">
          <div className="w-full max-w-lg bg-black/80 backdrop-blur border-t-2 border-r-2 border-gray-800 rounded-tr-xl p-3 font-mono text-xs text-green-400">
            <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800 pb-1">
              <Terminal size={12} />
              <span>SYSTEM LOG</span>
            </div>
            {logs.map((log, i) => (<div key={i} className="opacity-80">{log}</div>))}
          </div>
        </div>
      </div>

      <div className={`w-80 bg-gray-900 border-l border-gray-800 flex flex-col transition-all duration-300 ${mode === 'play' ? 'w-16' : ''}`}>
        <div className="p-2 border-b border-gray-800 space-y-2">
            <button onClick={() => setMode(mode === 'play' ? 'edit' : 'play')} className={`w-full p-3 rounded flex items-center justify-center gap-2 font-bold transition-all ${mode === 'edit' ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'}`} title={mode === 'edit' ? 'Switch to Play Mode' : 'Switch to Edit Mode'}>
                {mode === 'play' ? <Settings size={20} /> : <Play size={20} />}
                {mode === 'edit' && "RUN GAME"}
            </button>
            <button onClick={saveLayout} className="w-full p-3 bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-300 rounded flex items-center justify-center gap-2 transition-colors border border-gray-700" title="Save Layout">
                <Save size={20} />
                {mode === 'edit' && "SAVE LAYOUT"}
            </button>
        </div>

        {mode === 'edit' && (
          <>
            <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-800">
               <div className="col-span-2 text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Create</div>
               <button onClick={() => addElement('button')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <MousePointer2 size={16} className="text-blue-400"/><span className="text-xs">Button</span>
               </button>
               <button onClick={() => addElement('text')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <Type size={16} className="text-green-400"/><span className="text-xs">Label</span>
               </button>
               <button onClick={() => addElement('box')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <Box size={16} className="text-purple-400"/><span className="text-xs">Container</span>
               </button>
               <button onClick={() => addElement('circle')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <Circle size={16} className="text-red-400"/><span className="text-xs">Circle</span>
               </button>
            </div>
            <div className="flex-1 overflow-hidden">{renderPropertiesPanel()}</div>
          </>
        )}
        
        {mode === 'play' && (
            <div className="flex-1 flex flex-col items-center gap-4 py-4 text-gray-600">
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="writing-vertical-rl text-xs uppercase tracking-widest opacity-50" style={{ writingMode: 'vertical-rl' }}>Game Running</div>
            </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT 2: BASE STATION GAME
// ==========================================

const GRID_SIZE = 8;
const TICK_RATE_MS = 1000;

const BUILDING_TYPES = {
  SOLAR: {
    id: 'solar',
    name: 'Solar Array',
    icon: Zap,
    cost: { minerals: 10, energy: 0 },
    production: { energy: 2, minerals: 0 },
    consumption: { energy: 0, minerals: 0 },
    maxStorage: { energy: 0, minerals: 0 },
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/40',
    borderColor: 'border-yellow-500/50',
    description: 'Generates Energy from the sun.'
  },
  DRILL: {
    id: 'drill',
    name: 'Auto-Drill',
    icon: Pickaxe,
    cost: { minerals: 25, energy: 0 },
    production: { energy: 0, minerals: 2 },
    consumption: { energy: 1, minerals: 0 },
    maxStorage: { energy: 0, minerals: 0 },
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/40',
    borderColor: 'border-blue-500/50',
    description: 'Mines minerals. Requires Energy.'
  },
  BATTERY: {
    id: 'battery',
    name: 'Capacitor Bank',
    icon: Battery,
    cost: { minerals: 15, energy: 0 },
    production: { energy: 0, minerals: 0 },
    consumption: { energy: 0, minerals: 0 },
    maxStorage: { energy: 50, minerals: 0 },
    color: 'text-green-400',
    bgColor: 'bg-green-900/40',
    borderColor: 'border-green-500/50',
    description: 'Increases Energy storage capacity.'
  },
  SILO: {
    id: 'silo',
    name: 'Mineral Silo',
    icon: Warehouse,
    cost: { minerals: 15, energy: 0 },
    production: { energy: 0, minerals: 0 },
    consumption: { energy: 0, minerals: 0 },
    maxStorage: { energy: 0, minerals: 50 },
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/40',
    borderColor: 'border-orange-500/50',
    description: 'Increases Mineral storage capacity.'
  }
};

const INITIAL_RESOURCES = {
  energy: 10,
  minerals: 25,
  maxEnergy: 50,
  maxMinerals: 50
};

function BaseGame() {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [grid, setGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [lastTickStats, setLastTickStats] = useState({ netEnergy: 0, netMinerals: 0 });
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      setResources(current => {
        let netEnergy = 0;
        let netMinerals = 0;
        let newMaxEnergy = INITIAL_RESOURCES.maxEnergy;
        let newMaxMinerals = INITIAL_RESOURCES.maxMinerals;

        grid.forEach(cell => {
          if (cell) {
            const type = BUILDING_TYPES[cell.type];
            newMaxEnergy += type.maxStorage.energy;
            newMaxMinerals += type.maxStorage.maxMinerals || type.maxStorage.minerals;
          }
        });

        let tempEnergy = current.energy;
        grid.forEach(cell => {
          if (cell) {
            const type = BUILDING_TYPES[cell.type];
            if (type.consumption.energy > 0 && tempEnergy < type.consumption.energy) return;
            netEnergy -= type.consumption.energy;
            netMinerals -= type.consumption.minerals;
            netEnergy += type.production.energy;
            netMinerals += type.production.minerals;
          }
        });

        setLastTickStats({ netEnergy, netMinerals });

        return {
          energy: Math.min(newMaxEnergy, Math.max(0, current.energy + netEnergy)),
          minerals: Math.min(newMaxMinerals, Math.max(0, current.minerals + netMinerals)),
          maxEnergy: newMaxEnergy,
          maxMinerals: newMaxMinerals
        };
      });
    }, TICK_RATE_MS);

    return () => clearInterval(tick);
  }, [grid]);

  const handleGridClick = (index) => {
    if (!selectedBuilding) {
      if (grid[index]) {
        const type = BUILDING_TYPES[grid[index].type];
        setResources(prev => ({ ...prev, minerals: prev.minerals + Math.floor(type.cost.minerals * 0.5) }));
        const newGrid = [...grid];
        newGrid[index] = null;
        setGrid(newGrid);
        showNotification("Building Recycled");
      }
      return;
    }

    if (grid[index]) { showNotification("Space Occupied!"); return; }

    const buildType = BUILDING_TYPES[selectedBuilding];
    if (resources.minerals < buildType.cost.minerals || resources.energy < buildType.cost.energy) {
      showNotification("Insufficient Resources!");
      return;
    }

    setResources(prev => ({
      ...prev,
      minerals: prev.minerals - buildType.cost.minerals,
      energy: prev.energy - buildType.cost.energy
    }));

    const newGrid = [...grid];
    newGrid[index] = { type: selectedBuilding, id: Date.now() };
    setGrid(newGrid);
  };

  const handleReset = () => {
    setResources(INITIAL_RESOURCES);
    setGrid(Array(GRID_SIZE * GRID_SIZE).fill(null));
    setLastTickStats({ netEnergy: 0, netMinerals: 0 });
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-4 shadow-xl z-10">
        <div className="mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
            <Hammer size={24} /> BaseStation <span className="text-slate-500 text-sm">Alpha</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage power, mine resources, expand.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 uppercase font-bold">Energy</span>
              <Zap size={14} className="text-yellow-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-yellow-100">
              {Math.floor(resources.energy)} <span className="text-sm text-slate-500">/ {resources.maxEnergy}</span>
            </div>
            <div className={`text-xs mt-1 ${lastTickStats.netEnergy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {lastTickStats.netEnergy >= 0 ? '+' : ''}{lastTickStats.netEnergy}/sec
            </div>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 uppercase font-bold">Minerals</span>
              <Box size={14} className="text-blue-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-blue-100">
              {Math.floor(resources.minerals)} <span className="text-sm text-slate-500">/ {resources.maxMinerals}</span>
            </div>
            <div className={`text-xs mt-1 ${lastTickStats.netMinerals >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {lastTickStats.netMinerals >= 0 ? '+' : ''}{lastTickStats.netMinerals}/sec
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Construction Protocol</h3>
          <div className="space-y-2">
            {Object.values(BUILDING_TYPES).map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuilding(b.id === selectedBuilding ? null : b.id)}
                className={`w-full flex flex-col p-3 rounded-md border transition-all text-left group
                  ${selectedBuilding === b.id 
                    ? 'bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500/50' 
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}
                `}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <b.icon size={16} className={b.color} />
                    <span className="font-bold text-sm">{b.name}</span>
                  </div>
                  {selectedBuilding === b.id && <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>}
                </div>
                
                <div className="text-xs text-slate-400 mb-2 leading-tight">{b.description}</div>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  <div className="text-xs font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-300">Cost: {b.cost.minerals}m</div>
                  {(b.production.energy > 0) && <span className="text-xs text-yellow-400">+{b.production.energy} E</span>}
                  {(b.production.minerals > 0) && <span className="text-xs text-blue-400">+{b.production.minerals} M</span>}
                  {(b.consumption.energy > 0) && <span className="text-xs text-red-400">-{b.consumption.energy} E</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800">
           <button onClick={handleReset} className="w-full py-2 px-4 rounded border border-red-900/50 text-red-500 hover:bg-red-900/20 text-xs flex items-center justify-center gap-2">
             <RotateCcw size={14} /> Reset Simulation
           </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        {notification && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-indigo-500 text-indigo-100 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <AlertTriangle size={16} /> <span className="text-sm font-bold">{notification}</span>
          </div>
        )}
        <div 
          className="relative grid gap-1 p-2 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, width: 'min(90vw, 600px)', aspectRatio: '1/1' }}
        >
          {grid.map((cell, i) => {
            const buildingType = cell ? BUILDING_TYPES[cell.type] : null;
            const isStarved = buildingType && buildingType.consumption.energy > 0 && resources.energy < buildingType.consumption.energy;
            return (
              <button key={i} onClick={() => handleGridClick(i)} className={`relative rounded flex items-center justify-center transition-all duration-200 ${cell ? `${buildingType.bgColor} ${buildingType.borderColor} border-2` : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-500'} ${selectedBuilding && !cell ? 'cursor-crosshair hover:bg-indigo-900/30 hover:border-indigo-400' : ''}`}>
                {cell ? (
                  <>
                    <buildingType.icon size={28} className={`${buildingType.color} ${isStarved ? 'opacity-20' : 'drop-shadow-lg'} transition-opacity duration-500`} />
                    {isStarved && <div className="absolute inset-0 flex items-center justify-center"><Zap size={16} className="text-red-500 animate-pulse" /></div>}
                  </>
                ) : <div className="w-1 h-1 rounded-full bg-slate-700/50" />}
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-6 text-slate-500 text-xs font-mono text-center">
          {selectedBuilding ? <span className="text-indigo-400 font-bold animate-pulse">SELECT GRID CELL TO BUILD</span> : <span>SELECT A STRUCTURE FROM THE MENU</span>}
          <div className="mt-1 opacity-50">Click built structures to recycle them (50% refund)</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT 3: MAIN APP CONTROLLER
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('uibuilder');

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
      
      {/* Navigation Bar */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
        <div className="font-bold text-gray-400 tracking-wider text-sm">SHABOYGAN <span className="text-xs bg-gray-800 px-2 py-0.5 rounded ml-2">DEV</span></div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('uibuilder')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'uibuilder' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <Layout size={16} />
            UI Builder
          </button>
          
          <button 
            onClick={() => setActiveTab('basegame')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'basegame' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <Hammer size={16} />
            Base Station
          </button>
        </div>
        
        <div className="w-20"></div> {/* Spacer for balance */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'uibuilder' ? <UIBuilder /> : <BaseGame />}
      </div>

    </div>
  );
}