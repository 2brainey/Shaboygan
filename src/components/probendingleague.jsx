import React, { useEffect, useRef } from 'react';

// --- GLOBAL STATE ---
// Now attempts to load from localStorage on initial boot
let PB_State = JSON.parse(localStorage.getItem('pb_league_save_v1')) || {
    initialized: false,
    view: 'init',
    user: {
        teamName: "Unregistered Team",
        packs: 1, 
        currency: { bronze: 0, silver: 0, gold: 0 },
        collection: { benders: [], moves: [], logos: [], franchises: [] },
        roster: { logo: null, active: [null, null, null], alternate: null, moves: {} },
        record: { w: 0, l: 0 }
    },
    league: [], 
    tempPack: [],
    tempChar: { name: '', element: 'water' },
    arenaMatch: null 
};

// --- DATA CONSTANTS ---
const ELEMENTS = {
    WATER: { id: 'water', name: 'Water', color: 'text-blue-400', bg: 'art-water', icon: 'fa-water', border: 'border-blue-500' },
    EARTH: { id: 'earth', name: 'Earth', color: 'text-green-400', bg: 'art-earth', icon: 'fa-mountain', border: 'border-green-500' },
    FIRE: { id: 'fire', name: 'Fire', color: 'text-red-400', bg: 'art-fire', icon: 'fa-fire', border: 'border-red-500' },
    AIR: { id: 'air', name: 'Air', color: 'text-teal-300', bg: 'art-air', icon: 'fa-wind', border: 'border-teal-400' }
};

const SUB_BENDING = {
    NONE: { name: '', icon: '' },
    METAL: { name: 'Metal', icon: 'fa-cube' },
    LAVA: { name: 'Lava', icon: 'fa-volcano' },
    SAND: { name: 'Sand', icon: 'fa-hourglass' },
    LIGHTNING: { name: 'Lightning', icon: 'fa-bolt' },
    COMBUSTION: { name: 'Combustion', icon: 'fa-bomb' },
    HEALING: { name: 'Healing', icon: 'fa-plus-circle' },
    BLOOD: { name: 'Blood', icon: 'fa-droplet' },
    SPIRIT: { name: 'Spirit', icon: 'fa-yin-yang' },
    FLIGHT: { name: 'Flight', icon: 'fa-feather' }
};

// HELPER: Calculate OVR (1-99)
const calcOvr = (p, s, c) => Math.floor((p + s + c) / 3);

const CARDS_DB = {
    BENDERS: [
        // LEGENDARIES
        { id: 'b_korra', name: 'Korra', element: 'water', rarity: 'legendary', power: 95, stability: 90, control: 75, potential: 99, sub: 'HEALING', desc: 'The Avatar.' },
        { id: 'b_tenzin', name: 'Tenzin', element: 'air', rarity: 'legendary', power: 85, stability: 95, control: 100, potential: 95, sub: 'NONE', desc: 'Air Bending Master.' },
        { id: 'b_lin', name: 'Lin Beifong', element: 'earth', rarity: 'legendary', power: 90, stability: 85, control: 92, potential: 90, sub: 'METAL', desc: 'Chief of Police.' },
        
        // RARES
        { id: 'b_mako', name: 'Mako', element: 'fire', rarity: 'rare', power: 80, stability: 70, control: 90, potential: 88, sub: 'LIGHTNING', desc: 'Cool under fire.' },
        { id: 'b_bolin', name: 'Bolin', element: 'earth', rarity: 'rare', power: 75, stability: 85, control: 65, potential: 89, sub: 'LAVA', desc: 'Heavy hitter.' },
        { id: 'b_tahno', name: 'Tahno', element: 'water', rarity: 'rare', power: 70, stability: 75, control: 80, potential: 82, sub: 'NONE', desc: 'Wolfbat Captain.' },
        { id: 'b_jinora', name: 'Jinora', element: 'air', rarity: 'rare', power: 65, stability: 60, control: 85, potential: 94, sub: 'SPIRIT', desc: 'Spiritual Guide.' },
        { id: 'b_iroh2', name: 'General Iroh', element: 'fire', rarity: 'rare', power: 88, stability: 80, control: 85, potential: 91, sub: 'LIGHTNING', desc: 'United Forces General.' },

        // COMMONS
        { id: 'b_kai', name: 'Kai', element: 'air', rarity: 'common', power: 55, stability: 40, control: 60, potential: 80, sub: 'NONE', desc: 'Slippery thief turned bender.' },
        { id: 'b_opal', name: 'Opal', element: 'air', rarity: 'common', power: 50, stability: 55, control: 65, potential: 85, sub: 'NONE', desc: 'Natural talent.' },
        { id: 'b_rookie_w', name: 'Water Rookie', element: 'water', rarity: 'common', power: 45, stability: 50, control: 40, potential: 60, sub: 'NONE', desc: 'Promising talent.' },
        { id: 'b_rookie_e', name: 'Earth Rookie', element: 'earth', rarity: 'common', power: 50, stability: 55, control: 35, potential: 60, sub: 'NONE', desc: 'Solid stance.' },
        { id: 'b_rookie_f', name: 'Fire Rookie', element: 'fire', rarity: 'common', power: 55, stability: 40, control: 45, potential: 60, sub: 'NONE', desc: 'Hot headed.' },
        { id: 'b_hasook', name: 'Hasook', element: 'water', rarity: 'common', power: 50, stability: 60, control: 50, potential: 65, sub: 'NONE', desc: 'Reliable.' },
    ],
    MOVES: [
        { id: 'm_whip', name: 'Water Whip', element: 'water', type: 'aggressive', powerMod: 1.2, desc: 'Basic strike.' },
        { id: 'm_wall', name: 'Ice Wall', element: 'water', type: 'defensive', powerMod: 0.5, desc: 'Block incoming.' },
        { id: 'm_disc', name: 'Earth Disc', element: 'earth', type: 'aggressive', powerMod: 1.3, desc: 'Standard projectile.' },
        { id: 'm_rock', name: 'Rock Armor', element: 'earth', type: 'defensive', powerMod: 0.4, desc: 'Absorb impact.' },
        { id: 'm_blast', name: 'Fire Blast', element: 'fire', type: 'aggressive', powerMod: 1.4, desc: 'High damage.' },
        { id: 'm_dodge', name: 'Flame Dodge', element: 'fire', type: 'tactical', powerMod: 0.8, desc: 'Evasive maneuver.' },
        { id: 'm_air_scooter', name: 'Air Scooter', element: 'air', type: 'tactical', powerMod: 0.9, desc: 'Superior mobility.' },
        { id: 'm_air_blast', name: 'Air Blast', element: 'air', type: 'aggressive', powerMod: 1.1, desc: 'Knockback focus.' },
    ],
    FRANCHISES: [
        { id: 'f_ferrets', name: 'Fire Ferrets', rarity: 'rare', desc: 'The underdogs of Republic City.' },
        { id: 'f_wolfbats', name: 'Wolfbats', rarity: 'rare', desc: 'Reigning champions. Ruthless.' },
        { id: 'f_boars', name: 'Boar-q-pines', rarity: 'common', desc: 'Oldest team in the league.' },
        { id: 'f_badgers', name: 'Badgermoles', rarity: 'common', desc: 'Earth kingdom powerhouse.' },
        { id: 'f_spirits', name: 'Republic Spirits', rarity: 'legendary', desc: 'New age bending team.' },
        { id: 'f_kyoshi', name: 'Kyoshi Warriors', rarity: 'epic', desc: 'Traditional and disciplined.' },
        { id: 'f_red_lotus', name: 'Red Lotus', rarity: 'legendary', desc: 'Anarchist bending group.' },
        { id: 'f_air_acolytes', name: 'Air Acolytes', rarity: 'common', desc: 'Preservers of culture.' }
    ]
};

// --- FULL LEAGUE ROSTER ---
const AI_TEAM_NAMES = [
    'Wolfbats', 'Boar-q-pines', 'Tigerdillos', 'Platypus Bears', 
    'Buzzard Wasps', 'Raven Eagles', 'Elephant Kois', 'Spider Flies'
];

export default function ProBendingLeague() {
    const containerRef = useRef(null);

    // --- SAVE HELPER ---
    const saveData = () => {
        localStorage.setItem('pb_league_save_v1', JSON.stringify(PB_State));
    };

    useEffect(() => {
        // --- ATTACH GLOBALS ---
        window.selectElement = (elem) => {
            PB_State.tempChar.element = elem;
            ['water', 'earth', 'fire', 'air'].forEach(e => {
                const btn = document.getElementById(`btn-${e}`);
                if (!btn) return;
                const config = ELEMENTS[e.toUpperCase()];
                if(e === elem) {
                    btn.classList.add('ring-2', 'ring-yellow-500', config.border);
                    btn.classList.remove('border-slate-600', 'bg-slate-800');
                } else {
                    btn.classList.remove('ring-2', 'ring-yellow-500', config.border);
                    btn.classList.add('border-slate-600', 'bg-slate-800');
                }
            });
        };

        window.renderDashboard = renderDashboard;
        window.renderCharCreation = renderCharCreation;
        window.createCustomChar = createCustomChar;
        window.renderRoster = renderRoster;
        window.renderLeaderboard = renderLeaderboard;
        window.openRandomPack = openRandomPack;
        window.startArena = startArena;
        window.viewTeam = viewTeam; 
        window.closeModal = closeModal; 
        window.sellDuplicate = sellDuplicate; 
        
        window.unequip = (idx) => { 
            PB_State.user.roster.active[idx] = null; 
            renderRoster(); 
            saveData();
        };
        
        window.equipMove = (uid, mid) => { 
            PB_State.user.roster.moves[uid] = mid; 
            saveData();
        };
        
        window.allowDrop = (ev) => ev.preventDefault();
        window.drag = (ev, uid) => ev.dataTransfer.setData("text", uid);
        window.drop = (ev, type, idx) => {
            ev.preventDefault();
            const uid = ev.dataTransfer.getData("text");
            if (PB_State.user.roster.active.includes(uid)) PB_State.user.roster.active[PB_State.user.roster.active.indexOf(uid)] = null;
            if (PB_State.user.roster.alternate === uid) PB_State.user.roster.alternate = null;
            if (type === 'active') PB_State.user.roster.active[idx] = uid;
            if (type === 'alt') PB_State.user.roster.alternate = uid;
            renderRoster();
            saveData();
        };

        // --- GAME LOGIC ---

        function initLeague() {
            if (PB_State.league.length > 0) return;
            
            // Filter AI teams so we don't have duplicate Franchise names
            const availableAI = AI_TEAM_NAMES.filter(name => name !== PB_State.user.teamName);

            PB_State.league = availableAI.map(name => {
                const roster = [];
                for(let i=0; i<3; i++) {
                    const base = CARDS_DB.BENDERS[Math.floor(Math.random() * CARDS_DB.BENDERS.length)];
                    roster.push({ 
                        ...base, 
                        uid: `ai_${name}_${i}`, 
                        power: Math.min(99, base.power + Math.floor(Math.random() * 5)),
                        stability: Math.min(99, base.stability + Math.floor(Math.random() * 5)),
                        control: Math.min(99, base.control + Math.floor(Math.random() * 5)),
                        ovr: calcOvr(base.power, base.stability, base.control)
                    });
                }
                const teamOvr = Math.floor(roster.reduce((a,b) => a + b.ovr, 0) / 3);
                
                return { 
                    name, 
                    w: Math.floor(Math.random() * 3), 
                    l: Math.floor(Math.random() * 3), 
                    roster,
                    rank: teamOvr > 80 ? 'Elite' : 'Pro',
                    ovr: teamOvr
                };
            });
            saveData();
        }

        function createBenderInstance(baseId, customData = null) {
            let base = CARDS_DB.BENDERS.find(b => b.id === baseId) || CARDS_DB.BENDERS[0];
            if (customData) {
                base = {
                    id: 'b_custom', name: customData.name, element: customData.element,
                    rarity: 'rare', power: 55, stability: 55, potential: 95, control: 45,
                    sub: 'NONE', desc: 'The rookie with a dream.'
                };
            }
            const ovr = calcOvr(base.power, base.stability, base.control);
            return { ...base, uid: Math.random().toString(36).substr(2, 9), xp: 0, ovr };
        }

        function createCustomChar() {
            const nameInput = document.getElementById('char-name-input');
            const name = nameInput ? (nameInput.value.trim() || "Rookie") : "Rookie";
            const element = PB_State.tempChar.element;
            const playerChar = createBenderInstance(null, { name, element });
            openStarterPack(playerChar);
        }

        function openStarterPack(playerChar) {
            const franchise = CARDS_DB.FRANCHISES[Math.floor(Math.random() * CARDS_DB.FRANCHISES.length)];
            PB_State.user.teamName = franchise.name;

            const pack = [
                playerChar,
                franchise, 
                createBenderInstance('b_korra'),
                createBenderInstance('b_bolin'),
                createBenderInstance('b_mako'),
                CARDS_DB.MOVES.find(m => m.id === 'm_whip'),
                CARDS_DB.MOVES.find(m => m.id === 'm_blast'),
                CARDS_DB.MOVES.find(m => m.id === 'm_disc'),
            ];
            PB_State.tempPack = pack;
            
            pack.forEach(item => {
                if (item.power !== undefined) PB_State.user.collection.benders.push(item);
                else if (item.powerMod) PB_State.user.collection.moves.push(item);
                else PB_State.user.collection.franchises.push(item);
            });
            
            PB_State.user.roster.active = [playerChar.uid, pack[2].uid, pack[4].uid]; 
            PB_State.user.roster.alternate = pack[3].uid; 
            
            // KEY FIX: Initialize league immediately after setting up user
            initLeague();
            saveData();
            
            renderPackReveal(true);
        }

        function openRandomPack() {
            if (PB_State.user.packs <= 0) return;
            PB_State.user.packs--;
            const pack = [];
            for(let i=0; i<4; i++) { 
                const roll = Math.random();
                if (roll < 0.5) { 
                    const base = CARDS_DB.BENDERS[Math.floor(Math.random() * CARDS_DB.BENDERS.length)];
                    const inst = createBenderInstance(base.id);
                    pack.push(inst);
                    PB_State.user.collection.benders.push(inst);
                } else if (roll < 0.8) { 
                    const move = CARDS_DB.MOVES[Math.floor(Math.random() * CARDS_DB.MOVES.length)];
                    pack.push(move);
                    PB_State.user.collection.moves.push(move);
                } else { 
                    const fran = CARDS_DB.FRANCHISES[Math.floor(Math.random() * CARDS_DB.FRANCHISES.length)];
                    pack.push(fran);
                    PB_State.user.collection.franchises.push(fran);
                }
            }
            PB_State.tempPack = pack;
            saveData();
            renderPackReveal(false);
        }

        function sellDuplicate(uid, rarity) {
            let currency = 'bronze';
            let amount = 100;
            if(rarity === 'rare') { currency = 'silver'; amount = 50; }
            if(rarity === 'legendary') { currency = 'gold'; amount = 10; }
            
            PB_State.user.currency[currency] += amount;
            
            const idx = PB_State.user.collection.benders.findIndex(b => b.uid === uid);
            if(idx > -1) PB_State.user.collection.benders.splice(idx, 1);
            
            saveData();
            renderRoster(); 
        }

        // --- RENDERERS ---

        function renderWelcome() {
            if (!containerRef.current) return;
            containerRef.current.innerHTML = `
                <div class="h-full flex items-center justify-center bg-black/80 z-50 rounded-xl overflow-hidden relative">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div class="text-center relative z-10">
                        <h1 class="font-sport text-6xl text-yellow-500 mb-4 tracking-widest drop-shadow-lg">PRO-BENDING LEAGUE</h1>
                        <p class="mb-8 text-xl text-slate-300">Assemble your team. Rise through the ranks.</p>
                        <button onclick="renderCharCreation()" class="btn-primary px-12 py-6 text-2xl rounded shadow-[0_0_20px_#facc15]">
                            BEGIN CAREER
                        </button>
                    </div>
                </div>
            `;
        }

        function renderCharCreation() {
            if (!containerRef.current) return;
            PB_State.tempChar.element = 'water';
            containerRef.current.innerHTML = `
                <div class="h-full flex items-center justify-center bg-slate-900 z-50">
                    <div class="glass-panel p-8 rounded-xl max-w-2xl w-full">
                        <h2 class="font-sport text-3xl text-white mb-6 text-center">CREATE YOUR PRO-BENDER</h2>
                        <div class="mb-6">
                            <label class="block text-slate-400 text-sm mb-2">NAME</label>
                            <input id="char-name-input" type="text" placeholder="Enter Name" maxlength="12"
                                class="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white font-sport tracking-wide focus:border-yellow-500 outline-none">
                        </div>
                        <div class="mb-8">
                            <label class="block text-slate-400 text-sm mb-2">ORIGIN ELEMENT</label>
                            <div class="grid grid-cols-4 gap-4">
                                <button onclick="selectElement('water')" id="btn-water" class="p-4 border-2 border-blue-500 bg-blue-900/20 rounded flex flex-col items-center gap-2 ring-2 ring-yellow-500 transition-all hover:bg-blue-900/40">
                                    <i class="fa-solid fa-water text-2xl text-blue-400"></i>
                                    <span class="text-xs font-bold text-blue-300">WATER</span>
                                </button>
                                <button onclick="selectElement('earth')" id="btn-earth" class="p-4 border-2 border-slate-600 bg-slate-800 rounded flex flex-col items-center gap-2 transition-all hover:bg-green-900/40">
                                    <i class="fa-solid fa-mountain text-2xl text-green-400"></i>
                                    <span class="text-xs font-bold text-green-300">EARTH</span>
                                </button>
                                <button onclick="selectElement('fire')" id="btn-fire" class="p-4 border-2 border-slate-600 bg-slate-800 rounded flex flex-col items-center gap-2 transition-all hover:bg-red-900/40">
                                    <i class="fa-solid fa-fire text-2xl text-red-400"></i>
                                    <span class="text-xs font-bold text-red-300">FIRE</span>
                                </button>
                                <button onclick="selectElement('air')" id="btn-air" class="p-4 border-2 border-slate-600 bg-slate-800 rounded flex flex-col items-center gap-2 transition-all hover:bg-teal-900/40">
                                    <i class="fa-solid fa-wind text-2xl text-teal-400"></i>
                                    <span class="text-xs font-bold text-teal-300">AIR</span>
                                </button>
                            </div>
                        </div>
                        <button onclick="createCustomChar()" class="btn-primary w-full py-4 rounded text-xl shadow-lg">
                            CONFIRM & OPEN STARTER PACK
                        </button>
                    </div>
                </div>
            `;
        }

        function renderPackReveal(isStarter) {
            if (!containerRef.current) return;
            const cardsHtml = PB_State.tempPack.map((card, idx) => {
                const isBender = card.power !== undefined;
                const isMove = card.powerMod !== undefined;
                const isFran = !isBender && !isMove;
                const type = isBender ? 'BENDER' : (isMove ? 'ABILITY' : 'FRANCHISE');
                let rarityClass = card.rarity || 'common';
                let elemConfig = ELEMENTS[card.element ? card.element.toUpperCase() : 'FIRE'];
                if (isFran) elemConfig = { color: 'text-purple-400', bg: 'bg-slate-800', icon: 'fa-shield-halved' };
                if (!card.element && isMove) elemConfig = { color: 'text-yellow-500', bg: 'bg-slate-800', icon: 'fa-scroll' };

                let artContent = '';
                if (isBender) {
                    artContent = `<div class="relative"><i class="fa-solid ${elemConfig.icon} text-6xl text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"></i><div class="absolute -bottom-8 -right-8 text-4xl font-sport text-white opacity-20">${card.ovr}</div></div>`;
                    if (card.sub && card.sub !== 'NONE') artContent += `<div class="sub-bending-badge" title="Affinity: ${SUB_BENDING[card.sub].name}"><i class="fa-solid ${SUB_BENDING[card.sub].icon}"></i></div>`;
                } else if (isMove) {
                    artContent = `<i class="fa-solid fa-scroll text-5xl text-slate-200 opacity-80"></i>`;
                } else {
                    artContent = `<i class="fa-solid fa-users-rectangle text-5xl ${card.rarity === 'legendary' ? 'text-yellow-400' : 'text-slate-300'}"></i>`;
                }

                return `
                    <div class="card w-56 h-80 mx-2 opacity-0 card-reveal ${rarityClass} ${card.element || ''}" style="animation-delay: ${idx * 0.15}s">
                        <div class="card-inner w-full h-full bg-slate-800 relative">
                            <div class="h-8 flex justify-between items-center px-3 bg-black/20">
                                <span class="text-[10px] font-bold text-slate-400 tracking-wider">${type}</span>
                                <span class="text-[10px] ${elemConfig.color}"><i class="fa-solid ${elemConfig.icon}"></i></span>
                            </div>
                            <div class="card-art ${elemConfig.bg || 'bg-slate-700'}">
                                <div class="art-pattern"></div>
                                ${artContent}
                            </div>
                            <div class="p-3 flex-1 flex flex-col justify-between">
                                <div class="text-center">
                                    <div class="font-sport text-lg text-white leading-none mb-1">${card.name}</div>
                                    <div class="text-[10px] text-slate-400 italic leading-tight">${card.desc || ''}</div>
                                </div>
                                ${isBender ? `
                                    <div class="mt-2 bg-black/30 p-2 rounded text-[9px] text-slate-400 relative">
                                        <div class="absolute -top-3 right-0 bg-slate-900 border border-slate-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-sport text-sm">${card.ovr}</div>
                                        <div class="flex items-center gap-1 mb-1"><span class="w-6">POW</span><div class="flex-1 h-1 bg-slate-700 rounded"><div class="bg-red-400 h-full" style="width:${card.power}%"></div></div></div>
                                        <div class="flex items-center gap-1 mb-1"><span class="w-6">STB</span><div class="flex-1 h-1 bg-slate-700 rounded"><div class="bg-green-400 h-full" style="width:${card.stability}%"></div></div></div>
                                        <div class="flex items-center gap-1"><span class="w-6">CTL</span><div class="flex-1 h-1 bg-slate-700 rounded"><div class="bg-blue-400 h-full" style="width:${card.control}%"></div></div></div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            containerRef.current.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center bg-slate-900/95 z-50 overflow-y-auto py-10">
                    <h2 class="font-sport text-4xl text-white mb-8 sticky top-0 bg-slate-900/95 py-4 z-50">PACK OPENED!</h2>
                    <div class="flex flex-wrap justify-center gap-4 mb-12 max-w-6xl">
                        ${cardsHtml}
                    </div>
                    <button onclick="renderDashboard()" class="btn-primary px-8 py-3 rounded text-xl sticky bottom-4 shadow-2xl">
                        CONTINUE TO DASHBOARD
                    </button>
                </div>
            `;
        }

        function renderDashboard() {
            if (!containerRef.current) return;
            const { bronze, silver, gold } = PB_State.user.currency;
            
            containerRef.current.innerHTML = `
                <div class="h-full grid grid-cols-12 gap-0">
                    <div class="col-span-2 bg-slate-900 border-r border-slate-700 flex flex-col p-4">
                        <div class="mb-8 flex items-center gap-2">
                            <i class="fa-solid fa-trophy text-yellow-500 text-2xl"></i>
                            <div>
                                <h2 class="font-sport text-xl leading-none">PBL MANAGER</h2>
                                <span class="text-xs text-slate-500">Season 1</span>
                            </div>
                        </div>
                        <div class="mb-6 p-3 bg-black/40 rounded border border-slate-700">
                            <div class="text-[10px] text-slate-400 uppercase mb-2">Team Funds</div>
                            <div class="flex justify-between text-xs mb-1"><span class="text-yellow-400"><i class="fa-solid fa-coins"></i> Gold</span> <span>${gold}</span></div>
                            <div class="flex justify-between text-xs mb-1"><span class="text-slate-300"><i class="fa-solid fa-coins"></i> Silver</span> <span>${silver}</span></div>
                            <div class="flex justify-between text-xs"><span class="text-orange-700"><i class="fa-solid fa-coins"></i> Bronze</span> <span>${bronze}</span></div>
                        </div>
                        <nav class="flex-1 flex flex-col gap-2">
                            <button onclick="renderDashboard()" class="text-left px-4 py-3 bg-slate-800 text-yellow-500 rounded font-sport tracking-wide border-l-4 border-yellow-500">
                                <i class="fa-solid fa-chart-line w-6"></i> DASHBOARD
                            </button>
                            <button onclick="renderRoster()" class="text-left px-4 py-3 hover:bg-slate-800 text-slate-300 rounded font-sport tracking-wide transition">
                                <i class="fa-solid fa-users w-6"></i> ROSTER
                            </button>
                            <button onclick="renderLeaderboard()" class="text-left px-4 py-3 hover:bg-slate-800 text-slate-300 rounded font-sport tracking-wide transition">
                                <i class="fa-solid fa-list-ol w-6"></i> LEAGUE
                            </button>
                        </nav>
                    </div>
                    <div class="col-span-10 p-8 overflow-y-auto bg-slate-950">
                        <div class="flex justify-between items-end mb-8">
                            <div>
                                <h1 class="font-sport text-4xl text-white uppercase">${PB_State.user.teamName}</h1>
                                <p class="text-slate-400">Manage your franchise and prepare for the next bout.</p>
                            </div>
                            <div class="flex gap-4">
                                ${PB_State.user.packs > 0 ? `
                                    <button onclick="openRandomPack()" class="pack-shake btn-primary px-6 py-2 rounded shadow-lg animate-pulse">
                                        OPEN PACK (${PB_State.user.packs})
                                    </button>
                                ` : `<div class="px-6 py-2 bg-slate-800 rounded text-slate-500 border border-slate-700">NO PACKS</div>`}
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-6">
                            <div class="col-span-2 glass-panel rounded-xl p-6 relative overflow-hidden group">
                                <div class="absolute inset-0 bg-[url('https://cdna.artstation.com/p/assets/images/images/007/046/218/large/adrian-wolfe-probending-arena-concept.jpg')] bg-cover opacity-30 group-hover:opacity-40 transition"></div>
                                <div class="relative z-10 flex justify-between items-center h-full">
                                    <div>
                                        <div class="text-yellow-500 font-sport text-lg mb-1">NEXT MATCHUP</div>
                                        <h2 class="text-3xl font-bold mb-4">VS. WOLFBATS</h2>
                                        <div class="text-sm text-slate-300 max-w-md">The Wolfbats are current reigning champions.</div>
                                    </div>
                                    <button onclick="startArena()" class="btn-primary px-8 py-4 text-xl rounded-lg shadow-2xl">ENTER ARENA</button>
                                </div>
                            </div>
                            <div class="col-span-1 glass-panel rounded-xl p-6">
                                <div class="text-slate-400 font-sport text-sm mb-4">ACTIVE LINEUP</div>
                                <div class="flex flex-col gap-3">
                                    ${PB_State.user.roster.active.map((uid) => {
                                        const bender = PB_State.user.collection.benders.find(b => b.uid === uid);
                                        if(!bender) return '<div class="h-12 border-2 border-dashed border-slate-600 rounded flex items-center justify-center text-slate-600 text-[10px]">EMPTY SLOT</div>';
                                        const elemConfig = ELEMENTS[bender.element.toUpperCase()];
                                        return `
                                            <div class="flex items-center gap-3 bg-slate-800/50 p-2 rounded border border-slate-700">
                                                <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center ${elemConfig.color} font-bold text-xs"><i class="fa-solid ${elemConfig.icon}"></i></div>
                                                <div>
                                                    <div class="font-sport leading-none text-white">${bender.name}</div>
                                                    <div class="text-[10px] text-slate-400 font-bold text-yellow-500">OVR: ${bender.ovr}</div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <button onclick="renderRoster()" class="w-full mt-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-300">EDIT ROSTER</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderRoster() {
            if (!containerRef.current) return;
            const renderCardList = (list) => list.map(b => {
                const elemConfig = ELEMENTS[b.element.toUpperCase()];
                const isDuplicate = list.filter(item => item.id === b.id).length > 1;
                let sellVal = 100; let sellCurr = 'Bronze'; let sellColor = 'text-orange-700';
                if(b.rarity === 'rare') { sellVal = 50; sellCurr = 'Silver'; sellColor = 'text-slate-300'; }
                if(b.rarity === 'legendary') { sellVal = 10; sellCurr = 'Gold'; sellColor = 'text-yellow-400'; }

                return `
                <div draggable="true" ondragstart="drag(event, '${b.uid}')" class="bg-slate-800 p-3 rounded border border-slate-600 cursor-grab hover:bg-slate-700 transition flex items-center gap-3 group relative">
                    <div class="w-8 h-8 rounded bg-slate-900 flex items-center justify-center ${elemConfig.color}">
                        <i class="fa-solid ${elemConfig.icon}"></i>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-sm flex justify-between text-white">
                            ${b.name}
                            <span class="text-yellow-500 font-sport text-sm">${b.ovr}</span>
                        </div>
                        <div class="text-[9px] text-slate-400 grid grid-cols-2 gap-x-2">
                           <span>POW: ${b.power}</span> <span>STB: ${b.stability}</span>
                        </div>
                    </div>
                    ${isDuplicate ? `
                        <button onclick="sellDuplicate('${b.uid}', '${b.rarity}')" class="absolute right-2 top-2 bg-slate-900 border border-slate-600 p-1 rounded text-[9px] hover:bg-red-900 hover:border-red-500 hover:text-white transition group-hover:opacity-100 opacity-0" title="Sell Duplicate">
                            <i class="fa-solid fa-coins ${sellColor}"></i> +${sellVal}
                        </button>
                    ` : ''}
                </div>
            `}).join('');

            containerRef.current.innerHTML = `
                <div class="h-full flex flex-col p-8 bg-slate-900">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="font-sport text-3xl text-white">ROSTER MANAGEMENT</h1>
                        <button onclick="renderDashboard()" class="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-white">BACK</button>
                    </div>
                    <div class="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
                        <div class="col-span-4 bg-slate-800/50 rounded-xl p-4 flex flex-col border border-slate-700">
                            <h3 class="font-sport text-yellow-500 mb-4">BENCH (${PB_State.user.collection.benders.length})</h3>
                            <div class="overflow-y-auto flex-1 flex flex-col gap-2 pr-2 custom-scrollbar">
                                ${renderCardList(PB_State.user.collection.benders)}
                            </div>
                        </div>
                        <div class="col-span-8 flex flex-col gap-6">
                            <div class="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
                                <h3 class="font-sport text-white mb-4">STARTING LINEUP</h3>
                                <div class="grid grid-cols-3 gap-4">
                                    ${[0, 1, 2].map(i => {
                                        const uid = PB_State.user.roster.active[i];
                                        const bender = uid ? PB_State.user.collection.benders.find(b => b.uid === uid) : null;
                                        return `
                                            <div ondrop="drop(event, 'active', ${i})" ondragover="allowDrop(event)" 
                                                class="h-56 rounded-lg border-2 border-dashed ${bender ? 'border-solid border-yellow-600 bg-slate-800' : 'border-slate-600 bg-slate-900/50'} flex flex-col items-center justify-center relative group p-2">
                                                ${bender ? `
                                                    <div class="absolute top-2 right-2 font-sport text-xl text-yellow-500">${bender.ovr}</div>
                                                    <div class="text-4xl mb-1 ${ELEMENTS[bender.element.toUpperCase()].color}"><i class="fa-solid ${ELEMENTS[bender.element.toUpperCase()].icon}"></i></div>
                                                    <div class="font-sport text-xl text-center leading-none mb-2 text-white">${bender.name}</div>
                                                    <button onclick="unequip(${i})" class="text-red-500 text-xs hover:text-red-400 font-bold mb-2">REMOVE</button>
                                                ` : '<span class="text-slate-500 text-xs">DRAG BENDER HERE</span>'}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderLeaderboard() {
            if (!containerRef.current) return;
            // Calculate User OVR
            const userOvr = Math.floor(PB_State.user.roster.active.reduce((acc, uid) => {
                const b = PB_State.user.collection.benders.find(x => x.uid === uid);
                return acc + (b ? b.ovr : 0);
            }, 0) / 3) || 0;

            const userEntry = { 
                name: PB_State.user.teamName, 
                w: PB_State.user.record.w, 
                l: PB_State.user.record.l, 
                isUser: true, 
                ovr: userOvr,
                roster: PB_State.user.roster.active.map(uid => PB_State.user.collection.benders.find(b => b.uid === uid)).filter(Boolean) 
            };
            const allTeams = [...PB_State.league, userEntry].sort((a, b) => b.w - a.w);

            containerRef.current.innerHTML = `
                 <div class="h-full flex flex-col p-8 bg-slate-900">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="font-sport text-3xl text-yellow-500">LEAGUE STANDINGS</h1>
                        <button onclick="renderDashboard()" class="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-white">BACK</button>
                    </div>
                    <div class="glass-panel rounded-xl overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-slate-800 text-slate-400 font-sport text-sm">
                                <tr>
                                    <th class="p-4">RANK</th>
                                    <th class="p-4">TEAM</th>
                                    <th class="p-4">OVR</th>
                                    <th class="p-4">WINS</th>
                                    <th class="p-4">LOSSES</th>
                                    <th class="p-4">WIN %</th>
                                    <th class="p-4">ACTION</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-700">
                                ${allTeams.map((t, i) => {
                                    const total = t.w + t.l;
                                    const pct = total === 0 ? 0 : Math.round((t.w / total) * 100);
                                    const rowClass = t.isUser ? 'bg-yellow-900/20 border-l-4 border-yellow-500' : '';
                                    const teamIdx = t.isUser ? -1 : PB_State.league.indexOf(t); 
                                    return `
                                        <tr class="${rowClass} hover:bg-white/5 transition">
                                            <td class="p-4 font-mono text-slate-500">#${i + 1}</td>
                                            <td class="p-4 font-bold cursor-pointer hover:text-blue-400 text-white" onclick="viewTeam(${teamIdx})">
                                                ${t.name} ${t.isUser ? '(YOU)' : ''}
                                            </td>
                                            <td class="p-4 text-yellow-500 font-bold font-sport">${t.ovr}</td>
                                            <td class="p-4 text-green-400 font-mono">${t.w}</td>
                                            <td class="p-4 text-red-400 font-mono">${t.l}</td>
                                            <td class="p-4 text-slate-400 font-mono">${pct}%</td>
                                            <td class="p-4">
                                                <button onclick="viewTeam(${teamIdx})" class="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 hover:text-white border border-slate-600">SCOUT</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="modal-container"></div>
            `;
        }

        function viewTeam(teamIdx) {
            const team = teamIdx === -1 
                ? { name: PB_State.user.teamName, roster: PB_State.user.roster.active.map(uid => PB_State.user.collection.benders.find(b => b.uid === uid)).filter(Boolean) }
                : PB_State.league[teamIdx];

            const modalHtml = `
                <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
                    <div class="bg-slate-900 border border-slate-600 p-6 rounded-xl max-w-2xl w-full shadow-2xl relative">
                        <button onclick="closeModal()" class="absolute top-4 right-4 text-slate-500 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                        <h2 class="font-sport text-3xl text-white mb-2 uppercase">${team.name}</h2>
                        <div class="text-xs text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">Scouting Report</div>
                        <div class="grid grid-cols-3 gap-4">
                            ${team.roster.map(b => {
                                const elemConfig = ELEMENTS[b.element.toUpperCase()];
                                return `
                                    <div class="bg-slate-800 p-3 rounded border border-slate-700 flex flex-col items-center text-center relative">
                                        <div class="absolute top-2 right-2 text-yellow-500 font-sport text-sm">${b.ovr}</div>
                                        <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center ${elemConfig.color} mb-2 text-lg border ${elemConfig.border}">
                                            <i class="fa-solid ${elemConfig.icon}"></i>
                                        </div>
                                        <div class="font-bold text-white mb-1 text-sm">${b.name}</div>
                                        <div class="text-[9px] text-slate-400 bg-slate-900 px-2 py-1 rounded w-full flex justify-between">
                                            <span>POW: ${b.power}</span><span>STB: ${b.stability}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
            const container = document.getElementById('modal-container');
            if(container) container.innerHTML = modalHtml;
        }

        function closeModal() {
            const container = document.getElementById('modal-container');
            if(container) container.innerHTML = '';
        }

        function startArena() {
            if (PB_State.user.roster.active.some(s => s === null)) { alert("Please fill roster!"); return; }
            
            const blueBenders = PB_State.user.roster.active.map(uid => {
                const d = PB_State.user.collection.benders.find(b => b.uid === uid);
                return { ...d, team: 'blue', zoneIndex: 2, isEliminated: false, maxStability: d.stability };
            });
            const redBenders = PB_State.league[0].roster.map(d => ({ ...d, team: 'red', zoneIndex: 3, isEliminated: false, maxStability: d.stability }));
            
            if(containerRef.current) {
                containerRef.current.innerHTML = `
                    <div class="h-full flex flex-col">
                        <header class="h-16 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-8 z-50">
                            <div class="font-sport text-blue-500 text-xl">${PB_State.user.teamName.toUpperCase()}</div>
                            <div class="bg-black border border-yellow-600 px-4 py-1 text-yellow-500 font-sport">ROUND <span id="round-counter">1</span></div>
                            <div class="font-sport text-red-500 text-xl">${PB_State.league[0].name.toUpperCase()}</div>
                        </header>
                        <main class="flex-1 relative flex flex-col justify-center overflow-hidden bg-gradient-to-b from-cyan-950 to-blue-900">
                            <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                            <div class="trapezoid-court h-96 w-full max-w-5xl mx-auto grid grid-cols-6 relative z-10">
                                <div id="zone-0" class="zone zone-blue-3 p-2 flex flex-col justify-center items-center gap-2"></div>
                                <div id="zone-1" class="zone zone-blue-2 p-2 flex flex-col justify-center items-center gap-2"></div>
                                <div id="zone-2" class="zone zone-blue-1 p-2 flex flex-col justify-center items-center gap-2 border-r-yellow-500"></div>
                                <div id="zone-3" class="zone zone-red-1 p-2 flex flex-col justify-center items-center gap-2"></div>
                                <div id="zone-4" class="zone zone-red-2 p-2 flex flex-col justify-center items-center gap-2"></div>
                                <div id="zone-5" class="zone zone-red-3 p-2 flex flex-col justify-center items-center gap-2"></div>
                            </div>
                        </main>
                        <footer class="h-48 bg-slate-900 border-t border-slate-700 flex p-4 gap-4 z-40">
                             <div id="tactic-selectors" class="flex-1 grid grid-cols-3 gap-4"></div>
                             <div class="w-48 flex flex-col gap-2">
                                <button onclick="window.matchInstance.playRound()" class="h-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-sport text-2xl rounded shadow-lg transition">EXECUTE</button>
                             </div>
                             <div id="combat-log" class="w-64 glass-panel rounded p-2 text-xs font-mono overflow-y-auto flex flex-col-reverse text-slate-400"></div>
                        </footer>
                    </div>
                `;
                window.matchInstance = new Match(blueBenders, redBenders);
            }
        }

        class Match {
            constructor(blue, red) { this.round=1; this.blue=blue; this.red=red; this.tactics={}; this.renderBoard(); this.renderControls(); this.log("FIGHT START!"); }
            
            log(m) { const el=document.getElementById('combat-log'); if(el) el.innerHTML=`<div>> ${m}</div>`+el.innerHTML; }
            
            renderBoard() {
                for(let i=0; i<6; i++) document.getElementById(`zone-${i}`).innerHTML='';
                [...this.blue, ...this.red].forEach(b => {
                    if(b.isEliminated) return;
                    const elC = ELEMENTS[b.element.toUpperCase()] || ELEMENTS.FIRE;
                    const div = document.createElement('div');
                    div.className = `bender-token w-full h-16 rounded flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-800 to-black border-l-4 ${elC.border}`;
                    div.innerHTML = `
                        <div class="flex items-center gap-2 z-10 text-white">
                            <i class="fa-solid ${elC.icon}"></i>
                            <span class="font-sport">${b.name}</span>
                            <span class="text-xs text-yellow-500 ml-1 font-bold">${b.ovr}</span>
                        </div>
                        <div class="absolute bottom-0 w-full h-1 bg-black"><div class="h-full bg-green-500" style="width:${(b.stability/b.maxStability)*100}%"></div></div>
                    `;
                    document.getElementById(`zone-${b.zoneIndex}`).appendChild(div);
                });
            }
            
            renderControls() {
                const con = document.getElementById('tactic-selectors');
                if(con) {
                    con.innerHTML = '';
                    this.blue.forEach(b => {
                        if(b.isEliminated) return;
                        if(!this.tactics[b.uid]) this.tactics[b.uid] = 'aggressive';
                        const div = document.createElement('div');
                        div.className = 'bg-slate-800 p-2 rounded border border-slate-600';
                        div.innerHTML = `
                            <div class="text-xs text-white mb-2 flex justify-between"><span>${b.name}</span> <span class="text-slate-400">STB: ${Math.floor(b.stability)}</span></div>
                            <div class="flex gap-2">
                                <button onclick="window.matchInstance.setTactic('${b.uid}','aggressive')" class="flex-1 bg-red-900 text-xs py-1 hover:bg-red-700 ${this.tactics[b.uid]==='aggressive' ? 'ring-1 ring-white':''}">ATK</button>
                                <button onclick="window.matchInstance.setTactic('${b.uid}','defensive')" class="flex-1 bg-blue-900 text-xs py-1 hover:bg-blue-700 ${this.tactics[b.uid]==='defensive' ? 'ring-1 ring-white':''}">DEF</button>
                            </div>
                        `;
                        con.appendChild(div);
                    });
                }
            }
            
            setTactic(uid, t) { this.tactics[uid] = t; this.renderControls(); }
            
            playRound() {
                const activeBlue = this.blue.filter(b=>!b.isEliminated);
                const activeRed = this.red.filter(b=>!b.isEliminated);
                
                // Blue Turn
                activeBlue.forEach(att => {
                    if(activeRed.length === 0) return;
                    const target = activeRed[Math.floor(Math.random()*activeRed.length)];
                    let dmg = (att.power / 5) + (Math.random() * 5); // Damage Calc
                    if(this.tactics[att.uid] === 'aggressive') dmg *= 1.2;
                    if(this.tactics[att.uid] === 'defensive') dmg *= 0.6;
                    
                    target.stability -= dmg;
                    this.log(`${att.name} hits ${target.name} for ${Math.floor(dmg)} stability.`);
                    
                    if(target.stability <= 0) {
                        target.stability = target.maxStability;
                        target.zoneIndex++;
                        this.log(`>>> ${target.name} KNOCKED BACK!`);
                        if(target.zoneIndex > 5) { target.isEliminated=true; this.log(`!!! ${target.name} ELIMINATED !!!`); }
                    }
                });

                // Red Turn (Simple AI)
                activeRed.forEach(att => {
                    if(activeBlue.length === 0) return;
                    const target = activeBlue[Math.floor(Math.random()*activeBlue.length)];
                    let dmg = (att.power / 5) + (Math.random() * 5);
                    target.stability -= dmg;
                    this.log(`${att.name} hits ${target.name} for ${Math.floor(dmg)} stability.`);
                    
                    if(target.stability <= 0) {
                        target.stability = target.maxStability;
                        target.zoneIndex--;
                        this.log(`>>> ${target.name} KNOCKED BACK!`);
                        if(target.zoneIndex < 0) { target.isEliminated=true; this.log(`!!! ${target.name} ELIMINATED !!!`); }
                    }
                });
                
                this.renderBoard();
                this.renderControls();
                document.getElementById('round-counter').innerText = ++this.round;
                this.checkWin();
            }
            
            checkWin() {
                const bAlive = this.blue.some(b=>!b.isEliminated);
                const rAlive = this.red.some(b=>!b.isEliminated);
                if(!bAlive || !rAlive) {
                    setTimeout(() => {
                        containerRef.current.innerHTML += `
                            <div class="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                                <div class="text-center p-8 bg-slate-900 border border-slate-600 rounded-xl shadow-2xl">
                                    <h1 class="text-6xl ${bAlive ? 'text-yellow-500' : 'text-red-500'} font-sport mb-4">${bAlive ? 'VICTORY' : 'DEFEAT'}</h1>
                                    <p class="text-slate-300 mb-6">${bAlive ? 'You earned a free pack!' : 'Better luck next time.'}</p>
                                    <button onclick="renderDashboard()" class="btn-primary px-8 py-4 text-xl rounded">RETURN TO HQ</button>
                                </div>
                            </div>
                        `;
                        if(bAlive) { PB_State.user.record.w++; PB_State.user.packs++; } else PB_State.user.record.l++;
                        saveData();
                    }, 1000);
                }
            }
        }

        // --- INIT ---
        if (PB_State.user.collection.benders.length === 0) renderWelcome();
        else { initLeague(); renderDashboard(); }

    }, []);

    return (
        <div className="w-full h-full relative font-sans">
            <style>{`
                .font-sport { font-family: 'Koulen', fantasy; letter-spacing: 0.1em; }
                .glass-panel { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .btn-primary { background: linear-gradient(to bottom, #ca8a04, #854d0e); border: 2px solid #facc15; color: white; font-family: 'Koulen', sans-serif; text-transform: uppercase; letter-spacing: 0.1em; text-shadow: 0 2px 0 rgba(0,0,0,0.5); transition: all 0.2s; }
                .btn-primary:hover { transform: scale(1.05); filter: brightness(1.2); }
                .btn-primary:active { transform: scale(0.95); }
                .card { perspective: 1000px; cursor: pointer; transition: transform 0.3s; }
                .card:hover { transform: translateY(-15px) rotate(2deg); z-index: 50; }
                .card-inner { background: #1e293b; border: 4px solid #475569; border-radius: 16px; overflow: hidden; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.6); display: flex; flex-direction: column; }
                .card.legendary .card-inner { border-color: #facc15; box-shadow: 0 0 25px rgba(250, 204, 21, 0.4); }
                .card.rare .card-inner { border-color: #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); }
                .card.epic .card-inner { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
                .card.common .card-inner { border-color: #94a3b8; }
                .card-art { height: 140px; width: 100%; position: relative; display: flex; align-items: center; justify-content: center; border-bottom: 2px solid rgba(255,255,255,0.1); overflow: hidden; }
                .art-water { background: radial-gradient(circle at center, #3b82f6, #172554); }
                .art-earth { background: radial-gradient(circle at center, #22c55e, #064e3b); }
                .art-fire { background: radial-gradient(circle at center, #ef4444, #7f1d1d); }
                .art-air { background: radial-gradient(circle at center, #2dd4bf, #115e59); }
                .art-pattern { position: absolute; inset: 0; opacity: 0.3; background-image: url('https://www.transparenttextures.com/patterns/diagmonds-light.png'); mix-blend-mode: overlay; }
                .sub-bending-badge { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; z-index: 10; }
                @keyframes shake { 0% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 50% { transform: rotate(0eg); } 75% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }
                .pack-shake { animation: shake 0.5s ease-in-out infinite; }
                @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
                .card-reveal { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .trapezoid-court { transform: perspective(1000px) rotateX(25deg) scale(0.95); transform-style: preserve-3d; box-shadow: 0 40px 60px rgba(0,0,0,0.6); border: 4px solid #475569; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 8px; }
                .zone { transition: all 0.3s ease; border-right: 2px solid rgba(255,255,255,0.1); }
                .bender-token { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px rgba(0,0,0,0.5); margin-bottom: 5px; }
                .bender-token.knockback { animation: knockback 0.5s ease-out; }
                @keyframes knockback { 0% { transform: scale(1) translateX(0); } 50% { transform: scale(1.2) translateX(-20px); background-color: white; } 100% { transform: scale(1) translateX(0); } }
            `}</style>
            <div ref={containerRef} className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                {/* GAME RENDERS HERE */}
            </div>
        </div>
    );
}