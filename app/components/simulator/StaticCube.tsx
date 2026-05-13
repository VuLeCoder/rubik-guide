"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RUBIK_CONFIG, COLORS, generateInitialState, CubieData, AnimatingLayer } from './constants';
import { RubikCube } from './RubikCube';
import { STEPS } from '../learn/constants';

const { SCENE, PHYSICS } = RUBIK_CONFIG;

interface StaticCubeProps {
  stepId: number;
  subStep: number;
  caseId?: number;
  isPaused?: boolean;
  resetKey?: number;
}

// Internal component that contains the 3D scene logic
const StaticCubeContent = ({ stepId, subStep, caseId, isPaused = false, resetKey = 0 }: StaticCubeProps) => {
  const [cubies, setCubies] = useState<CubieData[]>([]);
  const [activeMove, setActiveMove] = useState<AnimatingLayer | null>(null);
  const moveQueue = useRef<string[]>([]);
  const initialMoveQueue = useRef<string[]>([]);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const initCube = useCallback(() => {
    let initialState = generateInitialState(true);
    
    if (stepId === 1) {
      initialState = initialState.map(cubie => {
        const { x, y, z } = cubie.pos;
        const stickers = [...cubie.stickers];
        
        // Show all centers for Step 1
        if (x === 0 && y === 1 && z === 0) stickers[2] = COLORS.top;
        if (x === 0 && y === -1 && z === 0) stickers[3] = COLORS.bottom;

        // Substep 1: Daisy Creation - Show the RESULT directly as requested
        if (subStep === 0) {
          if (y === 1) {
            const isEdge = (Math.abs(x) === 1 && z === 0) || (x === 0 && Math.abs(z) === 1);
            if (isEdge) {
              stickers[2] = COLORS.bottom; // White edges on top
              // Align side colors correctly for the target state
              if (x === 1) stickers[0] = COLORS.left;
              if (x === -1) stickers[1] = COLORS.back;
              if (z === 1) stickers[4] = COLORS.front;
              if (z === -1) stickers[5] = COLORS.right;
            }
          }
        }

        // Substep 2: Cross - Daisy is ready but side colors are misaligned
        if (subStep === 1) {
          if (x === 1 && y === 0 && z === 0) stickers[0] = COLORS.left;
          if (x === -1 && y === 0 && z === 0) stickers[1] = COLORS.back;
          if (x === 0 && y === 0 && z === 1) stickers[4] = COLORS.front;
          if (x === 0 && y === 0 && z === -1) stickers[5] = COLORS.right;

          if (y === 1) {
            const isEdge = (Math.abs(x) === 1 && z === 0) || (x === 0 && Math.abs(z) === 1);
            if (isEdge) {
              stickers[2] = COLORS.bottom; // White on top face
              // Misalign side colors (Shifted by 1)
              if (x === 1) stickers[0] = COLORS.back;   // Right edge has Back color
              if (x === -1) stickers[1] = COLORS.front; // Left edge has Front color
              if (z === 1) stickers[4] = COLORS.right;  // Front edge has Right color
              if (z === -1) stickers[5] = COLORS.left;  // Back edge has Left color
            }
          }
        }
        return { ...cubie, stickers };
      });

      if (subStep === 0) {
        initialMoveQueue.current = [];
        moveQueue.current = [];
      } else if (subStep === 1) {
        initialMoveQueue.current = ["U'", "F2", "U'", "L2", "B2", "U'", "R2"];
        moveQueue.current = [...initialMoveQueue.current];
      }
    } else if (stepId === 6) {
        initialState = generateInitialState(false);
    } else {
        initialState = generateInitialState(false).map(c => {
            // White is bottom (-Y), Yellow is top (+Y)
            let show = true;
            if (stepId === 2) show = c.pos.y < 0;
            else if (stepId === 3) show = c.pos.y < 1;
            
            if (show) return c;
            return { ...c, stickers: c.stickers.map(s => s === COLORS.inner ? s : COLORS.gray) };
        });
    }

    setCubies(initialState);
    setActiveMove(null);

    // Handle Cases for Step 2
    if (stepId === 2 && caseId !== undefined) {
      const step = STEPS.find(s => s.id === 2);
      const sub = step?.subSteps[subStep];
      const c = sub?.cases?.find(cs => cs.id === caseId);
      
      if (c && c.initMoves) {
        // Apply initMoves immediately without animation to setup the case
        let tempCubies = initialState;
        c.initMoves.forEach(move => {
          tempCubies = simulateMove(tempCubies, move);
        });
        setCubies(tempCubies);
        
        // Setup the animation queue with the formula
        initialMoveQueue.current = c.formula.split(' ');
        moveQueue.current = [...initialMoveQueue.current];
      }
    }
    
    if (controlsRef.current) {
      controlsRef.current.object.position.set(4, 4, 4);
      controlsRef.current.update();
    }
  }, [stepId, subStep, caseId]);

  // Helper to simulate move without animation
  const simulateMove = (currentCubies: CubieData[], move: string): CubieData[] => {
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const m = move.replace("'", "").replace("2", "");
    
    let axis: 'x' | 'y' | 'z' = 'x';
    let layer = 0;
    let targetAngle = isPrime ? Math.PI / 2 : -Math.PI / 2;
    if (isDouble) targetAngle = Math.PI;

    if (["R", "L"].includes(m)) { axis = 'x'; layer = m === "R" ? 1 : -1; }
    else if (["U", "D"].includes(m)) { axis = 'y'; layer = m === "U" ? 1 : -1; }
    else if (["F", "B"].includes(m)) { axis = 'z'; layer = m === "F" ? 1 : -1; }

    if (m === "L" || m === "D" || m === "B") targetAngle *= -1;

    return currentCubies.map(cubie => {
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
    });
  };

  useEffect(() => {
    initCube();
  }, [initCube, resetKey]);

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
      }, 300);
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
    <>
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <ambientLight intensity={SCENE.LIGHT_INTENSITY} />
      <RubikCube
        cubies={cubies} 
        activeMove={activeMove} 
        setActiveMove={setActiveMove}
        onAnimationEnd={finalizeMove} 
        onPointerDown={() => {}} 
        dragAngleRef={{ current: 0 } as any}
      />
      <OrbitControls ref={controlsRef} enableZoom={true} enablePan={false} />
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} resolution={128} frames={1} />
    </>
  );
};

export const StaticCube = (props: StaticCubeProps) => {
  return (
    <div className="w-full h-full relative">
      <View className="w-full h-full">
        <StaticCubeContent {...props} />
      </View>
    </div>
  );
};
