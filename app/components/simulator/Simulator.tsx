"use client";
import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { CubieData, AnimatingLayer, generateInitialState } from './constants';
import { RubikCube } from './RubikCube';
import { HistoryLog } from './HistoryLog';
import { ControlPanel } from './ControlPanel';

export default function Simulator() {
  const [cubies, setCubies] = useState<CubieData[]>(generateInitialState());
  const [history, setHistory] = useState<string[]>([]);
  const [activeMove, setActiveMove] = useState<AnimatingLayer | null>(null);
  const isTransitioning = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const dragAngleRef = useRef(0);
  const dragStart = useRef<{ 
    point: THREE.Vector3;
    normal: THREE.Vector3;
    cubiePos: THREE.Vector3
  } | null>(null);

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
// ============================================
// ============================================
  const onPointerDown = (e: any) => {
    e.stopPropagation();
    if (activeMove || isTransitioning.current) return;
    if (!e.object) return;

    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }

    const worldNormal = e.object.position.clone().normalize().round();

    dragStart.current = {
      point: e.point.clone(),
      normal: worldNormal,
      cubiePos: e.object.parent.position.clone().round()
    };
  };

  const onPointerMove = (e: any) => {
    if (!dragStart.current || !controlsRef.current) return;

    const canvas = controlsRef.current.domElement;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const camera = controlsRef.current.object;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      dragStart.current.normal,
      dragStart.current.point
    );

    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    if (!intersectPoint) return;

    const v3d = intersectPoint.clone().sub(dragStart.current.point);
    
    if (v3d.length() < 0.1 && !activeMove) return; 

    const A_raw = new THREE.Vector3().crossVectors(dragStart.current.normal, v3d);

    if (!activeMove) {
      let maxVal = -1;
      let bestAxis: 'x' | 'y' | 'z' = 'x';

      (['x', 'y', 'z'] as const).forEach(ax => {
        if (Math.abs(dragStart.current!.normal[ax]) > 0.5) return; 
        
        const val = Math.abs(A_raw[ax]);
        if (val > maxVal) {
          maxVal = val;
          bestAxis = ax;
        }
      });

      dragAngleRef.current = 0;
      setActiveMove({
        axis: bestAxis,
        layer: dragStart.current.cubiePos[bestAxis],
        target: 0,
        angle: 0,
        isDragging: true
      });
    } else if (activeMove.isDragging) {
      const angleRaw = A_raw[activeMove.axis];
      
      let currentAngle = (angleRaw / 1.2) * (Math.PI / 2);
      
      currentAngle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, currentAngle));
      dragAngleRef.current = currentAngle;
    }
  };

  const onPointerUp = () => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }

    if (activeMove?.isDragging) {
      const threshold = Math.PI / 8; 
      const finalAngle = dragAngleRef.current;
      let finalTarget = 0;

      if (finalAngle > threshold) {
        finalTarget = Math.PI / 2;
      } else if (finalAngle < -threshold) {
        finalTarget = -Math.PI / 2;
      }
      
      setActiveMove(prev => prev ? { 
        ...prev, 
        target: finalTarget, 
        isDragging: false
      } : null);
    }
    dragStart.current = null;
  };
// ============================================
// ============================================
  const handleMove = (move: string) => {
    if (isTransitioning.current || !controlsRef.current) return;
    isTransitioning.current = true;
    setHistory(prev => [...prev, move]);

    const camera = controlsRef.current.object;
    const isPrime = move.includes("'");
    const m = move.replace("'", "");

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

    let directionInfo;
    let target = ["R", "U", "F", "S", "E"].includes(m) ? -Math.PI / 2 : Math.PI / 2;
    let layer = 0;

    if (["R", "L", "M"].includes(m)) {
      directionInfo = getClosestAxis(new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion));
      layer = m === "R" ? 1 : m === "L" ? -1 : 0;
    } else if (["U", "D", "E"].includes(m)) {
      directionInfo = getClosestAxis(new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion));
      layer = m === "U" ? 1 : m === "D" ? -1 : 0;
    } else {
      directionInfo = getClosestAxis(new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion));
      layer = m === "F" ? 1 : m === "B" ? -1 : 0;
    }

    if (directionInfo.dot < 0) { layer *= -1; target *= -1; }
    if (isPrime) target *= -1;

    setActiveMove({ 
      axis: directionInfo.axis as 'x' | 'y' | 'z', 
      layer, 
      angle: 0, 
      target 
    });
  };

  const resetAll = () => {
    setCubies(generateInitialState());
    setHistory([]);
  };

  return (
    <div className="h-auto p-2 lg:p-4 flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-4 items-center">
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
          <HistoryLog 
            history={history} 
            onReset={resetAll} 
            scrollRef={scrollRef as React.RefObject<HTMLDivElement>} 
          />
        </div>
        
        <div className="col-span-12 lg:col-span-5 h-[400px] lg:h-[500px] bg-[#1f2a44] rounded-[32px] relative overflow-hidden border border-slate-200 shadow-inner">
          <Canvas 
            camera={{ position: [5, 5, 5], fov: 55 }} 
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            
            <RubikCube
              cubies={cubies} 
              activeMove={activeMove} 
              setActiveMove={setActiveMove}
              onAnimationEnd={finalizeMove} 
              onPointerDown={onPointerDown} 
              dragAngleRef={dragAngleRef}
            />
            
            <OrbitControls ref={controlsRef} enablePan={false} makeDefault />
            <ContactShadows position={[0, -2.2, 0]} opacity={0.1} scale={10} blur={3} />
          </Canvas>
        </div>

        <ControlPanel onMove={handleMove} onReset={resetAll} />
      </div>

      <style jsx global>{`
        body { background-color: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
