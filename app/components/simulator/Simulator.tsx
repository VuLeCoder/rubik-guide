"use client";
import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { RUBIK_CONFIG, CubieData, AnimatingLayer, generateInitialState } from './constants';
import { RubikCube } from './RubikCube';
import { HistoryLog } from './HistoryLog';
import { ControlPanel } from './ControlPanel';

const {PHYSICS, SCENE} = RUBIK_CONFIG;

const MAX_QUEUE = 3;
const tempVector = new THREE.Vector3();
const tempMouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const intersectPoint = new THREE.Vector3();
const tempPlane = new THREE.Plane();

export default function Simulator() {
  const [cubies, setCubies] = useState<CubieData[]>(generateInitialState());
  const [history, setHistory] = useState<string[]>([]);
  const [activeMove, setActiveMove] = useState<AnimatingLayer | null>(null);
  
  // Use a ref for activeMove to keep callbacks stable
  const activeMoveRef = useRef<AnimatingLayer | null>(null);
  const isTransitioning = useRef(false);
  const moveQueue = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const dragAngleRef = useRef(0);
  const dragStart = useRef<{ 
    point: THREE.Vector3;
    normal: THREE.Vector3;
    cubiePos: THREE.Vector3
  } | null>(null);
  const [queueLength, setQueueLength] = useState(0);
  const [inputLocked, setInputLocked] = useState(false);

  // Sync ref with state
  const setActiveMoveWithRef: React.Dispatch<React.SetStateAction<AnimatingLayer | null>> = useCallback((value) => {
    setActiveMove((prevState) => {
      const newState = typeof value === 'function' ? (value as any)(prevState) : value;
      activeMoveRef.current = newState;
      return newState;
    });
  }, []);

  const performMove = useCallback((move: string) => {
    if (!controlsRef.current) return;
    isTransitioning.current = true;
    setHistory(prev => [...prev, move]);

    const camera = controlsRef.current.object;
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const m = move.replace("'", "").replace("2", "");

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
    if (isDouble) target *= 2;
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

    setActiveMoveWithRef({ 
      axis: directionInfo.axis as 'x' | 'y' | 'z', 
      layer, 
      angle: 0, 
      target 
    });
  }, [setActiveMoveWithRef]);

  // Handle queue processing via useEffect to ensure React has rendered the state updates
  React.useEffect(() => {
    if (!activeMove && !isTransitioning.current && moveQueue.current.length === 0) {
      setInputLocked(false);
    }

    if (!activeMove && !isTransitioning.current && moveQueue.current.length > 0) {
      const nextMove = moveQueue.current.shift();
      setQueueLength(moveQueue.current.length);
      if (nextMove) performMove(nextMove);
    }
  }, [activeMove, performMove]);

  const finalizeMove = useCallback((axis: 'x' | 'y' | 'z', layer: number | number[], targetAngle: number) => {
    setCubies(prev => prev.map(cubie => {
      const val = axis === 'x' ? cubie.pos.x : axis === 'y' ? cubie.pos.y : cubie.pos.z;
      
      // Check if the cubie is in the target layer(s)
      const isInLayer = Array.isArray(layer) 
        ? layer.some(l => Math.abs(val - l) <= PHYSICS.LAYER_THRESHOLD)
        : Math.abs(val - layer) <= PHYSICS.LAYER_THRESHOLD;

      if (!isInLayer) return cubie;

      const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
      const newPos = cubie.pos.clone().applyAxisAngle(rotationAxis, targetAngle);
      
      // Round to nearest integer to snap to the grid
      newPos.x = Math.round(newPos.x);
      newPos.y = Math.round(newPos.y);
      newPos.z = Math.round(newPos.z);

      const s = [...cubie.stickers];
      let angle = targetAngle;
      while (angle < 0) angle += Math.PI * 2;
      const steps = Math.round(angle / (Math.PI / 2)) % 4;

      for (let i = 0; i < steps; i++) {
        const p = [...s];
        if (axis === 'x') {
          s[4] = p[2]; s[3] = p[4]; s[5] = p[3]; s[2] = p[5];
        } else if (axis === 'y') {
          s[0] = p[4]; s[5] = p[0]; s[1] = p[5]; s[4] = p[1];
        } else if (axis === 'z') {
          s[1] = p[2]; s[3] = p[1]; s[0] = p[3]; s[2] = p[0];
        }
      }
      return { ...cubie, pos: newPos, stickers: s };
    }));

    setActiveMoveWithRef(null);
    isTransitioning.current = false;
  }, [setActiveMoveWithRef]);

  // Stable callback for pointer down
  const onPointerDown = useCallback((e: any) => {
    e.stopPropagation();
    if (!e.object) return;

    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }

    if (moveQueue.current.length >= MAX_QUEUE) return;

    const worldNormal = e.object.position.clone().normalize().round();

    dragStart.current = {
      point: e.point.clone(),
      normal: worldNormal,
      cubiePos: e.object.parent.position.clone().round()
    };
  }, []); // No dependencies makes this stable

  const onPointerMove = useCallback((e: any) => {
    if (!dragStart.current || !controlsRef.current) return;

    const canvas = controlsRef.current!.domElement;
    const rect = canvas!.getBoundingClientRect();
    
    tempMouse.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const camera = controlsRef.current.object;
    raycaster.setFromCamera(tempMouse, camera);

    tempPlane.setFromNormalAndCoplanarPoint(
      dragStart.current.normal,
      dragStart.current.point
    );

    raycaster.ray.intersectPlane(tempPlane, intersectPoint);
    if (!intersectPoint) return;

    const v3d = tempVector.subVectors(intersectPoint, dragStart.current.point);
    if (v3d.length() < PHYSICS.DRAG_DISTANCE_MIN && !activeMoveRef.current) return; 

    const A_raw = new THREE.Vector3().crossVectors(dragStart.current.normal, v3d);

    if (!activeMoveRef.current) {
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
      setActiveMoveWithRef({
        axis: bestAxis,
        layer: dragStart.current.cubiePos[bestAxis],
        target: 0,
        angle: 0,
        isDragging: true
      });
    } else if (activeMoveRef.current.isDragging) {
      const angleRaw = A_raw[activeMoveRef.current.axis];
      const currentAngle = (angleRaw / PHYSICS.DRAG_SENSITIVITY) * (Math.PI / 2);
      dragAngleRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, currentAngle));
    }
  }, [setActiveMoveWithRef]);

  const onPointerUp = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }

    if (activeMoveRef.current?.isDragging) { 
      const finalAngle = dragAngleRef.current;
      let finalTarget = 0;

      if (finalAngle > PHYSICS.SNAP_THRESHOLD) {
        finalTarget = Math.PI / 2;
      } else if (finalAngle < -PHYSICS.SNAP_THRESHOLD) {
        finalTarget = -Math.PI / 2;
      }
      
      setActiveMoveWithRef({ 
        ...activeMoveRef.current, 
        target: finalTarget, 
        isDragging: false
      });
    }
    dragStart.current = null;
  }, [setActiveMoveWithRef]);

  const handleMove = useCallback((move: string) => {
    if (inputLocked) {
      return;
    }

    if (moveQueue.current.length >= MAX_QUEUE) {
      setInputLocked(true);
      return;
    }

    if (isTransitioning.current || activeMoveRef.current) {
      moveQueue.current.push(move);
      setQueueLength(moveQueue.current.length);

      if (moveQueue.current.length >= MAX_QUEUE) {
        setInputLocked(true);
      }
    } else {
      performMove(move);
    }
  }, [performMove, inputLocked]);

  const resetAll = useCallback(() => {
    setCubies(generateInitialState());
    setHistory([]);
    moveQueue.current = [];
    setQueueLength(0);
    setActiveMoveWithRef(null);
    isTransitioning.current = false;
  }, [setActiveMoveWithRef]);

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
            camera={{ position: SCENE.CAMERA_POS, fov: SCENE.CAMERA_FOV }} 
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            // dpr={[1, 2]} // Limit pixel ratio for performance
            dpr={1}
            gl={{ antialias: true, preserveDrawingBuffer: true }}
          >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            {/* <Environment preset="city" /> */}

            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            <ambientLight intensity={SCENE.LIGHT_INTENSITY} />
            
            <RubikCube
              cubies={cubies} 
              activeMove={activeMove} 
              setActiveMove={setActiveMoveWithRef}
              onAnimationEnd={finalizeMove} 
              onPointerDown={onPointerDown} 
              dragAngleRef={dragAngleRef}
            />
            
            <OrbitControls ref={controlsRef} enablePan={false} makeDefault />
            <ContactShadows
              position={SCENE.SHADOW.POSITION}
              opacity={SCENE.SHADOW.OPACITY}
              scale={SCENE.SHADOW.SCALE}
              blur={SCENE.SHADOW.BLUR}
              far={10}
              resolution={128} // <--- GIẢM TỪ 256 XUỐNG 128
              frames={1} // <--- CHỈ VẼ SHADOW 1 LẦN (giúp giảm tải cực lớn khi xoay)
            />
          </Canvas>
        </div>

        <ControlPanel
          onMove={handleMove}
          onReset={resetAll}
          disabled={inputLocked}
        />
      </div>

      <style jsx global>{`
        body { background-color: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
