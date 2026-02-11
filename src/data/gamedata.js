import { 
  Shield, TrendingUp, DollarSign, Lock, Activity, 
  Home, Layers, CheckCircle, Circle, 
  AlertTriangle, User, Trophy, Zap, Star, Code, 
  Cpu, Hammer, Pickaxe, Sprout, Sparkles,
  Briefcase, X, Sword, Heart, Target, Users,
  LayoutDashboard, ArrowRight, ArrowLeft, Flame, Edit3,
  Eye, EyeOff, Save, HelpCircle, Grid, List,
  BookOpen, ChevronRight, Droplet, Brain, Smile, Package, Coffee,
  Smartphone, Monitor, CreditCard, Map, Scroll,
  FileKey, Dumbbell, Camera, PenTool, Car, ShoppingBag, Plus,
  Headphones, Armchair, Book, HardDrive, Glasses, Coins, Tag,
  Box, Dna, Hexagon, Server, Globe, Wifi, Database, Key,
  MousePointer, GripVertical, Settings, Sliders, Crown, Gift,
  Building, Landmark, Gavel, Filter, Watch, Mic, Library, Archive,
  Trash2, Bed, Bath, Utensils, Wrench, Play, Pause, Aperture
} from 'lucide-react';

export const USER_NAME = "Justin";
export const CURRENT_VERSION = "v33.0"; 
export const INVENTORY_SLOTS = 28;
export const BANK_SLOTS = 50;
export const MAX_SKILL_LEVEL = 99;
export const TOTAL_SKILLS = 8; 

// --- GAME CONTENT DATABASES ---

export const SHOP_ITEMS = {
    boosters: [
        { id: 'xp_chip_s', name: 'XP Chip (S)', cost: 500, rarity: 'Common', iconName: 'Cpu', effect: '+100 XP to active skill', type: 'Booster', xpAmount: 100 },
        { id: 'xp_chip_m', name: 'XP Chip (M)', cost: 1200, rarity: 'Uncommon', iconName: 'Cpu', effect: '+500 XP to active skill', type: 'Booster', xpAmount: 500 },
        { id: 'xp_chip_l', name: 'XP Chip (L)', cost: 5000, rarity: 'Rare', iconName: 'Cpu', effect: '+2500 XP to active skill', type: 'Booster', xpAmount: 2500 },
    ],
    gear: [
        { id: 'deed_plot', name: 'Land Deed', cost: 10000, rarity: 'Rare', iconName: 'Map', effect: 'Unlocks 1 Estate Grid Slot', type: 'Deed', isDeed: true },
        { id: 'suit_mk1', name: 'Exo-Suit MK1', cost: 2500, rarity: 'Uncommon', iconName: 'Shield', effect: '+5% Physical Resistance', type: 'Gear' },
    ],
    packs: [
        { id: 'pack_starter', name: 'Starter Pack', cost: 1000, rarity: 'Common', iconName: 'Package', effect: 'Contains 3 random cards', type: 'Pack' },
        { id: 'pack_premium', name: 'Premium Pack', cost: 5000, rarity: 'Rare', iconName: 'Gift', effect: 'Contains 5 cards (1 Rare+)', type: 'Pack' },
    ],
    crates: [
        { id: 'crate_daily', name: 'Daily Supply', cost: 0, rarity: 'Common', iconName: 'Box', effect: 'Free resources every 24h', type: 'Crate', isDailyClaim: true },
        { id: 'crate_hourly', name: 'Hourly Drop', cost: 0, rarity: 'Uncommon', iconName: 'Clock', effect: 'Random item every 1h', type: 'Crate', isHourlyClaim: true },
    ]
};

export const CARD_DATABASE = {
    // Placeholder for card system
};

export const SKILL_DETAILS = {
    // Placeholder for skill definitions
};

// --- INITIAL STATE (Required by gamestore.js) ---

export const initialData = {
    discipline: 5000, // Brain Matter (BM)
    cash: 1000,       // Liquid Assets
    salvage: 50,      // Scrap/Resources
    inventory: new Array(INVENTORY_SLOTS).fill(null),
    bank: new Array(BANK_SLOTS).fill(null),
    cards: [],
    
    // Timestamps
    lastDailyClaim: 0,
    lastHourlyClaim: 0,
    
    // Experience
    bonusXP: {},
    
    // Estate State
    estate: {
        gridDimension: 4,
        grid: new Array(16).fill(null)
    },
    
    // Stats
    statistics: {
        itemsBought: 0,
        timePlayed: 0
    },

    // Logistics / Nodes
    assets: {
        realEstate: 5000,
        digitalIP: 2500,
        crypto: 1000
    },
    wellness: {
        energy: 100,
        focus: 100
    },
    monthlyIncome: 15000,
    achievements: []
};

// --- ESTATE CONSTANTS ---
export const PLOT_SQUARE_FOOTAGE = 2500;
export const PLOT_COST = 5000;
export const PLOT_DIMENSION_M = 50;
export const MAX_GRID_DIMENSION = 8;
export const EXPANSION_TIERS = [
    { size: 2, cost: 0, desc: 'Initial Grant' },
    { size: 3, cost: 5000, desc: 'Sector Expansion A' },
    { size: 4, cost: 15000, desc: 'Sector Expansion B' },
    { size: 5, cost: 40000, desc: 'District License' },
    { size: 6, cost: 100000, desc: 'Regional Authority' },
    { size: 7, cost: 250000, desc: 'Governor Access' },
    { size: 8, cost: 1000000, desc: 'Sovereign Domain' }
];

export const DEFAULT_ESTATE_ITEMS = [
    { id: 'module_dorm', name: 'M-Dorm', cost: 1000, icon: 'Bed', desc: 'Basic sleeping quarters.', type: 'Habitation', category: 'Build', sqft: 500, length: 20, width: 25 },
    { id: 'module_kitchen', name: 'M-Kitchen', cost: 3000, icon: 'Utensils', desc: 'Modular sustenance unit.', type: 'Sustenance', category: 'Build', sqft: 2500, length: 50, width: 50 },
    { id: 'plot_deed_special', name: 'Sector Deed', cost: 5000, icon: 'Map', desc: 'Unlocks a new grid slot.', type: 'Deed', category: 'Deeds', isDeed: true }
];