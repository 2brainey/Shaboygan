import React, { useState } from 'react';
import { Package, BookOpen, Landmark, DollarSign, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';
import { InventoryGrid, CollectionBinder } from './dashboardui'; 
import { RenderIcon } from './dashboardutils'; 
import { INVENTORY_SLOTS, CARD_DATABASE } from '../data/gamedata'; 

const BankInterface = ({ slots, balance, onDragStart, onDrop, onContextMenu, onCurrencyAction }) => (
    <div className="flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4 px-4 pt-4 shrink-0 bg-[#1e1e1e] sticky top-0 z-30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><RenderIcon name="Landmark" className="text-amber-500"/> Vault Storage</h2>
            <div className="bg-black/40 px-3 py-1 rounded border border-slate-700 flex items-center gap-2"><RenderIcon name="Lock" size={14} className="text-slate-500"/><span className="text-amber-500 font-mono font-bold">{(balance || 0).toLocaleString()} DSC</span></div>
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 mb-4 shrink-0 relative z-20">
            <div className="bg-[#131313] p-2 rounded border border-slate-800"><div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex justify-between"><span>Deposit</span><ArrowDownToLine size={12} className="text-emerald-500"/></div><div className="flex gap-1"><button onClick={() => onCurrencyAction('deposit', 0.5)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-[10px] py-1 rounded text-slate-300">50%</button><button onClick={() => onCurrencyAction('deposit', 1.0)} className="flex-1 bg-emerald-900/50 hover:bg-emerald-900 text-[10px] py-1 rounded text-emerald-400 border border-emerald-900">ALL</button></div></div>
            <div className="bg-[#131313] p-2 rounded border border-slate-800"><div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex justify-between"><span>Withdraw</span><ArrowUpFromLine size={12} className="text-red-500"/></div><div className="flex gap-1"><button onClick={() => onCurrencyAction('withdraw', 0.5)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-[10px] py-1 rounded text-slate-300">50%</button><button onClick={() => onCurrencyAction('withdraw', 1.0)} className="flex-1 bg-red-900/50 hover:bg-red-900 text-[10px] py-1 rounded text-red-400 border border-red-900">ALL</button></div></div>
        </div>
        <div className="flex-1 bg-black/20 rounded-lg border border-slate-800/50 p-2 mx-4 mb-4 overflow-y-auto relative z-10"><InventoryGrid slots={slots} containerId="bank" onDragStart={onDragStart} onDrop={onDrop} onContextMenu={onContextMenu} mp={0} /></div>
    </div>
);

export default function InventoryView({ inventory, bank, bankBalance, cards, discipline, cash, salvage, onUpdateInventory, onUpdateBank, onUpdateBankBalance, onUpdateCards, onUpdateDiscipline, onUseItem }) {
  const [rightTab, setRightTab] = useState('binder'); 
  const [sellConfirm, setSellConfirm] = useState(null); 
  const [draggedItem, setDraggedItem] = useState(null); 
  const [sortMethod, setSortMethod] = useState('rarity'); 

  const safeInventory = Array.isArray(inventory) ? inventory : new Array(INVENTORY_SLOTS).fill(null);
  const safeBank = Array.isArray(bank) ? bank : new Array(50).fill(null);
  const safeCards = Array.isArray(cards) ? cards : [];

  const handleDragStart = (containerId, index) => setDraggedItem({ container: containerId, index });
  const handleDrop = (targetContainerId, targetIndex) => {
      if (!draggedItem) return;
      const { container: sourceContainerId, index: sourceIndex } = draggedItem;
      const sourceSlots = sourceContainerId === 'inventory' ? safeInventory : safeBank;
      const targetSlots = targetContainerId === 'inventory' ? safeInventory : safeBank;
      const setSource = sourceContainerId === 'inventory' ? onUpdateInventory : onUpdateBank;
      const setTarget = targetContainerId === 'inventory' ? onUpdateBank : onUpdateInventory;

      if (sourceContainerId === targetContainerId) {
          const newSlots = [...sourceSlots];
          const temp = newSlots[sourceIndex];
          newSlots[sourceIndex] = newSlots[targetIndex];
          newSlots[targetIndex] = temp;
          setSource(newSlots);
      } else {
          const itemToMove = sourceSlots[sourceIndex];
          const targetItem = targetSlots[targetIndex];
          const newSourceSlots = [...sourceSlots];
          const newTargetSlots = [...targetSlots];
          newSourceSlots[sourceIndex] = targetItem; 
          newTargetSlots[targetIndex] = itemToMove;
          setSource(newSourceSlots);
          setTarget(newTargetSlots);
      }
      setDraggedItem(null);
  };

  const handleContextMenu = (containerId, index) => {
      const sourceSlots = containerId === 'inventory' ? safeInventory : safeBank;
      const targetSlots = containerId === 'inventory' ? safeBank : safeInventory;
      const setSource = containerId === 'inventory' ? onUpdateInventory : onUpdateBank;
      const setTarget = containerId === 'inventory' ? onUpdateBank : onUpdateInventory;
      const item = sourceSlots[index];
      if(!item) return;
      const newTarget = [...targetSlots];
      const existingIndex = newTarget.findIndex(s => s && s.name === item.name && s.rarity === item.rarity);
      if (existingIndex !== -1) newTarget[existingIndex] = { ...newTarget[existingIndex], count: newTarget[existingIndex].count + item.count };
      else { const emptyIndex = newTarget.findIndex(s => s === null); if (emptyIndex !== -1) newTarget[emptyIndex] = item; else { alert("Target full!"); return; } }
      setTarget(newTarget);
      const newSource = [...sourceSlots];
      newSource[index] = null;
      setSource(newSource);
  };

  const sortInventory = () => {
      const sorted = [...safeInventory].sort((a, b) => {
          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;
          if (sortMethod === 'rarity') {
              const rarityOrder = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
              return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
          }
          if (sortMethod === 'name') return a.name.localeCompare(b.name);
          return 0;
      });
      onUpdateInventory(sorted);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 items-start">
      {sellConfirm && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"><div className="bg-[#1e1e1e] p-6 rounded-xl text-center"><h3 className="text-xl font-bold text-white mb-2">Sell Duplicates?</h3><p className="text-slate-400 text-sm mb-4">Gain {sellConfirm.value} DSC</p><div className="flex gap-3 justify-center"><button onClick={() => setSellConfirm(null)} className="px-4 py-2 rounded bg-slate-700">Cancel</button><button onClick={() => { onUpdateCards(safeCards.filter(id => !safeCards.filter((x,i,a) => a.indexOf(x)!==i).includes(id))); onUpdateDiscipline(discipline + sellConfirm.value); setSellConfirm(null); }} className="px-4 py-2 rounded bg-emerald-600 text-white">Confirm</button></div></div></div>}

      <div className="lg:w-1/3 flex flex-col gap-6 h-full overflow-hidden">
        <div className="bg-[#1e1e1e] border border-slate-700 rounded-xl flex flex-col shadow-2xl relative h-full">
            <div className="flex justify-between items-center p-6 pb-2 relative z-30 shrink-0 bg-[#1e1e1e] rounded-t-xl">
                <div className="flex items-center gap-2"><h3 className="text-xl font-bold text-white flex items-center gap-2"><RenderIcon name="Package" className="text-amber-500"/> Backpack</h3></div>
                <div className="flex gap-2">
                    <select value={sortMethod} onChange={(e) => setSortMethod(e.target.value)} className="bg-black/40 text-xs text-white border border-slate-700 rounded px-2 py-1"><option value="rarity">Rarity</option><option value="name">Name</option></select>
                    <button onClick={sortInventory} className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs font-bold">Sort</button>
                </div>
            </div>
            {/* Added overflow-y-auto to this container specifically, while removing overflow-hidden from parent in dashboard view logic */}
            <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar p-6 pt-2">
                <InventoryGrid slots={safeInventory} containerId="inventory" mp={discipline} cash={cash} salvage={salvage} onUseItem={onUseItem} onDragStart={handleDragStart} onDrop={handleDrop} onContextMenu={handleContextMenu}/>
            </div>
        </div>
      </div>

      <div className="lg:w-2/3 bg-[#1e1e1e] border border-slate-700 rounded-xl flex flex-col shadow-2xl relative overflow-hidden h-full">
        <div className="flex border-b border-slate-700 bg-[#131313] shrink-0 sticky top-0 z-30">
            <button onClick={() => setRightTab('binder')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${rightTab === 'binder' ? 'bg-[#1e1e1e] text-white border-t-2 border-amber-500' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a1a]'}`}><RenderIcon name="BookOpen" size={16}/> Card Binder</button>
            <button onClick={() => setRightTab('bank')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${rightTab === 'bank' ? 'bg-[#1e1e1e] text-white border-t-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a1a]'}`}><RenderIcon name="Landmark" size={16}/> Bank Vault</button>
        </div>
        <div className="flex-1 overflow-hidden relative z-10">
            {rightTab === 'binder' ? <div className="h-full flex flex-col p-6 overflow-hidden"><div className="flex-1 bg-black/20 rounded-lg border border-slate-800/50 p-2 overflow-hidden"><CollectionBinder cards={safeCards} onSell={(id, val) => { const idx = safeCards.indexOf(id); const newC = [...safeCards]; newC.splice(idx, 1); onUpdateCards(newC); onUpdateDiscipline(discipline + val); }} onSellAll={setSellConfirm}/></div></div> : <BankInterface slots={safeBank} balance={bankBalance} onDragStart={handleDragStart} onDrop={handleDrop} onContextMenu={handleContextMenu} onCurrencyAction={(t, p) => { if(t==='deposit' && discipline*p>0) { onUpdateDiscipline(discipline - Math.floor(discipline*p)); onUpdateBankBalance(bankBalance + Math.floor(discipline*p)); } if(t==='withdraw' && bankBalance*p>0) { onUpdateBankBalance(bankBalance - Math.floor(bankBalance*p)); onUpdateDiscipline(discipline + Math.floor(bankBalance*p)); } }} />}
        </div>
      </div>
    </div>
  );
}