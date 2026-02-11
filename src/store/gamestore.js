import { create } from 'zustand';
import { 
    initialData, 
    SHOP_ITEMS
} from '../data/gamedata'; 

// --- HELPER FUNCTIONS ---

const addToSlotArray = (slots, item, quantity = 1) => {
    const newSlots = [...slots];
    // Stack existing items
    const existingIndex = newSlots.findIndex(s => s && s.name === item.name && s.rarity === item.rarity);
    if (existingIndex !== -1) {
        newSlots[existingIndex] = { ...newSlots[existingIndex], count: newSlots[existingIndex].count + quantity };
        return newSlots;
    }
    // Find empty slot
    const emptyIndex = newSlots.findIndex(s => s === null);
    if (emptyIndex !== -1) {
        newSlots[emptyIndex] = { ...item, count: quantity, id: Date.now() + Math.random() };
        return newSlots;
    }
    return null; // Inventory full
};

const mergeData = (base, saved) => {
  return { 
      ...base, 
      ...saved,
      inventory: Array.isArray(saved?.inventory) ? saved.inventory : base.inventory,
      bank: Array.isArray(saved?.bank) ? saved.bank : base.bank,
      wellness: { ...base.wellness, ...(saved?.wellness || {}) },
      assets: { ...base.assets, ...(saved?.assets || {}) },
      estate: { ...base.estate, ...(saved?.estate || {}) }
  };
};

// --- ZUSTAND STORE ---

export const useGameStore = create((set, get) => ({
  data: { ...initialData },
  loading: true,
  isSaving: false,

  loadGame: async () => {
    set({ loading: true });
    try {
      const localData = localStorage.getItem('vault_save_v1');
      if (localData) {
          const parsed = JSON.parse(localData);
          set({ data: mergeData(initialData, parsed), loading: false });
      } else {
          set({ data: initialData, loading: false });
      }
    } catch (error) {
      console.error("Load Error:", error);
      set({ data: initialData, loading: false });
    }
  },

  saveGame: async () => {
    set({ isSaving: true });
    const currentData = get().data;
    localStorage.setItem('vault_save_v1', JSON.stringify(currentData));
    setTimeout(() => set({ isSaving: false }), 500);
  },

  updateData: (updater) => set((state) => {
      const newData = typeof updater === 'function' ? updater(state.data) : updater;
      const finalData = { ...state.data, ...newData };
      // Auto-save logic
      localStorage.setItem('vault_save_v1', JSON.stringify(finalData));
      return { data: finalData };
  }),

  // --- ACTIONS ---

  claimDailyAction: () => {
    const state = get();
    const now = Date.now();
    if (now - state.data.lastDailyClaim < 86400000) return { success: false, message: "Already claimed today!" };

    get().updateData({
        lastDailyClaim: now,
        discipline: state.data.discipline + 5000,
        salvage: (state.data.salvage || 0) + 5
    });
    return { success: true, message: "Daily Reward Claimed! +5000 BM, +5 Salvage" };
  },

  claimHourlyAction: () => {
    const state = get();
    const now = Date.now();
    if (now - state.data.lastHourlyClaim < 3600000) return { success: false, message: "Hourly crate not ready." };

    // Grant a random booster from the shop list
    const possibleRewards = SHOP_ITEMS.boosters || [];
    if (possibleRewards.length === 0) return { success: false, message: "No rewards defined." };
    
    const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
    const newInv = addToSlotArray([...state.data.inventory], reward, 1) || state.data.inventory;
    
    get().updateData({
        lastHourlyClaim: now,
        inventory: newInv
    });
    return { success: true, message: `Hourly Crate: Found ${reward.name}!` };
  },

  purchaseItemAction: (item) => {
    const state = get();
    if (state.data.discipline < item.cost) {
      return { success: false, message: "Not enough Brain Matter" };
    }
    const newInv = addToSlotArray([...state.data.inventory], item, 1);
    if(!newInv) return { success: false, message: "Inventory Full" };

    get().updateData({
        discipline: state.data.discipline - item.cost,
        inventory: newInv,
        statistics: { ...state.data.statistics, itemsBought: (state.data.statistics?.itemsBought || 0) + 1 }
    });
    return { success: true, message: `Purchased ${item.name}` };
  },

  handleUseItemAction: (item, index) => {
    const state = get();
    const newInv = [...state.data.inventory];
    
    // Decrement or remove item
    if (newInv[index].count > 1) {
        newInv[index] = { ...newInv[index], count: newInv[index].count - 1 };
    } else {
        newInv[index] = null;
    }
    
    // Logic for item effects (Simple XP boost example)
    let xpUpdates = {};
    if (item.type === 'Booster' && item.xpAmount) {
        // Apply generic XP boost if no specific skill ID is present
        const skillId = item.skillId || 'general'; 
        xpUpdates = { [skillId]: (state.data.bonusXP?.[skillId] || 0) + item.xpAmount };
    }

    get().updateData({
        inventory: newInv,
        bonusXP: { ...(state.data.bonusXP || {}), ...xpUpdates }
    });
    return { success: true, message: `Used ${item.name}` };
  },
}));