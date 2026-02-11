import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Move, 
  Plus, 
  Type, 
  Box, 
  Trash2, 
  Settings, 
  Play, 
  MousePointer2, 
  Terminal,
  Palette,
  Layout,
  Circle,
  Save
} from 'lucide-react';

const UI_INITIAL_ELEMENTS = [
  {
    id: 'header-1',
    type: 'text',
    content: 'SYSTEM ONLINE',
    style: {
      x: 300,
      y: 50,
      width: 300,
      height: 60,
      backgroundColor: 'transparent',
      color: '#00ff9d',
      fontSize: '32px',
      fontWeight: 'bold',
      textAlign: 'center',
      borderWidth: 0,
      borderRadius: 0,
      zIndex: 1,
    }
  },
  {
    id: 'btn-start',
    type: 'button',
    content: 'INITIALIZE',
    style: {
      x: 350,
      y: 250,
      width: 200,
      height: 50,
      backgroundColor: '#00ff9d',
      color: '#000000',
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      borderWidth: 0,
      borderRadius: 4,
      zIndex: 2,
    }
  },
  {
    id: 'panel-bg',
    type: 'box',
    content: '',
    style: {
      x: 250,
      y: 150,
      width: 400,
      height: 300,
      backgroundColor: 'rgba(0, 20, 10, 0.8)',
      borderColor: '#00ff9d',
      borderWidth: 2,
      borderRadius: 8,
      zIndex: 0,
    }
  }
];

export default function UIBuilder() {
  const [mode, setMode] = useState('play'); 
  
  const [elements, setElements] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('shaboygan-layout');
        return saved ? JSON.parse(saved) : UI_INITIAL_ELEMENTS;
    }
    return UI_INITIAL_ELEMENTS;
  });

  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState(['System ready...', 'Waiting for user input...']);
   
  const canvasRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 8));
  };

  const saveLayout = () => {
    localStorage.setItem('shaboygan-layout', JSON.stringify(elements));
    addLog('> Layout saved to memory.');
  };

  const handleElementClick = (e, element) => {
    if (mode === 'edit') {
      e.stopPropagation();
      setSelectedId(element.id);
    } else {
      if (element.type === 'button') {
        addLog(`> Executed: ${element.content}`);
        const el = document.getElementById(element.id);
        if (el) {
          el.style.transform = 'scale(0.95)';
          setTimeout(() => el.style.transform = 'scale(1)', 100);
        }
      }
    }
  };

  const updateElement = useCallback((id, newProps) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...newProps } : el
    ));
  }, []);

  const updateStyle = useCallback((id, newStyle) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, style: { ...el.style, ...newStyle } } : el
    ));
  }, []);

  const addElement = (type) => {
    const newId = `el-${Date.now()}`;
    const baseStyle = {
      x: 100,
      y: 100,
      zIndex: elements.length + 1,
    };

    let newElement = { id: newId, type, style: baseStyle };

    if (type === 'button') {
      newElement = { ...newElement, content: 'NEW BUTTON', style: { ...baseStyle, width: 140, height: 40, backgroundColor: '#3b82f6', color: 'white', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } };
    } else if (type === 'text') {
      newElement = { ...newElement, content: 'New Text Label', style: { ...baseStyle, width: 200, height: 30, color: '#ffffff', backgroundColor: 'transparent', fontSize: '16px' } };
    } else if (type === 'box') {
      newElement = { ...newElement, content: '', style: { ...baseStyle, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#ffffff', borderWidth: 1, borderRadius: 8 } };
    } else if (type === 'circle') {
       newElement = { ...newElement, type: 'box', content: '', style: { ...baseStyle, width: 80, height: 80, backgroundColor: '#ef4444', borderRadius: 9999 } };
    }

    setElements(prev => [...prev, newElement]);
    setSelectedId(newId);
    addLog(`> Spawned new ${type} node.`);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(prev => prev.filter(el => el.id !== selectedId));
      setSelectedId(null);
      addLog('> Node deleted.');
    }
  };

  const handleMouseDown = (e, id) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    const element = elements.find(el => el.id === id);
    if (!element) return;

    setDraggingId(id);
    setSelectedId(id);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    
    setDragOffset({
      x: relX - element.style.x,
      y: relY - element.style.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggingId || mode !== 'edit') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const newX = relX - dragOffset.x;
    const newY = relY - dragOffset.y;

    updateStyle(draggingId, { x: newX, y: newY });
  }, [draggingId, mode, dragOffset, updateStyle]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);

  const renderPropertiesPanel = () => {
    if (!selectedId) return <div className="text-gray-500 text-sm italic p-4">Select an element to edit properties.</div>;

    const el = elements.find(e => e.id === selectedId);
    if (!el) return null;

    return (
      <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <h3 className="font-bold text-white">Properties</h3>
          <span className="text-xs text-gray-400 font-mono">{el.id}</span>
        </div>

        {el.type !== 'box' && el.type !== 'circle' && (
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Content / Label</label>
            <input type="text" value={el.content || ''} onChange={(e) => updateElement(selectedId, { content: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Width</label>
            <input type="number" value={parseInt(el.style.width) || 0} onChange={(e) => updateStyle(selectedId, { width: parseInt(e.target.value) || 0 })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Height</label>
            <input type="number" value={parseInt(el.style.height) || 0} onChange={(e) => updateStyle(selectedId, { height: parseInt(e.target.value) || 0 })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={(el.style.backgroundColor === 'transparent' || !el.style.backgroundColor) ? '#000000' : el.style.backgroundColor} onChange={(e) => updateStyle(selectedId, { backgroundColor: e.target.value })} className="h-8 w-8 bg-transparent border-0 cursor-pointer" />
            <input type="text" value={el.style.backgroundColor || ''} onChange={(e) => updateStyle(selectedId, { backgroundColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Text/Border Color</label>
          <div className="flex gap-2">
            <input type="color" value={el.style.color || el.style.borderColor || '#ffffff'} onChange={(e) => updateStyle(selectedId, { color: e.target.value, borderColor: e.target.value })} className="h-8 w-8 bg-transparent border-0 cursor-pointer" />
            <input type="text" value={el.style.color || el.style.borderColor || ''} onChange={(e) => updateStyle(selectedId, { color: e.target.value, borderColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Font Size (px)</label>
          <input type="number" value={parseInt(el.style.fontSize) || 16} onChange={(e) => updateStyle(selectedId, { fontSize: `${e.target.value}px` })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
        </div>

         <div className="space-y-1">
          <label className="text-xs text-gray-400">Corner Radius (px)</label>
          <input type="number" value={parseInt(el.style.borderRadius) || 0} onChange={(e) => updateStyle(selectedId, { borderRadius: parseInt(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
        </div>

         <div className="space-y-1">
          <label className="text-xs text-gray-400">Layer (Z-Index)</label>
          <input type="number" value={parseInt(el.style.zIndex) || 0} onChange={(e) => updateStyle(selectedId, { zIndex: parseInt(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
        </div>

        <button onClick={deleteSelected} className="w-full mt-4 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 p-2 rounded flex items-center justify-center gap-2 transition-colors">
          <Trash2 size={16} /> Delete Element
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-gray-950 text-gray-100 overflow-hidden font-sans select-none">
      <div 
        ref={canvasRef}
        className={`relative flex-1 bg-gray-900 overflow-hidden transition-colors duration-500 ${mode === 'edit' ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1f2937 1px, transparent 0)', backgroundSize: '40px 40px' }}
        onClick={() => setSelectedId(null)}
      >
        {elements.map(el => (
          <div
            id={el.id}
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
            onClick={(e) => handleElementClick(e, el)}
            className={`absolute flex items-center justify-center transition-shadow border-box ${mode === 'edit' && selectedId === el.id ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-900/20' : ''} ${mode === 'play' && el.type === 'button' ? 'hover:brightness-110 active:brightness-90' : ''}`}
            style={{
              left: el.style.x,
              top: el.style.y,
              width: el.style.width,
              height: el.style.height,
              backgroundColor: el.style.backgroundColor,
              color: el.style.color,
              borderColor: el.style.borderColor,
              borderWidth: el.style.borderWidth,
              borderStyle: el.style.borderWidth ? 'solid' : 'none',
              borderRadius: el.style.borderRadius,
              fontSize: el.style.fontSize,
              fontWeight: el.style.fontWeight,
              zIndex: el.style.zIndex,
              cursor: mode === 'edit' ? 'move' : (el.type === 'button' ? 'pointer' : 'default'),
              userSelect: 'none',
              boxSizing: 'border-box'
            }}
          >
            {el.content}
          </div>
        ))}
        <div className="absolute top-4 left-4 pointer-events-none z-50">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${mode === 'edit' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-green-500/20 border-green-500 text-green-500'}`}>
                {mode === 'edit' ? 'EDIT MODE ENABLED' : 'PLAY MODE ACTIVE'}
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none z-50">
          <div className="w-full max-w-lg bg-black/80 backdrop-blur border-t-2 border-r-2 border-gray-800 rounded-tr-xl p-3 font-mono text-xs text-green-400">
            <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800 pb-1">
              <Terminal size={12} />
              <span>SYSTEM LOG</span>
            </div>
            {logs.map((log, i) => (<div key={i} className="opacity-80">{log}</div>))}
          </div>
        </div>
      </div>

      <div className={`w-80 bg-gray-900 border-l border-gray-800 flex flex-col transition-all duration-300 ${mode === 'play' ? 'w-16' : ''}`}>
        <div className="p-2 border-b border-gray-800 space-y-2">
            <button onClick={() => setMode(mode === 'play' ? 'edit' : 'play')} className={`w-full p-3 rounded flex items-center justify-center gap-2 font-bold transition-all ${mode === 'edit' ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'}`} title={mode === 'edit' ? 'Switch to Play Mode' : 'Switch to Edit Mode'}>
                {mode === 'play' ? <Settings size={20} /> : <Play size={20} />}
                {mode === 'edit' && "RUN GAME"}
            </button>
            <button onClick={saveLayout} className="w-full p-3 bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-300 rounded flex items-center justify-center gap-2 transition-colors border border-gray-700" title="Save Layout">
                <Save size={20} />
                {mode === 'edit' && "SAVE LAYOUT"}
            </button>
        </div>

        {mode === 'edit' && (
          <>
            <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-800">
               <div className="col-span-2 text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Create</div>
               <button onClick={() => addElement('button')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <MousePointer2 size={16} className="text-blue-400"/><span className="text-xs">Button</span>
               </button>
               <button onClick={() => addElement('text')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <Type size={16} className="text-green-400"/><span className="text-xs">Label</span>
               </button>
               <button onClick={() => addElement('box')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <Box size={16} className="text-purple-400"/><span className="text-xs">Container</span>
               </button>
               <button onClick={() => addElement('circle')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex flex-col items-center gap-1 transition-colors text-gray-200">
                  <Circle size={16} className="text-red-400"/><span className="text-xs">Circle</span>
               </button>
            </div>
            <div className="flex-1 overflow-hidden">{renderPropertiesPanel()}</div>
          </>
        )}
        
        {mode === 'play' && (
            <div className="flex-1 flex flex-col items-center gap-4 py-4 text-gray-600">
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="writing-vertical-rl text-xs uppercase tracking-widest opacity-50" style={{ writingMode: 'vertical-rl' }}>Game Running</div>
            </div>
        )}
      </div>
    </div>
  );
}