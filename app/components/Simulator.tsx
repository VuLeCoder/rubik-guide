"use client";
import React, { useState, useCallback, useRef } from 'react';
import { Canvas, useFrame, RootState } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CubieData {
  id: number;
  pos: THREE.Vector3;
  stickers: string[];
}

interface AnimatingLayer {
  axis: 'x' | 'y' | 'z';
  layer: number;
  angle: number;
  target: number;
}

const COLORS = {
  top: '#FFFFFF',
  bottom: '#FFD700',
  front: '#22C55E',
  back: '#3B82F6',
  right: '#F97316',
  left: '#EF4444',
  inner: '#1E293B'
};

const generateInitialState = (): CubieData[] => {
  return Array.from({ length: 27 }).map((_, i) => {
    const x = (i % 3) - 1;
    const y = Math.floor((i / 3) % 3) - 1;
    const z = Math.floor(i / 9) - 1;
    return {
      id: i,
      pos: new THREE.Vector3(x, y, z),
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

function Cubie({ stickers, position }: { stickers: string[], position: THREE.Vector3 }) {
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

// Xử lý Animation
function RubikCube({ cubies, activeMove, onAnimationEnd }: { 
  cubies: CubieData[], 
  activeMove: AnimatingLayer | null,
  onAnimationEnd: (axis: 'x' | 'y' | 'z', layer: number, target: number) => void 
}) {
  const rotationGroupRef = useRef<THREE.Group>(null);
  const rotationAngleRef = useRef(0);

  useFrame((_state: RootState, delta: number) => {
    if (activeMove && rotationGroupRef.current) {
      // tốc độ xoay
      const step = (Math.PI / 2) * (delta / 0.4);
      
      if (Math.abs(rotationAngleRef.current) < Math.abs(activeMove.target)) {
        rotationAngleRef.current += (activeMove.target > 0 ? step : -step);
        
        if (Math.abs(rotationAngleRef.current) >= Math.abs(activeMove.target)) {
          onAnimationEnd(activeMove.axis, activeMove.layer, activeMove.target);

          requestAnimationFrame(() => {
            rotationAngleRef.current = 0;
            if (rotationGroupRef.current) {
              rotationGroupRef.current.rotation.set(0, 0, 0);
            }
          });

        } else {
          const axis = activeMove.axis;
          if (axis === 'x') rotationGroupRef.current.rotation.x = rotationAngleRef.current;
          if (axis === 'y') rotationGroupRef.current.rotation.y = rotationAngleRef.current;
          if (axis === 'z') rotationGroupRef.current.rotation.z = rotationAngleRef.current;
        }
      }
    }
  });

  return (
    <group>
      {cubies.filter(c => {
        if (!activeMove) return true;
        const val = activeMove.axis === 'x' ? c.pos.x : activeMove.axis === 'y' ? c.pos.y : c.pos.z;
        return Math.abs(val - activeMove.layer) > 0.1;
      }).map(data => (
        <Cubie key={data.id} stickers={data.stickers} position={data.pos} />
      ))}

      <group ref={rotationGroupRef}>
        {cubies.filter(c => {
          if (!activeMove) return false;
          const val = activeMove.axis === 'x' ? c.pos.x : activeMove.axis === 'y' ? c.pos.y : c.pos.z;
          return Math.abs(val - activeMove.layer) <= 0.1;
        }).map(data => (
          <Cubie key={data.id} stickers={data.stickers} position={data.pos} />
        ))}
      </group>
    </group>
  );
}

export default function Simulator() {
  const [cubies, setCubies] = useState<CubieData[]>(generateInitialState());
  const [history, setHistory] = useState<string[]>([]);
  const [activeMove, setActiveMove] = useState<AnimatingLayer | null>(null);
  const isTransitioning = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const finalizeMove = useCallback((axis: 'x' | 'y' | 'z', layer: number, targetAngle: number) => {
    setCubies(prev => prev.map(cubie => {
      const val = axis === 'x' ? cubie.pos.x : axis === 'y' ? cubie.pos.y : cubie.pos.z;
      if (Math.abs(val - layer) > 0.1) return cubie;

      const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
      const newPos = cubie.pos.clone().applyAxisAngle(rotationAxis, targetAngle);
      newPos.x = Math.round(newPos.x);
      newPos.y = Math.round(newPos.y);
      newPos.z = Math.round(newPos.z);

      let s = [...cubie.stickers];
      const isClockwise = targetAngle < 0;
      if (axis === 'x') {
        s = isClockwise ? [s[0], s[1], s[4], s[5], s[3], s[2]] : [s[0], s[1], s[5], s[4], s[2], s[3]];
      } else if (axis === 'y') {
        s = isClockwise ? [s[5], s[4], s[2], s[3], s[0], s[1]] : [s[4], s[5], s[2], s[3], s[1], s[0]];
      } else if (axis === 'z') {
        s = isClockwise ? [s[2], s[3], s[1], s[0], s[4], s[5]] : [s[3], s[2], s[0], s[1], s[4], s[5]];
      }
      return { ...cubie, pos: newPos, stickers: s };
    }));

    setActiveMove(null);
    isTransitioning.current = false;
  }, []);

  const handleMove = (move: string) => {
    if (isTransitioning.current || !controlsRef.current) return;
    isTransitioning.current = true;
    setHistory(prev => [...prev, move]);

    const camera = controlsRef.current.object;
    const isPrime = move.includes("'");
    const m = move.replace("'", "");

    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const cameraForward = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);

    const getClosestAxis = (vec: THREE.Vector3) => {
      const axes = [
        { axis: 'x', dot: vec.dot(new THREE.Vector3(1, 0, 0)) },
        { axis: 'x', dot: vec.dot(new THREE.Vector3(-1, 0, 0)) },
        { axis: 'y', dot: vec.dot(new THREE.Vector3(0, 1, 0)) },
        { axis: 'y', dot: vec.dot(new THREE.Vector3(0, -1, 0)) },
        { axis: 'z', dot: vec.dot(new THREE.Vector3(0, 0, 1)) },
        { axis: 'z', dot: vec.dot(new THREE.Vector3(0, 0, -1)) },
      ];
      return axes.reduce((prev, curr) => Math.abs(curr.dot) > Math.abs(prev.dot) ? curr : prev);
    };

    let axis: 'x' | 'y' | 'z' = 'x';
    let layer = 0;
    let target = Math.PI / 2;

    const isClockwiseBase = ["R", "U", "F", "S", "E"].includes(m);
    target = isClockwiseBase ? -Math.PI / 2 : Math.PI / 2;

    let directionInfo;
    if (["R", "L", "M"].includes(m)) {
      directionInfo = getClosestAxis(cameraRight);
      layer = m === "R" ? 1 : m === "L" ? -1 : 0;
      if (directionInfo.dot < 0) {
        layer *= -1;
        target *= -1;
      }
    } else if (["U", "D", "E"].includes(m)) {
      directionInfo = getClosestAxis(cameraUp);
      layer = m === "U" ? 1 : m === "D" ? -1 : 0;
      if (directionInfo.dot < 0) {
        layer *= -1;
        target *= -1;
      }
    } else if (["F", "B", "S"].includes(m)) {
      directionInfo = getClosestAxis(cameraForward);
      layer = m === "F" ? 1 : m === "B" ? -1 : 0;
      if (directionInfo.dot < 0) {
        layer *= -1;
        target *= -1;
      }
    }

    axis = directionInfo?.axis as 'x' | 'y' | 'z';

    if(isPrime) target *= -1;

    setActiveMove({ axis, layer, angle: 0, target });
  };

  return (
    <div className="h-auto p-2 lg:p-4 flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-4 items-center">
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
          <div className="bg-[#1f2a44] rounded-[24px] p-5 border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-[14px] font-black text-slate-400 mb-3 uppercase tracking-widest">History Log</h3>
            <div ref={scrollRef} className="h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-3 gap-1.5">
                {history.map((m, i) => (
                  <div key={i} className="h-10 flex items-center justify-center rounded-lg font-mono text-sm font-bold bg-slate-800 border border-slate-600 text-yellow-400 shadow-inner">
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
        
        <div className="col-span-12 lg:col-span-5 h-[400px] lg:h-[500px] bg-[#1f2a44] rounded-[32px] relative overflow-hidden border border-slate-200 shadow-inner">
          <Canvas camera={{ position: [5, 5, 5], fov: 55 }}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <RubikCube cubies={cubies} activeMove={activeMove} onAnimationEnd={finalizeMove} />
            
            <OrbitControls ref={controlsRef} enablePan={false} makeDefault />
            <ContactShadows position={[0, -2.2, 0]} opacity={0.1} scale={10} blur={3} />
          </Canvas>
        </div>

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
