import React from 'react';
import { 
  Shield, TrendingUp, DollarSign, Lock, Activity, Home, Layers, CheckCircle, 
  Circle, AlertTriangle, User, Trophy, Zap, Star, Code, Cpu, Hammer, Pickaxe, 
  Sprout, Sparkles, Briefcase, X, Sword, Heart, Target, Users, LayoutDashboard, 
  ArrowRight, ArrowLeft, Flame, Edit3, Eye, EyeOff, Save, HelpCircle, Grid, List, 
  BookOpen, ChevronRight, ChevronLeft, Lock as LockIcon, Unlock, Droplet, Brain, Smile, Package, 
  Coffee, Smartphone, Monitor, CreditCard, Map, Scroll, FileKey, Dumbbell, Camera, 
  PenTool, Car, ShoppingBag, Plus, Headphones, Armchair, Book, HardDrive, Glasses, 
  Coins, Tag, Box, Dna, Hexagon, Server, Globe, Wifi, Database, Key, MousePointer, 
  GripVertical, Settings, Sliders, Crown, Gift, Building, Landmark, Gavel, Filter, 
  Watch, Mic, Library, Archive, Trash2, Utensils, Bed, Bath, Wrench, Play, Pause,
  Maximize, RotateCcw, PanelRightOpen, PanelRightClose, Crosshair, RefreshCw, Construction,
  Menu, Truck, Search
} from 'lucide-react';

// --- ICON MAPPING ---
export const IconMap = {
  Shield, TrendingUp, DollarSign, Lock, Activity, Home, Layers, CheckCircle, Circle, 
  AlertTriangle, User, Trophy, Zap, Star, Code, Cpu, Hammer, Pickaxe, Sprout, Sparkles, 
  Briefcase, X, Sword, Heart, Target, Users, LayoutDashboard, ArrowRight, ArrowLeft, 
  Flame, Edit3, Eye, EyeOff, Save, HelpCircle, Grid, List, BookOpen, ChevronRight, 
  ChevronLeft, LockIcon, Unlock, Droplet, Brain, Smile, Package, Coffee, Smartphone, 
  Monitor, CreditCard, Map, Scroll, FileKey, Dumbbell, Camera, PenTool, Car, ShoppingBag, 
  Plus, Headphones, Armchair, Book, HardDrive, Glasses, Coins, Tag, Box, Dna, Hexagon, 
  Server, Globe, Wifi, Database, Key, MousePointer, GripVertical, Settings, Sliders, 
  Crown, Gift, Building, Landmark, Gavel, Filter, Watch, Mic, Library, Archive, Trash2, 
  Utensils, Bed, Bath, Wrench, Play, Pause, Maximize, RotateCcw, PanelRightOpen, 
  PanelRightClose, Crosshair, RefreshCw, Construction, Menu, Truck, Search
};

export const RenderIcon = ({ name, size = 16, className = "" }) => {
  const IconComponent = IconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
};

export const getXpRequiredForLevel = (level) => {
    return Math.floor(100 * (Math.pow(10, level / 25) - 1));
};

// --- THIS WAS THE MISSING/MISMATCHED EXPORT ---
export const getRarityColor = (rarity) => {
    switch(rarity) {
        case 'Mythic': return 'text-rose-400 border-rose-500/50 bg-rose-900/20';
        case 'Legendary': return 'text-amber-400 border-amber-500/50 bg-amber-900/20';
        case 'Epic': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
        case 'Rare': return 'text-blue-400 border-blue-500/50 bg-blue-900/20';
        case 'Uncommon': return 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20';
        default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }
};

export const getRarityGradient = (rarity) => {
    switch(rarity) {
        case 'Mythic': return 'from-rose-900/50 to-slate-900 border-rose-500/30';
        case 'Legendary': return 'from-amber-900/50 to-slate-900 border-amber-500/30';
        case 'Epic': return 'from-purple-900/50 to-slate-900 border-purple-500/30';
        case 'Rare': return 'from-blue-900/50 to-slate-900 border-blue-500/30';
        case 'Uncommon': return 'from-emerald-900/50 to-slate-900 border-emerald-500/30';
        default: return 'from-slate-800/50 to-slate-950 border-slate-700';
    }
};