import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, X, Edit2, Type, Check, Settings } from 'lucide-react';
import { useGameStore } from '../store/gamestore'; // Corrected Path
import { SKILL_DETAILS } from '../data/gamedata'; // Corrected Path

export default function TodoList({ onClose }) {
  const { updateData } = useGameStore();

  // --- Data Management ---
  const getProfileData = () => {
    try {
      const saved = localStorage.getItem('todo_profile_data');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  };

  const saveProfileData = (data) => {
    localStorage.setItem('todo_profile_data', JSON.stringify(data));
  };

  // --- State ---
  const [todoState, setTodoState] = useState(() => {
    const profile = getProfileData();
    if (profile.todoState) return profile.todoState;
    const defaultListId = Date.now();
    return {
      lists: [{ id: defaultListId, name: 'Dev Tasks', tasks: [], fontSize: 'text-sm' }],
      activeListId: defaultListId,
      activeFilter: 'all'
    };
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const newListInputRef = useRef(null);

  useEffect(() => {
    const profile = getProfileData();
    profile.todoState = todoState;
    saveProfileData(profile);
  }, [todoState]);

  // --- Helpers ---
  const getActiveList = () => todoState.lists.find(l => l.id === todoState.activeListId) || todoState.lists[0];
  const activeList = getActiveList();

  const getFilteredTasks = () => {
    if (!activeList) return [];
    return activeList.tasks.filter(task => {
      if (todoState.activeFilter === 'active') return !task.completed;
      if (todoState.activeFilter === 'completed') return task.completed;
      return true;
    });
  };

  // --- XP Reward Logic ---
  const awardTaskXP = () => {
    const skillKeys = SKILL_DETAILS ? Object.keys(SKILL_DETAILS) : [];
    if(skillKeys.length === 0) return;
    
    const randomSkill = skillKeys[Math.floor(Math.random() * skillKeys.length)];
    const xpAmount = 50; 

    updateData((prev) => ({
      bonusXP: {
        ...prev.bonusXP,
        [randomSkill]: (prev.bonusXP?.[randomSkill] || 0) + xpAmount
      },
      discipline: (prev.discipline || 0) + 10
    }));
  };

  // --- Actions ---
  const switchTab = (id) => setTodoState(prev => ({ ...prev, activeListId: id }));
  
  const confirmAddList = (listName) => {
    const name = listName.trim();
    if (name) {
      const newListId = Date.now();
      setTodoState(prev => ({
        ...prev,
        lists: [...prev.lists, { id: newListId, name, tasks: [], fontSize: 'text-sm' }],
        activeListId: newListId
      }));
    }
    setIsAddingList(false);
  };

  const updateListTitle = (newTitle) => {
    setTodoState(prev => ({
      ...prev,
      lists: prev.lists.map(l => l.id === activeList.id ? { ...l, name: newTitle.trim() } : l)
    }));
    setEditingTitle(false);
  };

  const changeListFontSize = (sizeClass) => {
    setTodoState(prev => ({
      ...prev,
      lists: prev.lists.map(l => l.id === activeList.id ? { ...l, fontSize: sizeClass } : l)
    }));
  };

  const addTask = (text) => {
    if (!text.trim()) return;
    const newTask = { id: Date.now(), text: text.trim(), completed: false };
    setTodoState(prev => ({
      ...prev,
      lists: prev.lists.map(l => 
        l.id === activeList.id ? { ...l, tasks: [...l.tasks, newTask] } : l
      )
    }));
  };

  const toggleTask = (taskId) => {
    const task = activeList.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
        awardTaskXP(); 
    }

    setTodoState(prev => ({
      ...prev,
      lists: prev.lists.map(l => 
        l.id === activeList.id ? {
          ...l,
          tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        } : l
      )
    }));
  };

  const deleteTask = (taskId) => {
    setTodoState(prev => ({
      ...prev,
      lists: prev.lists.map(l => 
        l.id === activeList.id ? { ...l, tasks: l.tasks.filter(t => t.id !== taskId) } : l
      )
    }));
  };

  const updateTaskText = (taskId, newText) => {
    setTodoState(prev => ({
      ...prev,
      lists: prev.lists.map(l => 
        l.id === activeList.id ? {
          ...l,
          tasks: l.tasks.map(t => t.id === taskId ? { ...t, text: newText.trim() } : t)
        } : l
      )
    }));
    setEditingTaskId(null);
  };

  const setFilter = (filter) => setTodoState(prev => ({ ...prev, activeFilter: filter }));

  return (
    <div className="flex flex-col h-full bg-[#111827] text-[#f3f4f6] border-l border-[#374151] font-sans relative overflow-hidden shadow-2xl">
      
      {/* Header / Title */}
      <header className="p-4 border-b border-[#374151] bg-[#1f2937] flex justify-between items-center shrink-0">
        <div className="flex-1 min-w-0 mr-2">
            {editingTitle ? (
            <input
                autoFocus
                type="text"
                className="w-full text-lg font-bold bg-[#111827] border border-[#374151] rounded p-1 text-[#f3f4f6]"
                defaultValue={activeList.name}
                onBlur={(e) => updateListTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateListTitle(e.currentTarget.value)}
            />
            ) : (
            <div 
                className="text-lg font-bold cursor-pointer hover:bg-[#374151] p-1 rounded truncate flex items-center gap-2"
                onClick={() => setEditingTitle(true)}
            >
                {activeList.name} <Edit2 size={12} className="text-gray-600"/>
            </div>
            )}
        </div>
        <div className="flex gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded hover:bg-gray-700 transition ${showSettings ? 'text-amber-500' : 'text-gray-400'}`}>
                <Settings size={18} />
            </button>
            <button onClick={onClose} className="p-2 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition">
                <X size={18} />
            </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
          <div className="p-3 bg-[#1f2937] border-b border-slate-700 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Type size={12}/> Text Size</span>
                  <div className="flex gap-1">
                      {[{l:'Small', c:'text-xs'}, {l:'Medium', c:'text-sm'}, {l:'Large', c:'text-lg'}].map((s) => (
                          <button 
                            key={s.l} 
                            onClick={() => changeListFontSize(s.c)}
                            className={`px-2 py-1 rounded text-xs border ${activeList.fontSize === s.c ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
                          >
                              {s.l}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#374151] shrink-0 overflow-x-auto custom-scrollbar bg-[#1f2937] px-2 pt-2">
        {isAddingList ? (
          <div className="flex flex-grow items-center gap-2 py-1 mb-1">
            <input
              ref={newListInputRef}
              autoFocus
              type="text"
              className="min-w-0 flex-1 bg-[#111827] border border-[#4b5563] rounded px-2 py-1 text-sm text-white"
              placeholder="List Name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmAddList(e.currentTarget.value);
                if (e.key === 'Escape') setIsAddingList(false);
              }}
            />
            <button className="bg-emerald-600 text-white p-1 rounded" onClick={() => confirmAddList(newListInputRef.current.value)}><Check size={14} /></button>
            <button className="bg-red-600 text-white p-1 rounded" onClick={() => setIsAddingList(false)}><X size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <div className="flex-1 flex gap-1">
              {todoState.lists.map(list => (
                <button
                  key={list.id}
                  className={`px-3 py-2 text-xs font-bold rounded-t-md transition-all whitespace-nowrap max-w-[120px] truncate ${list.id === todoState.activeListId ? 'bg-[#111827] text-white border-t border-x border-[#374151] relative top-[1px]' : 'text-gray-400 hover:text-white hover:bg-[#374151]'}`}
                  onClick={() => switchTab(list.id)}
                >
                  {list.name}
                </button>
              ))}
            </div>
            <button className="mb-1 ml-2 text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded" onClick={() => setIsAddingList(true)}><Plus size={16} /></button>
          </div>
        )}
      </div>

      {/* Task Input */}
      <div className="p-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
            <input
            type="text"
            id="task-input"
            className="w-full bg-[#1f2937] border border-[#4b5563] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Add a new task..."
            onKeyDown={(e) => {
                if (e.key === 'Enter') { addTask(e.currentTarget.value); e.currentTarget.value = ''; }
            }}
            />
            <button
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold p-2 rounded-md transition-colors"
            onClick={() => {
                const input = document.getElementById('task-input');
                addTask(input.value);
                input.value = '';
            }}
            >
            <Plus size={18}/>
            </button>
        </div>
      </div>

      {/* Task List */}
      <ul className="flex-grow overflow-y-auto p-4 pt-0 m-0 list-none space-y-1 custom-scrollbar">
        {getFilteredTasks().map(task => (
          <li
            key={task.id}
            className={`group bg-[#1f2937]/50 hover:bg-[#1f2937] p-3 rounded-lg border border-transparent hover:border-slate-600 flex items-start gap-3 transition-all ${task.completed ? 'opacity-50' : ''}`}
          >
            {/* Fixed size checkbox */}
            <div className="pt-1 shrink-0">
                <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-amber-600 focus:ring-amber-500 cursor-pointer" 
                    checked={task.completed} 
                    onChange={() => toggleTask(task.id)} 
                />
            </div>
            
            {editingTaskId === task.id ? (
              <input
                autoFocus
                type="text"
                className={`bg-[#374151] text-white rounded px-2 py-0.5 flex-grow outline-none ${activeList.fontSize}`}
                defaultValue={task.text}
                onBlur={(e) => updateTaskText(task.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateTaskText(task.id, e.currentTarget.value)}
              />
            ) : (
              <span 
                className={`flex-grow pt-0.5 break-words ${activeList.fontSize} ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`} 
                onDoubleClick={() => setEditingTaskId(task.id)}
              >
                {task.text}
              </span>
            )}

            {/* Action Bucket */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => setEditingTaskId(task.id)} 
                    className="p-1 text-blue-400 hover:bg-blue-900/30 rounded" 
                    title="Edit Task"
                >
                    <Edit2 size={12} />
                </button>
                <button 
                    onClick={() => deleteTask(task.id)} 
                    className="p-1 text-red-400 hover:bg-red-900/30 rounded" 
                    title="Delete Task"
                >
                    <Trash2 size={12} />
                </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Filters Footer */}
      <div className="flex justify-center gap-2 p-3 border-t border-[#374151] bg-[#1f2937] shrink-0">
        {['all', 'active', 'completed'].map(filter => (
          <button
            key={filter}
            className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all ${todoState.activeFilter === filter ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-gray-300 bg-[#111827]'}`}
            onClick={() => setFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}