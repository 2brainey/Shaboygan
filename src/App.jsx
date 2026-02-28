import React, { useState, useEffect } from 'react';
import { Layout, Hammer, Terminal, Package, Map, ShoppingBag, Trophy, ChevronDown } from 'lucide-react';

// Core State - Using lowercase paths
import { useGameStore } from './store/gamestore';

// Standard Components
import Dashboard from './dashboard';
import UIBuilder from './uibuilder';
import PlayerProfile from './components/playerprofile';

// Batch 1 Components - Fixed lowercase imports to stop 500 errors
import InventoryView from './components/inventoryprototype';
import LogisticsDashboard from './components/logisticsdashboard';
import ShopFullPage from './components/shopfullpage';
import EstatePrototype from './components/estateprototype';
import ProBendingLeague from './components/probendingleague';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
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

  // Load game on mount
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
      
      {/* --- HEADER START --- */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between shrink-0 shadow-sm z-50">
        
        {/* Logo/Brand */}
        <div onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 font-bold text-gray-200 tracking-wider text-sm cursor-pointer hover:text-white transition-colors">
            <div className="bg-emerald-600/20 p-1.5 rounded text-emerald-400"><Terminal size={16} /></div>
            SHABOYGAN <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">DEV</span>
        </div>
        
        {/* Navigation Centered */}
        <div className="flex-1 mx-4 overflow-visible flex justify-center">
            <div className="flex items-center gap-1 bg-gray-950/50 p-1 rounded-lg border border-gray-800/50 w-max">
                
                {/* Core UI Tabs */}
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: Terminal },
                    { id: 'inventory', label: 'Inventory', icon: Package },
                    { id: 'shop', label: 'Market', icon: ShoppingBag },
                    { id: 'logistics', label: 'Logistics', icon: Map },
                ].map((tab) => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gray-800 text-white shadow-sm ring-1 ring-gray-700' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}

                {/* Divider */}
                <div className="w-[1px] h-4 bg-gray-800 mx-2"></div>

                {/* Game Logic / Simulations Dropdown */}
                <div className="relative group">
                    <button 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${['uibuilder', 'estate', 'probending'].includes(activeTab) ? 'bg-indigo-900/30 text-indigo-400 ring-1 ring-indigo-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
                    >
                        <Layout size={14} /> 
                        Simulations
                        <ChevronDown size={12} className="opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                        <div className="py-1">
                            {[
                                { id: 'estate', label: 'Estate Blueprint', icon: Layout },
                                { id: 'probending', label: 'Pro-Bending League', icon: Trophy },
                                { id: 'uibuilder', label: 'UI Builder', icon: Terminal },
                            ].map((tab) => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        // Optional: You can add logic here to close the dropdown on mobile if needed
                                    }} 
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition-all text-left ${activeTab === tab.id ? 'bg-gray-800 text-white border-l-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-2 border-transparent'}`}
                                >
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Profile Trigger Button */}
        <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[2px] shadow-lg cursor-pointer hover:scale-105 hover:shadow-emerald-500/20 transition-all group"
        >
            <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"></div>
                <span className="text-[10px] font-bold text-emerald-400 group-hover:text-white">DEV</span>
            </div>
        </button>
      </div> 
      {/* --- HEADER END --- */}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-hidden relative bg-gray-950">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'uibuilder' && <UIBuilder />}
        {activeTab === 'estate' && <EstatePrototype />}
        {activeTab === 'inventory' && (
            <InventoryView 
                inventory={data.inventory} 
                bank={data.bank} 
                bankBalance={data.bankBalance || 0}
                cards={data.cards} 
                discipline={data.discipline} 
                cash={data.cash} 
                salvage={data.salvage} 
                onUpdateInventory={handleInventoryUpdate} 
                onUpdateBank={handleBankUpdate}
                onUpdateBankBalance={(val) => updateData({ bankBalance: val })}
                onUpdateDiscipline={handleDisciplineUpdate} 
                onUpdateCards={(cards) => updateData({ cards })} 
                onUseItem={handleUseItemAction} 
            />
        )}
        
        {activeTab === 'logistics' && <LogisticsDashboard />}
        
        {activeTab === 'shop' && (
            <ShopFullPage 
                discipline={data.discipline} 
                inventory={data.inventory} 
                lastDailyClaim={data.lastDailyClaim} 
                lastHourlyClaim={data.lastHourlyClaim} 
                onClaimDaily={claimDailyAction} 
                onClaimHourly={claimHourlyAction} 
                onPurchase={handlePurchase} 
            />
        )}
        
        {activeTab === 'probending' && <ProBendingLeague />}
      </div>
      
      {/* GLOBAL OVERLAYS */}
      <PlayerProfile 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          setActiveTab={setActiveTab}
      />
    </div>
  );
}