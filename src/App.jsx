import React, { useState, useEffect } from 'react';
import { Layout, Hammer, Terminal, Package, Map, ShoppingBag } from 'lucide-react';

// Core State - Using lowercase paths
import { useGameStore } from './store/gamestore';

// Standard Components
import Dashboard from './dashboard';
import UIBuilder from './uibuilder';
import BaseGame from './basegame';

// Batch 1 Components - Fixed lowercase imports to stop 500 errors
import InventoryView from './components/inventoryprototype';
import LogisticsDashboard from './components/logisticsdashboard';
import ShopFullPage from './components/shopfullpage';
// FIX 1: Added missing import for EstatePrototype
import EstatePrototype from './components/estateprototype';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { 
      data, 
      loadGame, 
      saveGame,
      updateData,
      claimDailyAction,
      claimHourlyAction,
      purchaseItemAction,
      handleUseItemAction 
  } = useGameStore();

  // FIX 2: Added [loadGame] dependency to silence the warning
  useEffect(() => {
      loadGame();
  }, [loadGame]);

  // Syncing store functions to Batch 1 component props
  const handleInventoryUpdate = (newInv) => updateData({ inventory: newInv });
  const handleBankUpdate = (newBank) => updateData({ bank: newBank });
  const handleDisciplineUpdate = (val) => updateData({ discipline: val });
  
  const handlePurchase = (item, category) => {
      const result = purchaseItemAction(item, category);
      if (result.success) saveGame();
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden font-sans">
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between shrink-0 shadow-sm z-50">
        <div onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 font-bold text-gray-200 tracking-wider text-sm cursor-pointer hover:text-white transition-colors">
            <div className="bg-emerald-600/20 p-1.5 rounded text-emerald-400"><Terminal size={16} /></div>
            SHABOYGAN <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">DEV</span>
        </div>
        
        <div className="flex-1 mx-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-1 bg-gray-950/50 p-1 rounded-lg border border-gray-800/50 w-max mx-auto">
            {[
                { id: 'dashboard', label: 'Dashboard', icon: Terminal },
                { id: 'uibuilder', label: 'Builder', icon: Layout },
                { id: 'basegame', label: 'BaseStation', icon: Hammer },
                { id: 'logistics', label: 'Logistics', icon: Map },
                { id: 'inventory', label: 'Inventory', icon: Package },
                { id: 'estate', label: 'Estate', icon: Layout },
                { id: 'shop', label: 'Market', icon: ShoppingBag },
            ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gray-800 text-white shadow-sm ring-1 ring-gray-700' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}>
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
            </div>
        </div>
        <div className="w-8 shrink-0"><div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 border-2 border-gray-900 shadow-lg"></div></div> 
      </div>

      <div className="flex-1 overflow-hidden relative bg-gray-950">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'uibuilder' && <UIBuilder />}
        {activeTab === 'basegame' && <BaseGame />}
        {/* FIX 3: Cleaned up EstatePrototype usage (removed props, handled by store now) */}
        {activeTab === 'estate' && <EstatePrototype />}
        {activeTab === 'inventory' && <InventoryView inventory={data.inventory} bank={data.bank} bankBalance={data.bankBalance} cards={data.cards} discipline={data.discipline} cash={data.cash} salvage={data.salvage} onUpdateInventory={handleInventoryUpdate} onUpdateBank={handleBankUpdate} onUpdateDiscipline={handleDisciplineUpdate} onUpdateCards={(cards) => updateData({ cards })} onUseItem={handleUseItemAction} />}
        {activeTab === 'logistics' && <LogisticsDashboard />}
        {activeTab === 'shop' && <ShopFullPage discipline={data.discipline} inventory={data.inventory} lastDailyClaim={data.lastDailyClaim} lastHourlyClaim={data.lastHourlyClaim} onClaimDaily={claimDailyAction} onClaimHourly={claimHourlyAction} onPurchase={handlePurchase} />}
      </div>
    </div>
  );
}