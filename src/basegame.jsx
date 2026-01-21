import React, { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  Box, 
  Pickaxe, 
  Battery, 
  Warehouse, 
  AlertTriangle,
  Hammer,
  RotateCcw
} from 'lucide-react';

// --- Game Constants ---
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

export default function BaseBuildingGame() {
  // --- State ---
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [grid, setGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [lastTickStats, setLastTickStats] = useState({ netEnergy: 0, netMinerals: 0 });
  const [notification, setNotification] = useState(null);

  // --- Helpers ---
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  // --- Game Loop (The "Tick") ---
  useEffect(() => {
    const tick = setInterval(() => {
      setResources(current => {
        let netEnergy = 0;
        let netMinerals = 0;
        let newMaxEnergy = INITIAL_RESOURCES.maxEnergy;
        let newMaxMinerals = INITIAL_RESOURCES.maxMinerals;

        // 1. Calculate Capacity
        grid.forEach(cell => {
          if (cell) {
            const type = BUILDING_TYPES[cell.type];
            newMaxEnergy += type.maxStorage.energy;
            newMaxMinerals += type.maxStorage.maxMinerals || type.maxStorage.minerals;
          }
        });

        // 2. Calculate Production/Consumption
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

  // --- Interaction Logic ---
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