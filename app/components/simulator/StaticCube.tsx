"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RUBIK_CONFIG, COLORS, generateInitialState, CubieData, AnimatingLayer } from './constants';
import { RubikCube } from './RubikCube';

const { PHYSICS } = RUBIK_CONFIG;

interface StaticCubeProps {
  stepId: number;
  subStep: number;
  isPaused?: boolean;
  resetKey?: number;
}

export const StaticCube = ({ stepId, subStep, isPaused = false, resetKey = 0 }: StaticCubeProps) => {
  const [cubies, setCubies] = useState<CubieData[]>([]);
  const [activeMove, setActiveMove] = useState<AnimatingLayer | null>(null);
  const [fov, setFov] = useState(55);
  const moveQueue = useRef<string[]>([]);
  const initialMoveQueue = useRef<string[]>([]);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Responsive FOV adjustment
  useEffect(() => {
    const handleResize = () => {
      setFov(window.innerWidth < 768 ? 65 : 55);
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initCube = useCallback(() => {
    let initialState = generateInitialState(true);
    
    if (stepId === 1) {
      initialState = initialState.map(cubie => {
        const { x, y, z } = cubie.pos;
        const stickers = [...cubie.stickers];
        if (x === 0 && y === 1 && z === 0) stickers[2] = COLORS.bottom;
        if (x === 0 && y === -1 && z === 0) stickers[3] = COLORS.top;

        if (subStep === 1 && y === 0) {
          if (x === 1 && z === 0) stickers[0] = COLORS.right;
          if (x === -1 && z === 0) stickers[1] = COLORS.left;
          if (z === 1 && x === 0) stickers[4] = COLORS.front;
          if (z === -1 && x === 0) stickers[5] = COLORS.back;
        }

        if (y === 1) {
          const isEdge = (Math.abs(x) === 1 && z === 0) || (x === 0 && Math.abs(z) === 1);
          if (isEdge) {
            stickers[2] = COLORS.top;
            if (x === 1) stickers[0] = COLORS.right;
            if (x === -1) stickers[1] = COLORS.front;
            if (z === 1) stickers[4] = COLORS.left;
            if (z === -1) stickers[5] = COLORS.back;
          }
        }
        return { ...cubie, stickers };
      });

      if (subStep === 1) {
        initialMoveQueue.current = ["U'", "F2", "U", "R2", "B2", "U", "L2"];
        moveQueue.current = [...initialMoveQueue.current];
      } else {
        initialMoveQueue.current = [];
        moveQueue.current = [];
      }
    } else if (stepId === 6) {
        initialState = generateInitialState(false);
    } else {
        initialState = generateInitialState(false).map(c => {
            if (c.pos.y > (stepId === 2 ? 0 : -1)) return c;
            return { ...c, stickers: c.stickers.map(s => s === COLORS.inner ? s : COLORS.gray) };
        });
    }

    setCubies(initialState);
    setActiveMove(null);
    
    if (controlsRef.current) {
      controlsRef.current.object.position.set(4, 4, 4);
      controlsRef.current.update();
    }
  }, [stepId, subStep]);

  useEffect(() => {
    initCube();
  }, [initCube, resetKey]); // Also re-init on resetKey change

  const performMove = useCallback((move: string) => {
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const m = move.replace("'", "").replace("2", "");
    
    let axis: 'x' | 'y' | 'z' = 'x';
    let layer = 0;
    let target = isPrime ? Math.PI / 2 : -Math.PI / 2;
    if (isDouble) target = Math.PI;

    if (["R", "L"].includes(m)) { axis = 'x'; layer = m === "R" ? 1 : -1; }
    else if (["U", "D"].includes(m)) { axis = 'y'; layer = m === "U" ? 1 : -1; }
    else if (["F", "B"].includes(m)) { axis = 'z'; layer = m === "F" ? 1 : -1; }

    if (m === "L" || m === "D" || m === "B") target *= -1;

    setActiveMove({ axis, layer, angle: 0, target });
  }, []);

  useEffect(() => {
    if (!activeMove && moveQueue.current.length > 0 && !isPaused) {
      const timer = setTimeout(() => {
        const next = moveQueue.current.shift();
        if (next) performMove(next);
        
        if (moveQueue.current.length === 0 && controlsRef.current) {
          setTimeout(() => {
            const cam = controlsRef.current!.object;
            const targetPos = new THREE.Vector3(4, -4, 4);
            let progress = 0;
            const animateCam = () => {
              progress += 0.02;
              cam.position.lerp(targetPos, progress);
              controlsRef.current?.update();
              if (progress < 1) requestAnimationFrame(animateCam);
            };
            animateCam();
          }, 1000);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeMove, performMove, isPaused]);

  const finalizeMove = useCallback((axis: 'x' | 'y' | 'z', layer: number, targetAngle: number) => {
    setCubies(prev => prev.map(cubie => {
      const val = axis === 'x' ? cubie.pos.x : axis === 'y' ? cubie.pos.y : cubie.pos.z;
      if (Math.abs(val - layer) > PHYSICS.LAYER_THRESHOLD) return cubie;

      const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
      const newPos = cubie.pos.clone().applyAxisAngle(rotationAxis, targetAngle);
      newPos.x = Math.round(newPos.x);
      newPos.y = Math.round(newPos.y);
      newPos.z = Math.round(newPos.z);

      let s = [...cubie.stickers];
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
    setActiveMove(null);
  }, []);

  return (
    <div className="w-full h-full min-h-[350px] relative">
      <Canvas camera={{ position: [4, 4, 4], fov }} frameloop={(activeMove || !isPaused) ? "always" : "demand"} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <RubikCube
          cubies={cubies} 
          activeMove={activeMove} 
          setActiveMove={setActiveMove}
          onAnimationEnd={finalizeMove} 
          onPointerDown={() => {}} 
          dragAngleRef={{ current: 0 } as any}
        />
        <OrbitControls ref={controlsRef} enableZoom={true} enablePan={false} />
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} resolution={128} />
      </Canvas>
    </div>
  );
};
