import React, { useEffect, useRef } from 'react';

// --- GLOBAL STATE (Defined outside component to persist between tab switches) ---
// This ensures that if you switch to "Inventory" and back, your match progress isn't lost.
let PB_State = {
    initialized: false,
    view: 'init',
    user: {
        name: "Manager",
        packs: 1, // Start with 1 pack for testing
        collection: { benders: [], moves: [], logos: [] },
        roster: { logo: null, active: [null, null, null], alternate: null, moves: {} },
        record: { w: 0, l: 0 }
    },
    league: [
        { name: 'Wolfbats', w: 0, l: 0 },
        { name: 'Boar-q-pines', w: 0, l: 0 },
        { name: 'Tigerdillos', w: 0, l: 0 },
        { name: 'Platypus Bears', w: 0, l: 0 },
        { name: 'Buzzard Wasps', w: 0, l: 0 },
        { name: 'Raven Eagles', w: 0, l: 0 },
        { name: 'Elephant Kois', w: 0, l: 0 }
    ],
    tempPack: [],
    tempChar: { name: '', element: 'water' },
    arenaMatch: null 
};

// --- DATA CONSTANTS ---
const ELEMENTS = {
    WATER: { id: 'water', name: 'Water', color: 'text-blue-400', bg: 'art-water', icon: 'fa-water' },
    EARTH: { id: 'earth', name: 'Earth', color: 'text-green-400', bg: 'art-earth', icon: 'fa-mountain' },
    FIRE: { id: 'fire', name: 'Fire', color: 'text-red-400', bg: 'art-fire', icon: 'fa-fire' }
};

const SUB_BENDING = {
    NONE: { name: '', icon: '' },
    METAL: { name: 'Metal', icon: 'fa-cube' },
    LAVA: { name: 'Lava', icon: 'fa-volcano' },
    SAND: { name: 'Sand', icon: 'fa-wind' },
    LIGHTNING: { name: 'Lightning', icon: 'fa-bolt' },
    COMBUSTION: { name: 'Combustion', icon: 'fa-bomb' },
    HEALING: { name: 'Healing', icon: 'fa-plus' },
    BLOOD: { name: 'Blood', icon: 'fa-tint' }
};

const CARDS_DB = {
    BENDERS: [
        { id: 'b_korra', name: 'Korra', element: 'water', rarity: 'legendary', power: 85, stability: 90, potential: 100, control: 75, sub: 'HEALING', desc: 'The Avatar.' },
        { id: 'b_mako', name: 'Mako', element: 'fire', rarity: 'rare', power: 80, stability: 70, potential: 85, control: 90, sub: 'LIGHTNING', desc: 'Cool under fire.' },
        { id: 'b_bolin', name: 'Bolin', element: 'earth', rarity: 'rare', power: 75, stability: 85, potential: 88, control: 65, sub: 'LAVA', desc: 'Heavy hitter.' },
        { id: 'b_tahno', name: 'Tahno', element: 'water', rarity: 'rare', power: 70, stability: 75, potential: 75, control: 80, sub: 'NONE', desc: 'Arrogant style.' },
        { id: 'b_rookie_w', name: 'Water Rookie', element: 'water', rarity: 'common', power: 45, stability: 50, potential: 60, control: 40, sub: 'NONE', desc: 'Promising talent.' },
        { id: 'b_rookie_e', name: 'Earth Rookie', element: 'earth', rarity: 'common', power: 50, stability: 55, potential: 60, control: 35, sub: 'NONE', desc: 'Solid stance.' },
        { id: 'b_rookie_f', name: 'Fire Rookie', element: 'fire', rarity: 'common', power: 55, stability: 40, potential: 60, control: 45, sub: 'NONE', desc: 'Hot headed.' },
        { id: 'b_hasook', name: 'Hasook', element: 'water', rarity: 'common', power: 50, stability: 60, potential: 55, control: 50, sub: 'NONE', desc: 'Reliable.' },
    ],
    MOVES: [
        { id: 'm_whip', name: 'Water Whip', element: 'water', type: 'aggressive', powerMod: 1.2, desc: 'Basic strike.' },
        { id: 'm_wall', name: 'Ice Wall', element: 'water', type: 'defensive', powerMod: 0.5, desc: 'Block incoming.' },
        { id: 'm_disc', name: 'Earth Disc', element: 'earth', type: 'aggressive', powerMod: 1.3, desc: 'Standard projectile.' },
        { id: 'm_rock', name: 'Rock Armor', element: 'earth', type: 'defensive', powerMod: 0.4, desc: 'Absorb impact.' },
        { id: 'm_blast', name: 'Fire Blast', element: 'fire', type: 'aggressive', powerMod: 1.4, desc: 'High damage.' },
        { id: 'm_dodge', name: 'Flame Dodge', element: 'fire', type: 'tactical', powerMod: 0.8, desc: 'Evasive maneuver.' },
    ],
    LOGOS: [
        { id: 'l_ferrets', name: 'Fire Ferrets', color: 'text-red-500' },
        { id: 'l_wolfbats', name: 'Wolfbats', color: 'text-purple-500' },
        { id: 'l_boars', name: 'Boar-q-pines', color: 'text-yellow-700' },
        { id: 'l_badgermoles', name: 'Badgermoles', color: 'text-green-700' }
    ]
};

export default function ProBendingLeague() {
    const containerRef = useRef(null);

    useEffect(() => {
        // --- ATTACH GLOBALS FOR INLINE HTML EVENTS ---
        // Since the HTML uses onclick="renderDashboard()", we must attach these to window
        window.selectElement = (elem) => {
            PB_State.tempChar.element = elem;
            ['water', 'earth', 'fire'].forEach(e => {
                const btn = document.getElementById(`btn-${e}`);
                if (!btn) return;
                if(e === elem) {
                    btn.classList.add('ring-2', 'ring-yellow-500', 'border-' + (e==='water'?'blue':e==='earth'?'green':'red') + '-500');
                    btn.classList.remove('border-slate-600', 'bg-slate-800');
                } else {
                    btn.classList.remove('ring-2', 'ring-yellow-500');
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
        window.unequip = (idx) => { PB_State.user.roster.active[idx] = null; renderRoster(); };
        window.equipMove = (uid, mid) => { PB_State.user.roster.moves[uid] = mid; };
        
        // Drag & Drop Globals
        window.allowDrop = (ev) => ev.preventDefault();
        window.drag = (ev, uid) => ev.dataTransfer.setData("text", uid);
        window.drop = (ev, type, idx) => {
            ev.preventDefault();
            const uid = ev.dataTransfer.getData("text");
            // Anti-duplication logic
            if (PB_State.user.roster.active.includes(uid)) {
                PB_State.user.roster.active[PB_State.user.roster.active.indexOf(uid)] = null;
            }
            if (PB_State.user.roster.alternate === uid) PB_State.user.roster.alternate = null;

            if (type === 'active') PB_State.user.roster.active[idx] = uid;
            if (type === 'alt') PB_State.user.roster.alternate = uid;
            renderRoster();
        };

        // --- GAME LOGIC ---

        function createBenderInstance(baseId, customData = null) {
            let base = CARDS_DB.BENDERS.find(b => b.id === baseId);
            if (customData) {
                base = {
                    id: 'b_custom', name: customData.name, element: customData.element,
                    rarity: 'rare', power: 50, stability: 50, potential: 95, control: 40,
                    sub: 'NONE', desc: 'The rookie with a dream.'
                };
            }
            return { ...base, uid: Math.random().toString(36).substr(2, 9), xp: 0 };
        }

        function createCustomChar() {
            const nameInput = document.getElementById('char-name-input');
            const name = nameInput ? (nameInput.value.trim() || "Rookie") : "Rookie";
            const element = PB_State.tempChar.element;
            const playerChar = createBenderInstance(null, { name, element });
            openStarterPack(playerChar);
        }

        function openStarterPack(playerChar) {
            const pack = [
                playerChar,
                createBenderInstance('b_korra'),
                createBenderInstance('b_mako'),
                createBenderInstance('b_bolin'),
                CARDS_DB.MOVES.find(m => m.id === 'm_whip'),
                CARDS_DB.MOVES.find(m => m.id === 'm_blast'),
                CARDS_DB.MOVES.find(m => m.id === 'm_disc'),
                CARDS_DB.LOGOS[0]
            ];
            PB_State.tempPack = pack;
            
            pack.forEach(item => {
                if (item.xp !== undefined) PB_State.user.collection.benders.push(item);
                else if (item.powerMod) PB_State.user.collection.moves.push(item);
                else PB_State.user.collection.logos.push(item);
            });
            
            PB_State.user.roster.active = [playerChar.uid, pack[1].uid, pack[2].uid];
            PB_State.user.roster.alternate = pack[3].uid;
            PB_State.user.roster.moves[pack[1].uid] = pack[4].id;
            PB_State.user.roster.moves[pack[2].uid] = pack[5].id;

            renderPackReveal(true);
        }

        function openRandomPack() {
            if (PB_State.user.packs <= 0) return;
            PB_State.user.packs--;
            const pack = [];
            for(let i=0; i<3; i++) {
                if (Math.random() < 0.6) {
                    const base = CARDS_DB.BENDERS[Math.floor(Math.random() * CARDS_DB.BENDERS.length)];
                    const inst = createBenderInstance(base.id);
                    pack.push(inst);
                    PB_State.user.collection.benders.push(inst);
                } else {
                    const move = CARDS_DB.MOVES[Math.floor(Math.random() * CARDS_DB.MOVES.length)];
                    pack.push(move);
                    PB_State.user.collection.moves.push(move);
                }
            }
            PB_State.tempPack = pack;
            renderPackReveal(false);
        }

        function simulateLeague() {
            PB_State.league.forEach(team => {
                if (Math.random() > 0.5) team.w++; else team.l++;
            });
            PB_State.league.sort((a, b) => b.w - a.w);
        }

        // --- RENDER FUNCTIONS ---
        // Replacing root.innerHTML with containerRef.current.innerHTML

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
                    <div class="glass-panel p-8 rounded-xl max-w-lg w-full">
                        <h2 class="font-sport text-3xl text-white mb-6 text-center">CREATE YOUR PRO-BENDER</h2>
                        <div class="mb-6">
                            <label class="block text-slate-400 text-sm mb-2">NAME</label>
                            <input id="char-name-input" type="text" placeholder="Enter Name" maxlength="12"
                                class="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white font-sport tracking-wide focus:border-yellow-500 outline-none">
                        </div>
                        <div class="mb-8">
                            <label class="block text-slate-400 text-sm mb-2">ELEMENT</label>
                            <div class="grid grid-cols-3 gap-4">
                                <button onclick="selectElement('water')" id="btn-water" class="p-4 border-2 border-blue-500 bg-blue-900/20 rounded flex flex-col items-center gap-2 ring-2 ring-yellow-500">
                                    <i class="fa-solid fa-water text-2xl text-blue-400"></i>
                                    <span class="text-xs font-bold text-blue-300">WATER</span>
                                </button>
                                <button onclick="selectElement('earth')" id="btn-earth" class="p-4 border-2 border-slate-600 bg-slate-800 rounded flex flex-col items-center gap-2">
                                    <i class="fa-solid fa-mountain text-2xl text-green-400"></i>
                                    <span class="text-xs font-bold text-green-300">EARTH</span>
                                </button>
                                <button onclick="selectElement('fire')" id="btn-fire" class="p-4 border-2 border-slate-600 bg-slate-800 rounded flex flex-col items-center gap-2">
                                    <i class="fa-solid fa-fire text-2xl text-red-400"></i>
                                    <span class="text-xs font-bold text-red-300">FIRE</span>
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
                const isBender = card.xp !== undefined;
                const isMove = card.powerMod !== undefined;
                const type = isBender ? 'BENDER' : (isMove ? 'ABILITY' : 'TEAM LOGO');
                let rarityClass = card.rarity || 'common';
                let elemConfig = ELEMENTS[card.element ? card.element.toUpperCase() : 'FIRE'];
                if (!card.element && !isMove && !isBender) elemConfig = { color: 'text-yellow-500', bg: 'bg-slate-800', icon: 'fa-shield-alt' };

                let artContent = '';
                if (isBender) {
                    artContent = `<i class="fa-solid ${elemConfig.icon} text-6xl text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"></i>`;
                    if (card.sub && card.sub !== 'NONE') {
                        artContent += `<div class="sub-bending-badge" title="Affinity: ${SUB_BENDING[card.sub].name}"><i class="fa-solid ${SUB_BENDING[card.sub].icon}"></i></div>`;
                    }
                } else if (isMove) {
                    artContent = `<i class="fa-solid fa-scroll text-5xl text-slate-200 opacity-80"></i>`;
                } else {
                    artContent = `<i class="fa-solid fa-dragon text-5xl ${card.color}"></i>`;
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
                                    <div class="mt-2 bg-black/30 p-2 rounded text-[9px] text-slate-400">
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
                        <nav class="flex-1 flex flex-col gap-2">
                            <button onclick="renderDashboard()" class="text-left px-4 py-3 bg-slate-800 text-yellow-500 rounded font-sport tracking-wide border-l-4 border-yellow-500">
                                <i class="fa-solid fa-chart-line w-6"></i> DASHBOARD
                            </button>
                            <button onclick="renderRoster()" class="text-left px-4 py-3 hover:bg-slate-800 text-slate-300 rounded font-sport tracking-wide transition">
                                <i class="fa-solid fa-users w-6"></i> ROSTER & MOVES
                            </button>
                            <button onclick="renderLeaderboard()" class="text-left px-4 py-3 hover:bg-slate-800 text-slate-300 rounded font-sport tracking-wide transition">
                                <i class="fa-solid fa-list-ol w-6"></i> LEAGUE TABLE
                            </button>
                        </nav>
                        <div class="mt-auto pt-4 border-t border-slate-700">
                            <div class="text-xs text-slate-400 mb-2">RECORD</div>
                            <div class="text-2xl font-mono">${PB_State.user.record.w} - ${PB_State.user.record.l}</div>
                        </div>
                    </div>
                    <div class="col-span-10 p-8 overflow-y-auto bg-slate-950">
                        <div class="flex justify-between items-end mb-8">
                            <div>
                                <h1 class="font-sport text-4xl text-white">TEAM HQ</h1>
                                <p class="text-slate-400">Manage your franchise and prepare for the next bout.</p>
                            </div>
                            <div class="flex gap-4">
                                ${PB_State.user.packs > 0 ? `
                                    <button onclick="openRandomPack()" class="pack-shake btn-primary px-6 py-2 rounded shadow-lg animate-pulse">
                                        OPEN PACK (${PB_State.user.packs})
                                    </button>
                                ` : `
                                    <div class="px-6 py-2 bg-slate-800 rounded text-slate-500 border border-slate-700">
                                        NO PACKS
                                    </div>
                                `}
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
                                    <button onclick="startArena()" class="btn-primary px-8 py-4 text-xl rounded-lg shadow-2xl">
                                        ENTER ARENA
                                    </button>
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
                                                <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center ${elemConfig.color} font-bold text-xs">
                                                    <i class="fa-solid ${elemConfig.icon}"></i>
                                                </div>
                                                <div>
                                                    <div class="font-sport leading-none text-white">${bender.name}</div>
                                                    <div class="text-[10px] text-slate-400">POW: ${bender.power} / CTL: ${bender.control}</div>
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
            // Helper to render card lists
            const renderCardList = (list) => list.map(b => {
                const elemConfig = ELEMENTS[b.element.toUpperCase()];
                return `
                <div draggable="true" ondragstart="drag(event, '${b.uid}')" class="bg-slate-800 p-3 rounded border border-slate-600 cursor-grab hover:bg-slate-700 transition flex items-center gap-3 group relative">
                    <div class="w-8 h-8 rounded bg-slate-900 flex items-center justify-center ${elemConfig.color}">
                        <i class="fa-solid ${elemConfig.icon}"></i>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-sm flex justify-between text-white">
                            ${b.name}
                            ${b.sub !== 'NONE' ? `<i class="fa-solid ${SUB_BENDING[b.sub].icon} text-[10px] text-yellow-500" title="${b.sub}"></i>` : ''}
                        </div>
                        <div class="text-[9px] text-slate-400 grid grid-cols-2 gap-x-2">
                           <span>POW: ${b.power}</span> <span>STB: ${b.stability}</span>
                           <span>POT: ${b.potential}</span> <span>CTL: ${b.control}</span>
                        </div>
                    </div>
                </div>
            `}).join('');

            containerRef.current.innerHTML = `
                <div class="h-full flex flex-col p-8 bg-slate-900">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="font-sport text-3xl text-white">ROSTER MANAGEMENT</h1>
                        <button onclick="renderDashboard()" class="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-white">BACK TO DASHBOARD</button>
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
                                                    <div class="text-4xl mb-1 ${ELEMENTS[bender.element.toUpperCase()].color}">
                                                        <i class="fa-solid ${ELEMENTS[bender.element.toUpperCase()].icon}"></i>
                                                    </div>
                                                    <div class="font-sport text-xl text-center leading-none mb-2 text-white">${bender.name}</div>
                                                    
                                                    <div class="w-full bg-black/40 p-2 rounded text-[10px] grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400 mb-2">
                                                        <div class="flex justify-between"><span>POW</span> <span class="text-white">${bender.power}</span></div>
                                                        <div class="flex justify-between"><span>STB</span> <span class="text-white">${bender.stability}</span></div>
                                                        <div class="flex justify-between"><span>POT</span> <span class="text-white">${bender.potential}</span></div>
                                                        <div class="flex justify-between"><span>CTL</span> <span class="text-white">${bender.control}</span></div>
                                                    </div>
                                                    <button onclick="unequip(${i})" class="text-red-500 text-xs hover:text-red-400 font-bold mb-2">REMOVE</button>
                                                    <div class="mt-auto w-full">
                                                        <select onchange="equipMove('${bender.uid}', this.value)" class="w-full bg-slate-900 text-[10px] p-1 rounded border border-slate-700 text-white">
                                                            <option value="">Select Move...</option>
                                                            ${PB_State.user.collection.moves.filter(m => m.element === bender.element).map(m => `
                                                                <option value="${m.id}" ${PB_State.user.roster.moves[bender.uid] === m.id ? 'selected' : ''}>${m.name}</option>
                                                            `).join('')}
                                                        </select>
                                                    </div>
                                                ` : '<span class="text-slate-500 text-xs">DRAG BENDER HERE</span>'}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            <div class="bg-slate-800/30 rounded-xl p-6 border border-slate-700 flex gap-4 items-center">
                                <h3 class="font-sport text-slate-400 w-32">ALTERNATE</h3>
                                <div ondrop="drop(event, 'alt', 0)" ondragover="allowDrop(event)" 
                                    class="h-24 w-full rounded border-2 border-dashed border-slate-600 bg-slate-900/50 flex items-center justify-center text-xs text-slate-500">
                                    ${PB_State.user.roster.alternate ? 
                                        PB_State.user.collection.benders.find(b => b.uid === PB_State.user.roster.alternate).name + ' (Alternate)' 
                                        : 'DRAG ALTERNATE HERE'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderLeaderboard() {
            if (!containerRef.current) return;
            const userEntry = { name: "Your Team", w: PB_State.user.record.w, l: PB_State.user.record.l, isUser: true };
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
                                    <th class="p-4">WINS</th>
                                    <th class="p-4">LOSSES</th>
                                    <th class="p-4">WIN %</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-700">
                                ${allTeams.map((t, i) => {
                                    const total = t.w + t.l;
                                    const pct = total === 0 ? 0 : Math.round((t.w / total) * 100);
                                    const rowClass = t.isUser ? 'bg-yellow-900/20 border-l-4 border-yellow-500' : '';
                                    return `
                                        <tr class="${rowClass} hover:bg-white/5 transition">
                                            <td class="p-4 font-mono text-slate-500">#${i + 1}</td>
                                            <td class="p-4 font-bold ${t.isUser ? 'text-yellow-400' : 'text-slate-200'}">${t.name}</td>
                                            <td class="p-4 text-green-400 font-mono">${t.w}</td>
                                            <td class="p-4 text-red-400 font-mono">${t.l}</td>
                                            <td class="p-4 text-slate-400 font-mono">${pct}%</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function startArena() {
            if (!containerRef.current) return;
            if (PB_State.user.roster.active.some(s => s === null)) {
                alert("Please fill all 3 starting slots in your Roster!");
                return;
            }

            const blueBenders = PB_State.user.roster.active.map((uid) => {
                const data = PB_State.user.collection.benders.find(b => b.uid === uid);
                const moveId = PB_State.user.roster.moves[uid];
                const move = moveId ? CARDS_DB.MOVES.find(m => m.id === moveId) : null;
                return {
                    id: uid, name: data.name, element: data.element, team: 'blue', role: 'Player',
                    maxStability: data.stability, stability: data.stability, power: data.power,
                    control: data.control || 50, move: move, zoneIndex: 2, isEliminated: false
                };
            });

            const redBenders = [
                { id: 'r1', name: 'Tahno', element: 'water', team: 'red', maxStability: 80, stability: 80, power: 70, control: 75, zoneIndex: 3 },
                { id: 'r2', name: 'Shin', element: 'earth', team: 'red', maxStability: 90, stability: 90, power: 65, control: 60, zoneIndex: 3 },
                { id: 'r3', name: 'Hasook', element: 'fire', team: 'red', maxStability: 70, stability: 70, power: 85, control: 50, zoneIndex: 3 }
            ];

            containerRef.current.innerHTML = `
                <div class="h-full flex flex-col">
                    <header class="h-16 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-8 z-50">
                        <div class="font-sport text-blue-500 text-xl">YOUR TEAM <span id="score-blue" class="text-white ml-2">3</span></div>
                        <div class="bg-black border border-yellow-600 px-4 py-1 text-yellow-500 font-sport">ROUND <span id="round-counter">1</span></div>
                        <div class="font-sport text-red-500 text-xl"><span id="score-red" class="text-white mr-2">3</span> WOLFBATS</div>
                    </header>
                    
                    <main class="flex-1 relative flex flex-col justify-center overflow-hidden bg-gradient-to-b from-cyan-950 to-blue-900">
                        <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <div class="trapezoid-court h-96 w-full max-w-5xl mx-auto grid grid-cols-6 relative z-10">
                            <div class="absolute -top-10 left-0 w-full flex justify-between px-12 text-xs text-cyan-200/50 font-sport tracking-widest pointer-events-none transform scale-x-90">
                                <span>ZONE 3</span><span>ZONE 2</span><span>ZONE 1</span>
                                <span>ZONE 1</span><span>ZONE 2</span><span>ZONE 3</span>
                            </div>
                            <div id="zone-0" class="zone zone-blue-3 flex flex-col justify-center items-center gap-2 p-2"></div>
                            <div id="zone-1" class="zone zone-blue-2 flex flex-col justify-center items-center gap-2 p-2"></div>
                            <div id="zone-2" class="zone zone-blue-1 flex flex-col justify-center items-center gap-2 p-2 border-r-yellow-500"></div>
                            <div id="zone-3" class="zone zone-red-1 flex flex-col justify-center items-center gap-2 p-2"></div>
                            <div id="zone-4" class="zone zone-red-2 flex flex-col justify-center items-center gap-2 p-2"></div>
                            <div id="zone-5" class="zone zone-red-3 flex flex-col justify-center items-center gap-2 p-2"></div>
                        </div>
                    </main>

                    <footer class="h-48 bg-slate-900 border-t border-slate-700 flex p-4 gap-4 z-40">
                         <div id="tactic-selectors" class="flex-1 grid grid-cols-3 gap-4"></div>
                         <div class="w-48 flex flex-col gap-2">
                            <button id="bend-button" onclick="window.matchInstance.playRound()" class="h-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-sport text-2xl rounded shadow-lg disabled:opacity-50 transition">
                                EXECUTE
                            </button>
                         </div>
                         <div id="combat-log" class="w-64 glass-panel rounded p-2 text-xs font-mono overflow-y-auto flex flex-col-reverse text-slate-400"></div>
                    </footer>
                </div>
            `;
            window.matchInstance = new Match(blueBenders, redBenders);
        }

        class Match {
            constructor(blueTeam, redTeam) {
                this.round = 1;
                this.blueTeam = blueTeam;
                this.redTeam = redTeam;
                this.allBenders = [...blueTeam, ...redTeam];
                this.tactics = {};
                this.renderBoard();
                this.renderControls();
                this.log("Match Started. Select tactics.");
            }

            log(msg) {
                const el = document.getElementById('combat-log');
                if(el) el.innerHTML = `<div>> ${msg}</div>` + el.innerHTML;
            }

            renderBoard() {
                for(let i=0; i<6; i++) document.getElementById(`zone-${i}`).innerHTML = '';
                this.allBenders.forEach(b => {
                    if(b.isEliminated) return;
                    const icon = b.element === 'water' ? 'fa-water' : (b.element === 'earth' ? 'fa-mountain' : 'fa-fire');
                    let bgStyle = b.element === 'water' ? 'linear-gradient(135deg, #172554, #1e3a8a)' : (b.element === 'earth' ? 'linear-gradient(135deg, #052e16, #14532d)' : 'linear-gradient(135deg, #450a0a, #7f1d1d)');
                    let borderCol = b.element === 'water' ? '#60a5fa' : (b.element === 'earth' ? '#4ade80' : '#f87171');

                    const token = document.createElement('div');
                    token.id = `token-${b.id}`;
                    token.className = `bender-token w-full h-16 rounded flex flex-col items-center justify-center relative overflow-hidden`;
                    token.style.background = bgStyle;
                    token.style.borderLeft = `4px solid ${borderCol}`;
                    token.innerHTML = `
                        <div class="flex items-center gap-2 z-10 text-white drop-shadow-md">
                            <i class="fa-solid ${icon}"></i>
                            <span class="font-sport text-lg">${b.name}</span>
                        </div>
                        <div class="absolute bottom-0 left-0 w-full h-1 bg-black/50">
                            <div class="h-full bg-green-500 transition-all" style="width: ${b.stability}%"></div>
                        </div>
                    `;
                    document.getElementById(`zone-${b.zoneIndex}`).appendChild(token);
                });
                document.getElementById('score-blue').innerText = this.blueTeam.filter(b => !b.isEliminated).length;
                document.getElementById('score-red').innerText = this.redTeam.filter(b => !b.isEliminated).length;
            }

            renderControls() {
                const container = document.getElementById('tactic-selectors');
                if(!container) return;
                container.innerHTML = '';
                this.blueTeam.forEach(b => {
                    if(b.isEliminated) return;
                    const activeClass = this.tactics[b.id] ? 'border-yellow-500' : 'border-slate-600';
                    const moveName = b.move ? b.move.name : 'Basic Attack';
                    const moveType = b.move ? b.move.type : 'tactical';
                    if(!this.tactics[b.id]) this.tactics[b.id] = moveType;

                    const panel = document.createElement('div');
                    panel.className = `bg-slate-800 p-2 rounded border ${activeClass} flex flex-col gap-2`;
                    panel.innerHTML = `
                        <div class="flex justify-between text-xs text-slate-300">
                            <span>${b.name}</span><span class="uppercase">${b.element}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-1">
                            <button onclick="window.matchInstance.setTactic('${b.id}', 'aggressive')" class="p-1 rounded bg-slate-700 text-[10px] hover:bg-red-900 ${this.tactics[b.id] === 'aggressive' ? 'bg-red-600 text-white' : ''}">ATK</button>
                            <button onclick="window.matchInstance.setTactic('${b.id}', 'defensive')" class="p-1 rounded bg-slate-700 text-[10px] hover:bg-blue-900 ${this.tactics[b.id] === 'defensive' ? 'bg-blue-600 text-white' : ''}">DEF</button>
                        </div>
                        <div class="text-[10px] text-center text-yellow-500">${moveName} Equipped</div>
                    `;
                    container.appendChild(panel);
                });
            }

            setTactic(id, tactic) {
                this.tactics[id] = tactic;
                this.renderControls();
            }

            playRound() {
                const strats = ['aggressive', 'defensive'];
                const enemyStrat = strats[Math.floor(Math.random()*2)];
                this.log(`Round ${this.round}: Wolfbats using ${enemyStrat} style.`);
                const resolve = (att, def) => {
                    if(att.isEliminated || def.isEliminated) return;
                    let powerFactor = att.power / 4; 
                    let dmg = powerFactor * (this.tactics[att.id] === 'aggressive' || enemyStrat === 'aggressive' ? 1.5 : 1);
                    if(att.team === 'blue' && att.move && att.move.type === this.tactics[att.id]) dmg *= att.move.powerMod;
                    if (Math.random() * 100 < (att.control || 50) - (def.stability/2)) { dmg *= 1.5; this.log("CRITICAL HIT!"); }
                    if((att.team === 'blue' && this.tactics[def.id] === 'defensive') || (att.team === 'red' && enemyStrat === 'defensive')) dmg *= 0.5;
                    def.stability -= dmg;
                    this.log(`${att.name} hits ${def.name} for ${Math.floor(dmg)} stability.`);
                    if(def.stability <= 0) {
                        def.stability = def.maxStability;
                        const dir = def.team === 'blue' ? -1 : 1;
                        def.zoneIndex += dir;
                        this.log(`${def.name} KNOCKED BACK!`);
                        const token = document.getElementById(`token-${def.id}`);
                        if(token) token.classList.add('knockback');
                        if(def.zoneIndex < 0 || def.zoneIndex > 5) {
                            def.isEliminated = true;
                            this.log(`${def.name} ELIMINATED!`);
                        }
                    }
                };
                this.blueTeam.forEach(att => { const targets = this.redTeam.filter(t => !t.isEliminated); if(targets.length) resolve(att, targets[Math.floor(Math.random()*targets.length)]); });
                this.redTeam.forEach(att => { const targets = this.blueTeam.filter(t => !t.isEliminated); if(targets.length) resolve(att, targets[Math.floor(Math.random()*targets.length)]); });
                this.renderBoard();
                this.renderControls();
                this.round++;
                if(document.getElementById('round-counter')) document.getElementById('round-counter').innerText = this.round;
                this.checkWin();
            }

            checkWin() {
                const blueAlive = this.blueTeam.filter(b => !b.isEliminated).length;
                const redAlive = this.redTeam.filter(b => !b.isEliminated).length;
                if(blueAlive === 0 || redAlive === 0) {
                    const won = redAlive === 0;
                    setTimeout(() => { this.endMatch(won); }, 1000);
                }
            }

            endMatch(won) {
                if(won) PB_State.user.record.w++; else PB_State.user.record.l++;
                if(won) PB_State.user.packs++;
                simulateLeague();
                if(containerRef.current) containerRef.current.innerHTML += `
                    <div class="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center">
                        <div class="bg-slate-900 border-2 ${won ? 'border-yellow-500' : 'border-red-500'} p-8 rounded-xl text-center shadow-2xl">
                            <h1 class="font-sport text-6xl mb-4 ${won ? 'text-yellow-500' : 'text-red-500'}">${won ? 'VICTORY!' : 'DEFEAT'}</h1>
                            <p class="text-xl mb-8">${won ? 'You earned a new Card Pack!' : 'Better luck next time.'}</p>
                            <button onclick="renderDashboard()" class="btn-primary px-8 py-4 text-xl rounded">RETURN TO DASHBOARD</button>
                        </div>
                    </div>
                `;
            }
        }

        // --- INIT ---
        if (PB_State.user.collection.benders.length === 0) renderWelcome();
        else renderDashboard();

    }, []);

    return (
        <div className="w-full h-full relative font-sans">
            <style>{`
                .font-sport { font-family: 'Koulen', fantasy; letter-spacing: 0.1em; }
                .glass-panel { background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .btn-primary { background: linear-gradient(to bottom, #ca8a04, #854d0e); border: 2px solid #facc15; color: white; font-family: 'Koulen', sans-serif; text-transform: uppercase; letter-spacing: 0.1em; text-shadow: 0 2px 0 rgba(0,0,0,0.5); transition: all 0.2s; }
                .btn-primary:hover { transform: scale(1.05); filter: brightness(1.2); }
                .btn-primary:active { transform: scale(0.95); }
                .card { perspective: 1000px; cursor: pointer; transition: transform 0.3s; }
                .card:hover { transform: translateY(-15px) rotate(2deg); z-index: 50; }
                .card-inner { background: #1e293b; border: 4px solid #475569; border-radius: 16px; overflow: hidden; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.6); display: flex; flex-direction: column; }
                .card.legendary .card-inner { border-color: #facc15; box-shadow: 0 0 25px rgba(250, 204, 21, 0.4); }
                .card.rare .card-inner { border-color: #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); }
                .card.common .card-inner { border-color: #94a3b8; }
                .card-art { height: 140px; width: 100%; position: relative; display: flex; align-items: center; justify-content: center; border-bottom: 2px solid rgba(255,255,255,0.1); overflow: hidden; }
                .art-water { background: radial-gradient(circle at center, #3b82f6, #172554); }
                .art-earth { background: radial-gradient(circle at center, #22c55e, #064e3b); }
                .art-fire { background: radial-gradient(circle at center, #ef4444, #7f1d1d); }
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