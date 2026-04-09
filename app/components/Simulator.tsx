"use client";
import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

const COLORS = {
  top: '#FFFFFF',
  bottom: '#FFD700',
  front: '#22C55E',
  back: '#3B82F6',
  right: '#F97316',
  left: '#EF4444',
  inner: '#1E293B'
};

const generateInitialState = () => {
  return Array.from({ length: 27 }).map((_, i) => {
    const x = (i % 3) - 1;
    const y = Math.floor((i / 3) % 3) - 1;
    const z = Math.floor(i / 9) - 1;
    return {
      id: i,
      pos: [x, y, z] as [number, number, number],
      stickers: [
        x === 1 ? COLORS.right : COLORS.inner,
        x === -1 ? COLORS.left : COLORS.inner,
        y === 1 ? COLORS.top : COLORS.inner, 
        y === -1 ? COLORS.bottom : COLORS.inner,
        z === 1 ? COLORS.front : COLORS.inner,
        z === -1 ? COLORS.back : COLORS.inner,
      ]
    };
  });
};

function Cubie({ stickers, position }: { stickers: string[], position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.92, 0.92, 0.92]} />
      {stickers.map((col, i) => (
        <meshStandardMaterial 
          key={i} 
          attach={`material-${i}`} 
          color={col} 
          roughness={0.05}
          metalness={0.1}
        />
      ))}
    </mesh>
  );
}

export default function Simulator() {
  const [cubies, setCubies] = useState(generateInitialState());
  const [history, setHistory] = useState<string[]>([]);
  const isRotating = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rotateLogic = useCallback((axis: 'x' | 'y' | 'z', layer: number, clockwise: boolean) => {
    if (isRotating.current) return;
    isRotating.current = true;

    setCubies(prev => {
      return prev.map(c => {
        const [x, y, z] = c.pos;
        const val = axis === 'x' ? x : axis === 'y' ? y : z;
        if (Math.abs(val - layer) > 0.1) return c;
        let [nx, ny, nz] = [x, y, z];
        let s = [...c.stickers];
        if (axis === 'x') {
          ny = clockwise ? -z : z; nz = clockwise ? y : -y;
          s = clockwise ? [s[0], s[1], s[5], s[4], s[2], s[3]] : [s[0], s[1], s[4], s[5], s[3], s[2]];
        } else if (axis === 'y') {
          nx = clockwise ? z : -z; nz = clockwise ? -x : x;
          s = clockwise ? [s[4], s[5], s[2], s[3], s[1], s[0]] : [s[5], s[4], s[2], s[3], s[0], s[1]];
        } else if (axis === 'z') {
          nx = clockwise ? -y : y; ny = clockwise ? x : -x;
          s = clockwise ? [s[3], s[2], s[0], s[1], s[4], s[5]] : [s[2], s[3], s[1], s[0], s[4], s[5]];
        }
        return { ...c, pos: [nx, ny, nz], stickers: s };
      });
    });
    setTimeout(() => { isRotating.current = false; }, 200);
  }, []);

  const handleMove = (move: string) => {
    if (isRotating.current) return;
    setHistory(prev => [...prev, move]);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);

    const isPrime = move.includes("'");
    const m = move.replace("'", "");
    if (["R", "L", "M"].includes(m)) {
      rotateLogic('x', m === "R" ? 1 : m === "L" ? -1 : 0, (m === "L" || m === "M") ? isPrime : !isPrime);
    } else if (["U", "D", "E"].includes(m)) {
      rotateLogic('y', m === "U" ? 1 : m === "D" ? -1 : 0, (m === "D" || m === "E") ? isPrime : !isPrime);
    } else if (["F", "B", "S"].includes(m)) {
      rotateLogic('z', m === "F" ? 1 : m === "B" ? -1 : 0, (m === "B") ? isPrime : !isPrime);
    }
  };

  return (
    <div className="h-auto p-2 lg:p-4 flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-4 items-center">
        
        {/* Left Panel: History (HIDDEN ON MOBILE) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
          <div className="bg-[#1f2a44] rounded-[24px] p-5 border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-[14px] font-black text-slate-400 mb-3 uppercase tracking-widest">History Log</h3>
            
            <div 
              ref={scrollRef}
              className="h-[180px] overflow-y-auto pr-1 custom-scrollbar"
            >
              <div className="grid grid-cols-3 gap-1.5">
                {history.map((m, i) => (
                  <div 
                    key={i} 
                    className="h-10 flex items-center justify-center rounded-lg font-mono text-sm font-bold bg-slate-800 border border-slate-600 text-yellow-400 shadow-inner animate-in fade-in zoom-in"
                  >
                    {m}
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="col-span-3 h-10 flex items-center justify-center text-sm text-slate-500 italic border border-dashed border-slate-700 rounded-lg">
                    No moves
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => {setCubies(generateInitialState()); setHistory([]);}} 
              className="mt-4 w-full bg-slate-200 hover:bg-red-500 hover:text-white text-slate-600 py-3 rounded-xl text-[14px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="col-span-12 lg:col-span-5 h-[400px] lg:h-[500px] bg-[#1f2a44] rounded-[32px] relative overflow-hidden border border-slate-200 shadow-inner">
          <Canvas camera={{ position: [5, 5, 5], fov: 55 }}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <group>
              {cubies.map((data) => (
                <Cubie key={data.id} stickers={data.stickers} position={data.pos} />
              ))}
            </group>
            <OrbitControls enablePan={false} makeDefault />
            <ContactShadows position={[0, -2.2, 0]} opacity={0.1} scale={10} blur={3} />
          </Canvas>
          {/* <div className="absolute top-4 left-4 bg-slate-800/80 border border-slate-100 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400">
            Simulator
          </div> */}
        </div>

        {/* Right: Controls */}
        <div className="col-span-12 lg:col-span-4 bg-[#1f2a44] rounded-[32px] p-6 border border-slate-200 shadow-sm">
          <div className="mb-6">
            <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Face Moves</p>
            <div className="grid grid-cols-4 gap-1.5">
              {["U", "U'", "D", "D'", "L", "L'", "R", "R'", "F", "F'", "B", "B'"].map(m => (
                <button 
                  key={m} 
                  onClick={() => handleMove(m)} 
                  className="h-12 bg-slate-800 hover:bg-indigo-500 text-white rounded-xl font-mono text-base font-bold transition-all active:scale-95 border border-slate-600 shadow-md"
                >
                  {m}
                </button>
              
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Slices</p>
            <div className="grid grid-cols-3 gap-1.5">
              {["M", "M'", "E", "E'", "S", "S'"].map(m => (
                <button 
                  key={m} 
                  onClick={() => handleMove(m)} 
                  className="h-12 bg-slate-800 hover:bg-indigo-500 text-white rounded-xl font-mono text-base font-bold transition-all active:scale-95 border border-slate-600 shadow-md"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => {setCubies(generateInitialState()); setHistory([]);}} 
            className="lg:hidden mt-6 w-full bg-slate-800 text-red-500 py-3 rounded-xl text-[14px] font-black uppercase tracking-widest border border-slate-200"
          >
            Reset Cube
          </button>
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
